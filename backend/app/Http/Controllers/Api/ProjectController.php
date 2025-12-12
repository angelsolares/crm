<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectService $service
    ) {}

    /**
     * Display a listing of projects.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only([
            'organization_id', 'status', 'stage', 'assigned_user_id',
            'min_interest', 'search', 'sort_by', 'sort_dir'
        ]);

        $perPage = $request->input('per_page', 15);
        $projects = $this->service->list($filters, $perPage);

        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created project.
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Set current user as creator if authenticated
        if (auth()->check()) {
            $data['assigned_user_id'] = $data['assigned_user_id'] ?? auth()->id();
        }

        $project = $this->service->create($data);

        return response()->json([
            'message' => 'Project created successfully.',
            'data' => new ProjectResource($project->load(['organization', 'primaryContact'])),
        ], 201);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): ProjectResource
    {
        return new ProjectResource(
            $project->load(['organization', 'primaryContact', 'assignedUser', 'meetings', 'proposals'])
        );
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'primary_contact_id' => ['nullable', 'uuid', 'exists:contacts,id'],
            'assigned_user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'interest_level' => ['nullable', 'integer', 'min:1', 'max:10'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'start_date' => ['nullable', 'date'],
            'expected_close_date' => ['nullable', 'date'],
            'stage' => ['nullable', 'string'],
            'custom_fields' => ['nullable', 'array'],
        ]);

        $project = $this->service->update($project, $data);

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => new ProjectResource($project),
        ]);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project): JsonResponse
    {
        $this->service->delete($project);

        return response()->json([
            'message' => 'Project deleted successfully.',
        ]);
    }

    /**
     * Update project stage.
     */
    public function updateStage(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'stage' => ['required', 'string', 'in:' . implode(',', array_keys(Project::STAGES))],
        ]);

        $project = $this->service->updateStage($project, $data['stage']);

        return response()->json([
            'message' => 'Project stage updated successfully.',
            'data' => new ProjectResource($project),
        ]);
    }

    /**
     * Update project interest level.
     */
    public function updateInterestLevel(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'interest_level' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $project = $this->service->updateInterestLevel($project, $data['interest_level']);

        return response()->json([
            'message' => 'Interest level updated successfully.',
            'data' => new ProjectResource($project),
        ]);
    }

    /**
     * Get project pipeline (grouped by stage).
     */
    public function pipeline(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getPipeline(),
        ]);
    }

    /**
     * Get project statistics.
     */
    public function statistics(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getStatistics(),
        ]);
    }

    /**
     * Get high-interest projects.
     */
    public function highInterest(Request $request): AnonymousResourceCollection
    {
        $minLevel = $request->input('min_level', 7);
        $limit = $request->input('limit', 10);

        $projects = $this->service->getHighInterest($minLevel, $limit);

        return ProjectResource::collection($projects);
    }
}

