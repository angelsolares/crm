<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\ProposalItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProposalService
{
    /**
     * Get paginated list of proposals.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Proposal::query()
            ->with(['project.organization', 'creator', 'items']);

        // Filter by project
        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by creator
        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        // Filter by date range
        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        // Filter expired proposals
        if (!empty($filters['expired'])) {
            if ($filters['expired'] === 'true' || $filters['expired'] === true) {
                $query->where('valid_until', '<', now());
            } else {
                $query->where(function ($q) {
                    $q->whereNull('valid_until')
                      ->orWhere('valid_until', '>=', now());
                });
            }
        }

        // Search by title or reference number
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', '%' . $search . '%')
                  ->orWhere('reference_number', 'ilike', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Get proposal by ID.
     */
    public function get(string $id): ?Proposal
    {
        return Proposal::with([
            'project.organization',
            'project.primaryContact',
            'creator',
            'items'
        ])->find($id);
    }

    /**
     * Create a new proposal.
     */
    public function create(array $data, ?string $userId = null): Proposal
    {
        return DB::transaction(function () use ($data, $userId) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $data['id'] = (string) Str::uuid();
            $data['created_by'] = $userId ?? $data['created_by'] ?? null;
            $data['status'] = $data['status'] ?? Proposal::STATUS_DRAFT;

            $proposal = Proposal::create($data);

            // Create line items
            foreach ($items as $index => $itemData) {
                $itemData['proposal_id'] = $proposal->id;
                $itemData['sort_order'] = $itemData['sort_order'] ?? $index;
                ProposalItem::create($itemData);
            }

            // Reload with items to get calculated totals
            return $proposal->fresh(['items', 'project.organization', 'creator']);
        });
    }

    /**
     * Update a proposal.
     */
    public function update(Proposal $proposal, array $data): Proposal
    {
        if (!$proposal->isEditable()) {
            throw new \RuntimeException('Only draft proposals can be edited.');
        }

        return DB::transaction(function () use ($proposal, $data) {
            $items = $data['items'] ?? null;
            unset($data['items']);

            $proposal->update($data);

            // Update items if provided
            if ($items !== null) {
                $this->syncItems($proposal, $items);
            }

            return $proposal->fresh(['items', 'project.organization', 'creator']);
        });
    }

    /**
     * Sync proposal items.
     */
    protected function syncItems(Proposal $proposal, array $items): void
    {
        // Get existing item IDs
        $existingIds = $proposal->items->pluck('id')->toArray();
        $updatedIds = [];

        foreach ($items as $index => $itemData) {
            $itemData['sort_order'] = $itemData['sort_order'] ?? $index;

            if (!empty($itemData['id']) && in_array($itemData['id'], $existingIds)) {
                // Update existing item
                $item = ProposalItem::find($itemData['id']);
                $item->update($itemData);
                $updatedIds[] = $itemData['id'];
            } else {
                // Create new item
                $itemData['proposal_id'] = $proposal->id;
                unset($itemData['id']);
                ProposalItem::create($itemData);
            }
        }

        // Delete items not in the update
        $toDelete = array_diff($existingIds, $updatedIds);
        if (!empty($toDelete)) {
            ProposalItem::whereIn('id', $toDelete)->delete();
        }

        // Recalculate totals
        $proposal->fresh(['items']);
        $proposal->recalculateTotals();
    }

    /**
     * Delete a proposal.
     */
    public function delete(Proposal $proposal): bool
    {
        return $proposal->delete();
    }

    /**
     * Duplicate a proposal.
     */
    public function duplicate(Proposal $proposal): Proposal
    {
        return DB::transaction(function () use ($proposal) {
            $newData = $proposal->toArray();
            
            unset($newData['id'], $newData['reference_number'], $newData['created_at'], 
                  $newData['updated_at'], $newData['deleted_at'], $newData['sent_at'], 
                  $newData['viewed_at'], $newData['responded_at']);
            
            $newData['title'] = $newData['title'] . ' (Copy)';
            $newData['status'] = Proposal::STATUS_DRAFT;
            $newData['valid_until'] = now()->addDays(30);

            $items = $proposal->items->map(function ($item) {
                return $item->only(['description', 'quantity', 'unit_price', 'discount_percent', 'tax_rate', 'sort_order']);
            })->toArray();

            $newData['items'] = $items;

            return $this->create($newData, $proposal->created_by);
        });
    }

    /**
     * Send a proposal.
     */
    public function send(Proposal $proposal): Proposal
    {
        if ($proposal->status !== Proposal::STATUS_DRAFT) {
            throw new \RuntimeException('Only draft proposals can be sent.');
        }

        $proposal->markAsSent();
        
        // TODO: Send email notification
        
        return $proposal->fresh();
    }

    /**
     * Mark proposal as viewed.
     */
    public function markViewed(Proposal $proposal): Proposal
    {
        $proposal->markAsViewed();
        return $proposal->fresh();
    }

    /**
     * Accept a proposal.
     */
    public function accept(Proposal $proposal): Proposal
    {
        if (!in_array($proposal->status, [Proposal::STATUS_SENT, Proposal::STATUS_VIEWED])) {
            throw new \RuntimeException('Only sent or viewed proposals can be accepted.');
        }

        $proposal->update([
            'status' => Proposal::STATUS_ACCEPTED,
            'responded_at' => now(),
        ]);

        return $proposal->fresh();
    }

    /**
     * Reject a proposal.
     */
    public function reject(Proposal $proposal, ?string $reason = null): Proposal
    {
        if (!in_array($proposal->status, [Proposal::STATUS_SENT, Proposal::STATUS_VIEWED])) {
            throw new \RuntimeException('Only sent or viewed proposals can be rejected.');
        }

        $proposal->update([
            'status' => Proposal::STATUS_REJECTED,
            'responded_at' => now(),
            'notes' => $reason ? ($proposal->notes . "\n\nRejection reason: " . $reason) : $proposal->notes,
        ]);

        return $proposal->fresh();
    }

    /**
     * Get proposal statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => Proposal::count(),
            'draft' => Proposal::where('status', Proposal::STATUS_DRAFT)->count(),
            'sent' => Proposal::where('status', Proposal::STATUS_SENT)->count(),
            'viewed' => Proposal::where('status', Proposal::STATUS_VIEWED)->count(),
            'accepted' => Proposal::where('status', Proposal::STATUS_ACCEPTED)->count(),
            'rejected' => Proposal::where('status', Proposal::STATUS_REJECTED)->count(),
            'expired' => Proposal::where('status', Proposal::STATUS_EXPIRED)->count(),
            'total_value_accepted' => Proposal::where('status', Proposal::STATUS_ACCEPTED)->sum('total_amount'),
            'total_value_pending' => Proposal::whereIn('status', [
                Proposal::STATUS_SENT, 
                Proposal::STATUS_VIEWED
            ])->sum('total_amount'),
            'acceptance_rate' => $this->calculateAcceptanceRate(),
        ];
    }

    /**
     * Calculate acceptance rate.
     */
    protected function calculateAcceptanceRate(): float
    {
        $responded = Proposal::whereIn('status', [
            Proposal::STATUS_ACCEPTED, 
            Proposal::STATUS_REJECTED
        ])->count();

        if ($responded === 0) {
            return 0;
        }

        $accepted = Proposal::where('status', Proposal::STATUS_ACCEPTED)->count();
        
        return round(($accepted / $responded) * 100, 1);
    }

    /**
     * Get recent proposals.
     */
    public function getRecent(int $limit = 5): Collection
    {
        return Proposal::with(['project.organization'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get proposals by project.
     */
    public function getByProject(string $projectId): Collection
    {
        return Proposal::where('project_id', $projectId)
            ->with(['items', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check and mark expired proposals.
     */
    public function markExpiredProposals(): int
    {
        return Proposal::whereIn('status', [Proposal::STATUS_SENT, Proposal::STATUS_VIEWED])
            ->where('valid_until', '<', now())
            ->update(['status' => Proposal::STATUS_EXPIRED]);
    }
}



