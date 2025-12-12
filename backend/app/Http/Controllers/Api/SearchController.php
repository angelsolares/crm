<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\ProjectResource;
use App\Services\ContactService;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(
        protected OrganizationService $organizationService,
        protected ContactService $contactService,
        protected ProjectService $projectService,
    ) {}

    /**
     * Global search across all entities.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $term = $request->input('q', '');
        $limit = $request->input('limit', 5);

        if (strlen($term) < 2) {
            return response()->json([
                'data' => [
                    'organizations' => [],
                    'contacts' => [],
                    'projects' => [],
                ],
            ]);
        }

        // Search all entities in parallel
        $organizations = $this->organizationService->search($term, $limit);
        $contacts = $this->contactService->search($term, null, $limit);
        $projects = $this->projectService->list(['search' => $term], $limit);

        return response()->json([
            'data' => [
                'organizations' => OrganizationResource::collection($organizations),
                'contacts' => ContactResource::collection($contacts),
                'projects' => ProjectResource::collection($projects),
            ],
        ]);
    }
}

