<?php

namespace App\Services;

use App\Events\ProjectStatusUpdated;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectService
{
    /**
     * Get paginated list of projects.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Project::query()
            ->with(['organization', 'primaryContact', 'assignedUser']);

        // Filter by organization
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by stage
        if (!empty($filters['stage'])) {
            $query->where('stage', $filters['stage']);
        }

        // Filter by assigned user
        if (!empty($filters['assigned_user_id'])) {
            $query->where('assigned_user_id', $filters['assigned_user_id']);
        }

        // Filter by interest level (minimum)
        if (!empty($filters['min_interest'])) {
            $query->where('interest_level', '>=', $filters['min_interest']);
        }

        // Search
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
     * Get project by ID.
     */
    public function get(string $id): ?Project
    {
        return Project::with([
            'organization',
            'primaryContact',
            'assignedUser',
            'meetings',
            'proposals'
        ])->find($id);
    }

    /**
     * Create a new project.
     */
    public function create(array $data): Project
    {
        return DB::transaction(function () use ($data) {
            $data['id'] = (string) Str::uuid();
            return Project::create($data);
        });
    }

    /**
     * Update a project.
     */
    public function update(Project $project, array $data): Project
    {
        return DB::transaction(function () use ($project, $data) {
            $oldStatus = $project->status;
            
            $project->update($data);
            
            // Dispatch event if status changed
            if (isset($data['status']) && $oldStatus !== $data['status']) {
                event(new ProjectStatusUpdated($project, $oldStatus));
            }

            return $project->fresh(['organization', 'primaryContact']);
        });
    }

    /**
     * Delete a project.
     */
    public function delete(Project $project): bool
    {
        return $project->delete();
    }

    /**
     * Update project stage.
     */
    public function updateStage(Project $project, string $stage): Project
    {
        return DB::transaction(function () use ($project, $stage) {
            $project->stage = $stage;

            // Auto-update status based on stage
            if (in_array($stage, ['closed_won', 'closed_lost'])) {
                $project->status = Project::STATUS_COMPLETED;
                $project->actual_close_date = now();
            }

            $project->save();

            return $project->fresh();
        });
    }

    /**
     * Update interest level.
     */
    public function updateInterestLevel(Project $project, int $level): Project
    {
        if ($level < 1 || $level > 10) {
            throw new \InvalidArgumentException('Interest level must be between 1 and 10');
        }

        $project->interest_level = $level;
        $project->save();

        return $project;
    }

    /**
     * Get active projects count.
     */
    public function getActiveCount(): int
    {
        return Project::where('status', Project::STATUS_ACTIVE)->count();
    }

    /**
     * Get projects by stage (pipeline).
     */
    public function getPipeline(): array
    {
        return Project::where('status', Project::STATUS_ACTIVE)
            ->select('stage', DB::raw('count(*) as count'), DB::raw('sum(budget) as total_value'))
            ->groupBy('stage')
            ->get()
            ->keyBy('stage')
            ->toArray();
    }

    /**
     * Get project statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => Project::count(),
            'active' => Project::where('status', Project::STATUS_ACTIVE)->count(),
            'completed' => Project::where('status', Project::STATUS_COMPLETED)->count(),
            'total_value' => Project::where('status', Project::STATUS_ACTIVE)->sum('budget'),
            'by_stage' => $this->getPipeline(),
            'average_interest' => round(Project::where('status', Project::STATUS_ACTIVE)->avg('interest_level'), 1),
        ];
    }

    /**
     * Get high-interest projects.
     */
    public function getHighInterest(int $minLevel = 7, int $limit = 10): Collection
    {
        return Project::where('status', Project::STATUS_ACTIVE)
            ->where('interest_level', '>=', $minLevel)
            ->with(['organization', 'primaryContact'])
            ->orderBy('interest_level', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent projects.
     */
    public function getRecent(int $limit = 5): Collection
    {
        return Project::with(['organization'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}

