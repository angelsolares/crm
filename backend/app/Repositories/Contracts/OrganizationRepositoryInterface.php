<?php

namespace App\Repositories\Contracts;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface OrganizationRepositoryInterface
{
    /**
     * Get all organizations with optional filters.
     */
    public function all(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find organization by ID.
     */
    public function find(string $id): ?Organization;

    /**
     * Create a new organization.
     */
    public function create(array $data): Organization;

    /**
     * Update an organization.
     */
    public function update(Organization $organization, array $data): Organization;

    /**
     * Delete an organization.
     */
    public function delete(Organization $organization): bool;

    /**
     * Get all descendants of an organization using LTree.
     */
    public function getDescendants(Organization $organization): Collection;

    /**
     * Get all ancestors of an organization using LTree.
     */
    public function getAncestors(Organization $organization): Collection;

    /**
     * Get root organizations (parent type).
     */
    public function getRoots(int $perPage = 15): LengthAwarePaginator;

    /**
     * Search organizations by term.
     */
    public function search(string $term, int $limit = 10): Collection;

    /**
     * Get organizations for dropdown/select.
     */
    public function getForSelect(?string $type = null): Collection;
}

