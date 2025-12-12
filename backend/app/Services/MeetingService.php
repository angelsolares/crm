<?php

namespace App\Services;

use App\Models\Meeting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MeetingService
{
    /**
     * Get paginated list of meetings.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Meeting::query()
            ->with(['organization', 'project', 'attendees']);

        // Filter by organization
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        // Filter by project
        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by type
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by date range
        if (!empty($filters['from_date'])) {
            $query->where('scheduled_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->where('scheduled_at', '<=', $filters['to_date']);
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'scheduled_at';
        $sortDir = $filters['sort_dir'] ?? 'asc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Get meeting by ID.
     */
    public function get(string $id): ?Meeting
    {
        return Meeting::with(['organization', 'project', 'attendees', 'creator'])
            ->find($id);
    }

    /**
     * Create a new meeting.
     */
    public function create(array $data, array $attendeeIds = []): Meeting
    {
        return DB::transaction(function () use ($data, $attendeeIds) {
            $data['id'] = (string) Str::uuid();
            
            $meeting = Meeting::create($data);

            // Attach attendees
            if (!empty($attendeeIds)) {
                $meeting->attendees()->attach($attendeeIds);
            }

            return $meeting->load(['organization', 'project', 'attendees']);
        });
    }

    /**
     * Update a meeting.
     */
    public function update(Meeting $meeting, array $data, ?array $attendeeIds = null): Meeting
    {
        return DB::transaction(function () use ($meeting, $data, $attendeeIds) {
            $meeting->update($data);

            // Update attendees if provided
            if ($attendeeIds !== null) {
                $meeting->attendees()->sync($attendeeIds);
            }

            return $meeting->fresh(['organization', 'project', 'attendees']);
        });
    }

    /**
     * Delete a meeting.
     */
    public function delete(Meeting $meeting): bool
    {
        return $meeting->delete();
    }

    /**
     * Mark meeting as completed.
     */
    public function complete(Meeting $meeting, ?string $outcome = null, ?string $actionItems = null): Meeting
    {
        return DB::transaction(function () use ($meeting, $outcome, $actionItems) {
            $meeting->status = Meeting::STATUS_COMPLETED;
            $meeting->outcome = $outcome;
            $meeting->action_items = $actionItems;
            $meeting->save();

            // Update attendee statuses
            $meeting->attendees()->update(['meeting_attendees.status' => 'attended']);

            return $meeting->fresh();
        });
    }

    /**
     * Cancel a meeting.
     */
    public function cancel(Meeting $meeting): Meeting
    {
        $meeting->status = Meeting::STATUS_CANCELLED;
        $meeting->save();

        return $meeting;
    }

    /**
     * Reschedule a meeting.
     */
    public function reschedule(Meeting $meeting, \DateTime $newDate, ?int $newDuration = null): Meeting
    {
        return DB::transaction(function () use ($meeting, $newDate, $newDuration) {
            $meeting->scheduled_at = $newDate;
            $meeting->status = Meeting::STATUS_RESCHEDULED;
            
            if ($newDuration) {
                $meeting->duration_minutes = $newDuration;
            }

            $meeting->save();

            return $meeting->fresh();
        });
    }

    /**
     * Get upcoming meetings.
     */
    public function getUpcoming(int $limit = 10): Collection
    {
        return Meeting::upcoming()
            ->with(['organization', 'project', 'attendees'])
            ->limit($limit)
            ->get();
    }

    /**
     * Get meetings needing follow-up.
     */
    public function getNeedingFollowUp(): Collection
    {
        return Meeting::needsFollowUp()
            ->with(['organization', 'project'])
            ->get();
    }

    /**
     * Check for scheduling conflicts.
     */
    public function getConflicts(Meeting $meeting): Collection
    {
        $endTime = $meeting->scheduled_at->copy()->addMinutes($meeting->duration_minutes);

        return Meeting::where('id', '!=', $meeting->id ?? '')
            ->where('status', Meeting::STATUS_SCHEDULED)
            ->where(function ($query) use ($meeting, $endTime) {
                $query->whereBetween('scheduled_at', [$meeting->scheduled_at, $endTime])
                    ->orWhereRaw(
                        "scheduled_at + (duration_minutes || ' minutes')::interval > ? AND scheduled_at < ?",
                        [$meeting->scheduled_at, $endTime]
                    );
            })
            ->get();
    }

    /**
     * Get meeting statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => Meeting::count(),
            'scheduled' => Meeting::where('status', Meeting::STATUS_SCHEDULED)->count(),
            'completed' => Meeting::where('status', Meeting::STATUS_COMPLETED)->count(),
            'upcoming_count' => Meeting::upcoming()->count(),
            'needs_followup' => Meeting::needsFollowUp()->count(),
            'by_type' => Meeting::select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];
    }
}

