<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Proposal\StoreProposalRequest;
use App\Http\Requests\Proposal\UpdateProposalRequest;
use App\Http\Resources\ProposalResource;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProposalController extends Controller
{
    public function __construct(
        protected ProposalService $service
    ) {}

    /**
     * Display a listing of proposals.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only([
            'project_id', 'status', 'created_by', 'from_date', 
            'to_date', 'expired', 'search', 'sort_by', 'sort_dir'
        ]);

        $perPage = $request->input('per_page', 15);
        $proposals = $this->service->list($filters, $perPage);

        return ProposalResource::collection($proposals);
    }

    /**
     * Store a newly created proposal.
     */
    public function store(StoreProposalRequest $request): JsonResponse
    {
        $data = $request->validated();
        // Use authenticated user or default user for dev mode
        $userId = auth()->id() ?? \App\Models\User::first()?->id;

        $proposal = $this->service->create($data, $userId);

        return response()->json([
            'message' => 'Proposal created successfully.',
            'data' => new ProposalResource($proposal),
        ], 201);
    }

    /**
     * Display the specified proposal.
     */
    public function show(Proposal $proposal): ProposalResource
    {
        return new ProposalResource(
            $proposal->load(['project.organization', 'project.primaryContact', 'creator', 'items'])
        );
    }

    /**
     * Update the specified proposal.
     */
    public function update(UpdateProposalRequest $request, Proposal $proposal): JsonResponse
    {
        try {
            $data = $request->validated();
            $proposal = $this->service->update($proposal, $data);

            return response()->json([
                'message' => 'Proposal updated successfully.',
                'data' => new ProposalResource($proposal),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified proposal.
     */
    public function destroy(Proposal $proposal): JsonResponse
    {
        $this->service->delete($proposal);

        return response()->json([
            'message' => 'Proposal deleted successfully.',
        ]);
    }

    /**
     * Duplicate a proposal.
     */
    public function duplicate(Proposal $proposal): JsonResponse
    {
        $newProposal = $this->service->duplicate($proposal);

        return response()->json([
            'message' => 'Proposal duplicated successfully.',
            'data' => new ProposalResource($newProposal),
        ], 201);
    }

    /**
     * Send a proposal.
     */
    public function send(Proposal $proposal): JsonResponse
    {
        try {
            $proposal = $this->service->send($proposal);

            return response()->json([
                'message' => 'Proposal sent successfully.',
                'data' => new ProposalResource($proposal),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Mark proposal as viewed (public endpoint for tracking).
     */
    public function markViewed(Proposal $proposal): JsonResponse
    {
        $proposal = $this->service->markViewed($proposal);

        return response()->json([
            'message' => 'Proposal marked as viewed.',
            'data' => new ProposalResource($proposal),
        ]);
    }

    /**
     * Accept a proposal.
     */
    public function accept(Proposal $proposal): JsonResponse
    {
        try {
            $proposal = $this->service->accept($proposal);

            return response()->json([
                'message' => 'Proposal accepted successfully.',
                'data' => new ProposalResource($proposal),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject a proposal.
     */
    public function reject(Request $request, Proposal $proposal): JsonResponse
    {
        try {
            $reason = $request->input('reason');
            $proposal = $this->service->reject($proposal, $reason);

            return response()->json([
                'message' => 'Proposal rejected.',
                'data' => new ProposalResource($proposal),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get proposal statistics.
     */
    public function statistics(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getStatistics(),
        ]);
    }

    /**
     * Get proposals by project.
     */
    public function byProject(string $projectId): AnonymousResourceCollection
    {
        $proposals = $this->service->getByProject($projectId);
        return ProposalResource::collection($proposals);
    }

    /**
     * Get recent proposals.
     */
    public function recent(Request $request): AnonymousResourceCollection
    {
        $limit = $request->input('limit', 5);
        $proposals = $this->service->getRecent($limit);
        return ProposalResource::collection($proposals);
    }
}

