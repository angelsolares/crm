<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Services\OrganizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class OrganizationController extends Controller
{
    public function __construct(
        protected OrganizationService $service
    ) {}

    /**
     * Display a listing of organizations.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only([
            'type', 'status', 'industry_id', 'parent_id', 
            'search', 'sort_by', 'sort_dir'
        ]);

        $perPage = $request->input('per_page', 15);
        $organizations = $this->service->list($filters, $perPage);

        return OrganizationResource::collection($organizations);
    }

    /**
     * Store a newly created organization.
     */
    public function store(StoreOrganizationRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('organizations/logos', 'public');
        }

        $parentId = $data['parent_id'] ?? null;
        unset($data['parent_id'], $data['logo']);

        $organization = $this->service->create($data, $parentId);

        return response()->json([
            'message' => 'Organization created successfully.',
            'data' => new OrganizationResource($organization->load(['industry', 'parent'])),
        ], 201);
    }

    /**
     * Display the specified organization.
     */
    public function show(Organization $organization): OrganizationResource
    {
        return new OrganizationResource(
            $organization->load(['industry', 'parent', 'children', 'contacts'])
        );
    }

    /**
     * Update the specified organization.
     */
    public function update(UpdateOrganizationRequest $request, Organization $organization): JsonResponse
    {
        $data = $request->validated();
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($organization->logo_path) {
                Storage::disk('public')->delete($organization->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('organizations/logos', 'public');
        }
        unset($data['logo']);

        $organization = $this->service->update($organization, $data);

        return response()->json([
            'message' => 'Organization updated successfully.',
            'data' => new OrganizationResource($organization->load(['industry', 'parent'])),
        ]);
    }

    /**
     * Remove the specified organization.
     */
    public function destroy(Organization $organization): JsonResponse
    {
        try {
            $this->service->delete($organization);

            return response()->json([
                'message' => 'Organization deleted successfully.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get organization hierarchy/tree.
     */
    public function hierarchy(Organization $organization): JsonResponse
    {
        $hierarchy = $this->service->getHierarchy($organization);

        return response()->json([
            'data' => [
                'organization' => new OrganizationResource($hierarchy['organization']),
                'descendants' => OrganizationResource::collection($hierarchy['descendants']),
                'total_count' => $hierarchy['total_count'],
            ],
        ]);
    }

    /**
     * Get root organizations (parents).
     */
    public function roots(Request $request): AnonymousResourceCollection
    {
        $perPage = $request->input('per_page', 15);
        $organizations = $this->service->getRoots($perPage);

        return OrganizationResource::collection($organizations);
    }

    /**
     * Search organizations.
     */
    public function search(Request $request): AnonymousResourceCollection
    {
        $term = $request->input('q', '');
        $limit = $request->input('limit', 10);

        $organizations = $this->service->search($term, $limit);

        return OrganizationResource::collection($organizations);
    }

    /**
     * Get organizations for select dropdown.
     */
    public function forSelect(Request $request): JsonResponse
    {
        $type = $request->input('type');
        $organizations = $this->service->getForSelect($type);

        return response()->json([
            'data' => $organizations->map(fn($org) => [
                'id' => $org->id,
                'name' => $org->name,
                'type' => $org->type,
                'parent_id' => $org->parent_id,
            ]),
        ]);
    }

    /**
     * Get children of an organization.
     */
    public function children(Organization $organization): AnonymousResourceCollection
    {
        $children = $organization->children()
            ->with(['industry'])
            ->withCount(['contacts', 'projects'])
            ->get();

        return OrganizationResource::collection($children);
    }

    /**
     * Get contacts of an organization.
     */
    public function contacts(Organization $organization): JsonResponse
    {
        $contacts = $organization->contacts()
            ->where('status', 'active')
            ->orderBy('is_primary', 'desc')
            ->orderBy('first_name')
            ->get();

        return response()->json([
            'data' => \App\Http\Resources\ContactResource::collection($contacts),
        ]);
    }
}

