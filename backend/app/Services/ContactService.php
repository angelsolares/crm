<?php

namespace App\Services;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ContactService
{
    /**
     * Get paginated list of contacts.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Contact::query()
            ->with(['organization']);

        // Filter by organization
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by category
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        // Filter by primary only
        if (!empty($filters['primary_only'])) {
            $query->where('is_primary', true);
        }

        // Search
        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'ilike', '%' . $term . '%')
                    ->orWhere('last_name', 'ilike', '%' . $term . '%')
                    ->orWhere('email', 'ilike', '%' . $term . '%');
            });
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Get contact by ID.
     */
    public function get(string $id): ?Contact
    {
        return Contact::with(['organization', 'projects', 'meetings'])
            ->find($id);
    }

    /**
     * Create a new contact.
     */
    public function create(array $data): Contact
    {
        return DB::transaction(function () use ($data) {
            $data['id'] = (string) Str::uuid();

            // If this is set as primary, unset other primary contacts
            if (!empty($data['is_primary']) && !empty($data['organization_id'])) {
                Contact::where('organization_id', $data['organization_id'])
                    ->where('is_primary', true)
                    ->update(['is_primary' => false]);
            }

            return Contact::create($data);
        });
    }

    /**
     * Update a contact.
     */
    public function update(Contact $contact, array $data): Contact
    {
        return DB::transaction(function () use ($contact, $data) {
            // If setting as primary, unset other primary contacts
            if (!empty($data['is_primary']) && !$contact->is_primary) {
                Contact::where('organization_id', $contact->organization_id)
                    ->where('is_primary', true)
                    ->where('id', '!=', $contact->id)
                    ->update(['is_primary' => false]);
            }

            $contact->update($data);
            return $contact->fresh(['organization']);
        });
    }

    /**
     * Delete a contact.
     */
    public function delete(Contact $contact): bool
    {
        return $contact->delete();
    }

    /**
     * Search contacts.
     */
    public function search(string $term, ?string $organizationId = null, int $limit = 10): Collection
    {
        $query = Contact::whereRaw(
            "to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '')) @@ plainto_tsquery('english', ?)",
            [$term]
        )
            ->orWhere('first_name', 'ilike', '%' . $term . '%')
            ->orWhere('last_name', 'ilike', '%' . $term . '%')
            ->orWhere('email', 'ilike', '%' . $term . '%');

        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get contacts for select dropdown.
     */
    public function getForSelect(?string $organizationId = null): Collection
    {
        $query = Contact::select('id', 'first_name', 'last_name', 'organization_id')
            ->where('status', 'active')
            ->orderBy('first_name');

        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        return $query->get();
    }

    /**
     * Get primary contact for organization.
     */
    public function getPrimaryForOrganization(string $organizationId): ?Contact
    {
        return Contact::where('organization_id', $organizationId)
            ->where('is_primary', true)
            ->first();
    }

    /**
     * Get contact statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => Contact::count(),
            'active' => Contact::where('status', 'active')->count(),
            'by_category' => Contact::select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray(),
            'by_source' => Contact::select('source', DB::raw('count(*) as count'))
                ->whereNotNull('source')
                ->groupBy('source')
                ->pluck('count', 'source')
                ->toArray(),
        ];
    }
}

