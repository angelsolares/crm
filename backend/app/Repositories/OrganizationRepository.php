<?php

namespace App\Repositories;

use App\Models\Organization;
use App\Repositories\Contracts\OrganizationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrganizationRepository implements OrganizationRepositoryInterface
{
    /**
     * Get all organizations with optional filters.
     */
    public function all(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Organization::query()
            ->with(['industry', 'parent']);

        // Filter by type
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by industry
        if (!empty($filters['industry_id'])) {
            $query->where('industry_id', $filters['industry_id']);
        }

        // Filter by parent
        if (isset($filters['parent_id'])) {
            if ($filters['parent_id'] === null) {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $filters['parent_id']);
            }
        }

        // Search by name
        if (!empty($filters['search'])) {
            $query->where('name', 'ilike', '%' . $filters['search'] . '%');
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Find organization by ID.
     */
    public function find(string $id): ?Organization
    {
        return Organization::with(['industry', 'parent', 'children', 'contacts'])
            ->find($id);
    }

    /**
     * Create a new organization.
     */
    public function create(array $data): Organization
    {
        return Organization::create($data);
    }

    /**
     * Update an organization.
     */
    public function update(Organization $organization, array $data): Organization
    {
        $organization->update($data);
        return $organization->fresh();
    }

    /**
     * Delete an organization.
     */
    public function delete(Organization $organization): bool
    {
        return $organization->delete();
    }

    /**
     * Get all descendants of an organization using LTree.
     */
    public function getDescendants(Organization $organization): Collection
    {
        if (!$organization->path) {
            return new Collection();
        }

        return Organization::whereRaw('path <@ ?', [$organization->path])
            ->where('id', '!=', $organization->id)
            ->orderByRaw('nlevel(path)')
            ->get();
    }

    /**
     * Get all ancestors of an organization using LTree.
     */
    public function getAncestors(Organization $organization): Collection
    {
        if (!$organization->path) {
            return new Collection();
        }

        return Organization::whereRaw('path @> ?', [$organization->path])
            ->where('id', '!=', $organization->id)
            ->orderByRaw('nlevel(path) DESC')
            ->get();
    }

    /**
     * Get root organizations (parent type).
     */
    public function getRoots(int $perPage = 15): LengthAwarePaginator
    {
        return Organization::where('type', Organization::TYPE_PARENT)
            ->whereNull('parent_id')
            ->with(['industry'])
            ->withCount(['children', 'contacts', 'projects'])
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Search organizations using full-text search.
     */
    public function search(string $term, int $limit = 10): Collection
    {
        return Organization::whereRaw(
            "to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '')) @@ plainto_tsquery('english', ?)",
            [$term]
        )
            ->orWhere('name', 'ilike', '%' . $term . '%')
            ->limit($limit)
            ->get();
    }

    /**
     * Get organizations for dropdown/select.
     */
    public function getForSelect(?string $type = null): Collection
    {
        $query = Organization::select('id', 'name', 'type', 'parent_id')
            ->orderBy('name');

        if ($type) {
            $query->where('type', $type);
        }

        return $query->get();
    }

    /**
     * Get statistics for dashboard.
     */
    public function getStatistics(): array
    {
        return [
            'total' => Organization::count(),
            'clients' => Organization::where('status', 'client')->count(),
            'prospects' => Organization::where('status', 'prospect')->count(),
            'by_type' => [
                'parent' => Organization::where('type', 'parent')->count(),
                'subsidiary' => Organization::where('type', 'subsidiary')->count(),
                'branch' => Organization::where('type', 'branch')->count(),
            ],
        ];
    }

    /**
     * Get recent organizations.
     */
    public function getRecent(int $limit = 5): Collection
    {
        return Organization::with(['industry'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}

