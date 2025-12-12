<?php

namespace App\Services;

use App\Events\OrganizationCreated;
use App\Events\OrganizationUpdated;
use App\Models\Organization;
use App\Repositories\Contracts\OrganizationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationService
{
    public function __construct(
        protected OrganizationRepositoryInterface $repository
    ) {}

    /**
     * Get paginated list of organizations.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->all($filters, $perPage);
    }

    /**
     * Get organization by ID.
     */
    public function get(string $id): ?Organization
    {
        return $this->repository->find($id);
    }

    /**
     * Create a new organization.
     * Handles LTree path generation and type assignment.
     */
    public function create(array $data, ?string $parentId = null): Organization
    {
        return DB::transaction(function () use ($data, $parentId) {
            // Generate UUID for the organization
            $id = (string) Str::uuid();
            $data['id'] = $id;

            if ($parentId) {
                // Retrieve parent to build LTree path
                $parent = $this->repository->find($parentId);
                
                if (!$parent) {
                    throw new \InvalidArgumentException('Parent organization not found');
                }

                // Build path from parent
                $data['path'] = $parent->path . '.' . str_replace('-', '', $id);
                $data['parent_id'] = $parent->id;

                // Determine type based on parent type
                $data['type'] = match ($parent->type) {
                    Organization::TYPE_PARENT => Organization::TYPE_SUBSIDIARY,
                    Organization::TYPE_SUBSIDIARY => Organization::TYPE_BRANCH,
                    default => throw new \InvalidArgumentException('Cannot nest below branch level')
                };

                // Optionally inherit properties from parent
                if (empty($data['industry_id']) && $parent->industry_id) {
                    $data['industry_id'] = $parent->industry_id;
                }
            } else {
                // Root organization
                $data['path'] = str_replace('-', '', $id);
                $data['type'] = Organization::TYPE_PARENT;
            }

            $organization = $this->repository->create($data);

            // Dispatch event for real-time updates
            event(new OrganizationCreated($organization));

            return $organization;
        });
    }

    /**
     * Update an organization.
     */
    public function update(Organization $organization, array $data): Organization
    {
        return DB::transaction(function () use ($organization, $data) {
            // Prevent changing type directly
            unset($data['type'], $data['path'], $data['parent_id']);

            $organization = $this->repository->update($organization, $data);

            // Dispatch event for real-time updates
            event(new OrganizationUpdated($organization));

            return $organization;
        });
    }

    /**
     * Delete an organization.
     */
    public function delete(Organization $organization): bool
    {
        return DB::transaction(function () use ($organization) {
            // Check if organization has children
            if ($organization->children()->exists()) {
                throw new \InvalidArgumentException('Cannot delete organization with subsidiaries or branches');
            }

            return $this->repository->delete($organization);
        });
    }

    /**
     * Get organization hierarchy (tree).
     */
    public function getHierarchy(Organization $organization): array
    {
        $descendants = $this->repository->getDescendants($organization);
        
        return [
            'organization' => $organization,
            'descendants' => $descendants,
            'total_count' => $descendants->count() + 1,
        ];
    }

    /**
     * Get all descendants.
     */
    public function getDescendants(Organization $organization): Collection
    {
        return $this->repository->getDescendants($organization);
    }

    /**
     * Get root organizations.
     */
    public function getRoots(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getRoots($perPage);
    }

    /**
     * Search organizations.
     */
    public function search(string $term, int $limit = 10): Collection
    {
        return $this->repository->search($term, $limit);
    }

    /**
     * Get organizations for select dropdown.
     */
    public function getForSelect(?string $type = null): Collection
    {
        return $this->repository->getForSelect($type);
    }

    /**
     * Move organization to new parent.
     */
    public function move(Organization $organization, ?Organization $newParent): Organization
    {
        return DB::transaction(function () use ($organization, $newParent) {
            if ($organization->type === Organization::TYPE_PARENT && $newParent) {
                throw new \InvalidArgumentException('Cannot move a parent organization under another organization');
            }

            if ($newParent && $newParent->type === Organization::TYPE_BRANCH) {
                throw new \InvalidArgumentException('Cannot move organization under a branch');
            }

            // Update paths for organization and all descendants
            $oldPath = $organization->path;
            $newPath = $newParent 
                ? $newParent->path . '.' . str_replace('-', '', $organization->id)
                : str_replace('-', '', $organization->id);

            // Update this organization
            $organization->path = $newPath;
            $organization->parent_id = $newParent?->id;
            
            // Update type based on new parent
            if ($newParent) {
                $organization->type = match ($newParent->type) {
                    Organization::TYPE_PARENT => Organization::TYPE_SUBSIDIARY,
                    Organization::TYPE_SUBSIDIARY => Organization::TYPE_BRANCH,
                    default => $organization->type
                };
            } else {
                $organization->type = Organization::TYPE_PARENT;
            }

            $organization->save();

            // Update all descendants' paths
            Organization::whereRaw('path <@ ?', [$oldPath])
                ->where('id', '!=', $organization->id)
                ->update([
                    'path' => DB::raw("'" . $newPath . "' || subpath(path, nlevel('" . $oldPath . "'))")
                ]);

            return $organization->fresh();
        });
    }
}

