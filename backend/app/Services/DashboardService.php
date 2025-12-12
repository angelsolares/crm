<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Meeting;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Proposal;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(
        protected OrganizationService $organizationService,
        protected ProjectService $projectService,
        protected MeetingService $meetingService,
    ) {}

    /**
     * Get all dashboard statistics.
     */
    public function getStatistics(): array
    {
        return [
            'organizations' => $this->getOrganizationStats(),
            'contacts' => $this->getContactStats(),
            'projects' => $this->getProjectStats(),
            'meetings' => $this->getMeetingStats(),
            'proposals' => $this->getProposalStats(),
        ];
    }

    /**
     * Get organization statistics.
     */
    protected function getOrganizationStats(): array
    {
        return [
            'total' => Organization::count(),
            'clients' => Organization::where('status', 'client')->count(),
            'prospects' => Organization::where('status', 'prospect')->count(),
            'new_this_month' => Organization::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];
    }

    /**
     * Get contact statistics.
     */
    protected function getContactStats(): array
    {
        return [
            'total' => Contact::count(),
            'active' => Contact::where('status', 'active')->count(),
            'new_this_month' => Contact::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];
    }

    /**
     * Get project statistics.
     */
    protected function getProjectStats(): array
    {
        return [
            'total' => Project::count(),
            'active' => Project::where('status', 'active')->count(),
            'total_value' => Project::where('status', 'active')->sum('budget'),
            'won_this_month' => Project::where('stage', 'closed_won')
                ->whereMonth('actual_close_date', now()->month)
                ->whereYear('actual_close_date', now()->year)
                ->count(),
            'pipeline' => $this->projectService->getPipeline(),
        ];
    }

    /**
     * Get meeting statistics.
     */
    protected function getMeetingStats(): array
    {
        return [
            'scheduled' => Meeting::where('status', 'scheduled')->count(),
            'upcoming_week' => Meeting::where('status', 'scheduled')
                ->whereBetween('scheduled_at', [now(), now()->addWeek()])
                ->count(),
            'completed_this_month' => Meeting::where('status', 'completed')
                ->whereMonth('scheduled_at', now()->month)
                ->count(),
        ];
    }

    /**
     * Get proposal statistics.
     */
    protected function getProposalStats(): array
    {
        return [
            'total' => Proposal::count(),
            'draft' => Proposal::where('status', 'draft')->count(),
            'sent' => Proposal::where('status', 'sent')->count(),
            'accepted' => Proposal::where('status', 'accepted')->count(),
            'total_value_pending' => Proposal::whereIn('status', ['sent', 'viewed'])->sum('total_amount'),
        ];
    }

    /**
     * Get recent activity feed.
     */
    public function getRecentActivity(int $limit = 20): array
    {
        // Get recent organizations
        $organizations = Organization::select('id', 'name', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'type' => 'organization',
                'id' => $item->id,
                'title' => "New organization: {$item->name}",
                'created_at' => $item->created_at,
            ]);

        // Get recent contacts
        $contacts = Contact::select('id', 'first_name', 'last_name', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'type' => 'contact',
                'id' => $item->id,
                'title' => "New contact: {$item->first_name} {$item->last_name}",
                'created_at' => $item->created_at,
            ]);

        // Get recent projects
        $projects = Project::select('id', 'name', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'type' => 'project',
                'id' => $item->id,
                'title' => "New project: {$item->name}",
                'created_at' => $item->created_at,
            ]);

        // Merge and sort by date
        return $organizations->concat($contacts)->concat($projects)
            ->sortByDesc('created_at')
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Get upcoming meetings for dashboard widget.
     */
    public function getUpcomingMeetings(int $limit = 5): array
    {
        return Meeting::with(['organization:id,name', 'attendees:id,first_name,last_name'])
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get recent organizations for dashboard widget.
     */
    public function getRecentOrganizations(int $limit = 5): array
    {
        return Organization::with(['industry:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get high-priority projects for dashboard widget.
     */
    public function getHighPriorityProjects(int $limit = 5): array
    {
        return Project::with(['organization:id,name', 'primaryContact:id,first_name,last_name'])
            ->where('status', 'active')
            ->where('interest_level', '>=', 7)
            ->orderBy('interest_level', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}

