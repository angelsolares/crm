<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Meeting\StoreMeetingRequest;
use App\Http\Resources\MeetingResource;
use App\Models\Meeting;
use App\Services\MeetingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MeetingController extends Controller
{
    public function __construct(
        protected MeetingService $service
    ) {}

    /**
     * Display a listing of meetings.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only([
            'organization_id', 'project_id', 'status', 'type',
            'from_date', 'to_date', 'sort_by', 'sort_dir'
        ]);

        $perPage = $request->input('per_page', 15);
        $meetings = $this->service->list($filters, $perPage);

        return MeetingResource::collection($meetings);
    }

    /**
     * Store a newly created meeting.
     */
    public function store(StoreMeetingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $attendeeIds = $data['attendee_ids'] ?? [];
        unset($data['attendee_ids']);
        
        // Set current user as creator if authenticated
        if (auth()->check()) {
            $data['created_by'] = auth()->id();
        }

        $meeting = $this->service->create($data, $attendeeIds);

        return response()->json([
            'message' => 'Meeting created successfully.',
            'data' => new MeetingResource($meeting),
        ], 201);
    }

    /**
     * Display the specified meeting.
     */
    public function show(Meeting $meeting): MeetingResource
    {
        return new MeetingResource(
            $meeting->load(['organization', 'project', 'attendees', 'creator'])
        );
    }

    /**
     * Update the specified meeting.
     */
    public function update(Request $request, Meeting $meeting): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'scheduled_at' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'follow_up_date' => ['nullable', 'date'],
            'attendee_ids' => ['nullable', 'array'],
            'attendee_ids.*' => ['uuid', 'exists:contacts,id'],
        ]);

        $attendeeIds = $data['attendee_ids'] ?? null;
        unset($data['attendee_ids']);

        $meeting = $this->service->update($meeting, $data, $attendeeIds);

        return response()->json([
            'message' => 'Meeting updated successfully.',
            'data' => new MeetingResource($meeting),
        ]);
    }

    /**
     * Remove the specified meeting.
     */
    public function destroy(Meeting $meeting): JsonResponse
    {
        $this->service->delete($meeting);

        return response()->json([
            'message' => 'Meeting deleted successfully.',
        ]);
    }

    /**
     * Mark meeting as completed.
     */
    public function complete(Request $request, Meeting $meeting): JsonResponse
    {
        $data = $request->validate([
            'outcome' => ['nullable', 'string'],
            'action_items' => ['nullable', 'string'],
        ]);

        $meeting = $this->service->complete(
            $meeting,
            $data['outcome'] ?? null,
            $data['action_items'] ?? null
        );

        return response()->json([
            'message' => 'Meeting marked as completed.',
            'data' => new MeetingResource($meeting),
        ]);
    }

    /**
     * Cancel a meeting.
     */
    public function cancel(Meeting $meeting): JsonResponse
    {
        $meeting = $this->service->cancel($meeting);

        return response()->json([
            'message' => 'Meeting cancelled.',
            'data' => new MeetingResource($meeting),
        ]);
    }

    /**
     * Reschedule a meeting.
     */
    public function reschedule(Request $request, Meeting $meeting): JsonResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
        ]);

        $meeting = $this->service->reschedule(
            $meeting,
            new \DateTime($data['scheduled_at']),
            $data['duration_minutes'] ?? null
        );

        return response()->json([
            'message' => 'Meeting rescheduled.',
            'data' => new MeetingResource($meeting),
        ]);
    }

    /**
     * Get upcoming meetings.
     */
    public function upcoming(Request $request): AnonymousResourceCollection
    {
        $limit = $request->input('limit', 10);
        $meetings = $this->service->getUpcoming($limit);

        return MeetingResource::collection($meetings);
    }

    /**
     * Get meetings needing follow-up.
     */
    public function needsFollowUp(): AnonymousResourceCollection
    {
        $meetings = $this->service->getNeedingFollowUp();

        return MeetingResource::collection($meetings);
    }

    /**
     * Check for conflicts.
     */
    public function checkConflicts(Request $request): JsonResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:15'],
            'meeting_id' => ['nullable', 'uuid'],
        ]);

        $meeting = new Meeting([
            'scheduled_at' => $data['scheduled_at'],
            'duration_minutes' => $data['duration_minutes'],
        ]);

        if (!empty($data['meeting_id'])) {
            $meeting->id = $data['meeting_id'];
        }

        $conflicts = $this->service->getConflicts($meeting);

        return response()->json([
            'has_conflicts' => $conflicts->isNotEmpty(),
            'conflicts' => MeetingResource::collection($conflicts),
        ]);
    }

    /**
     * Get meeting statistics.
     */
    public function statistics(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getStatistics(),
        ]);
    }
}

