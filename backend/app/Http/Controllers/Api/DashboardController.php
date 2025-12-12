<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $service
    ) {}

    /**
     * Get all dashboard statistics.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getStatistics(),
        ]);
    }

    /**
     * Get recent activity feed.
     */
    public function activity(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);

        return response()->json([
            'data' => $this->service->getRecentActivity($limit),
        ]);
    }

    /**
     * Get upcoming meetings widget data.
     */
    public function upcomingMeetings(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);

        return response()->json([
            'data' => $this->service->getUpcomingMeetings($limit),
        ]);
    }

    /**
     * Get recent organizations widget data.
     */
    public function recentOrganizations(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);

        return response()->json([
            'data' => $this->service->getRecentOrganizations($limit),
        ]);
    }

    /**
     * Get high-priority projects widget data.
     */
    public function highPriorityProjects(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);

        return response()->json([
            'data' => $this->service->getHighPriorityProjects($limit),
        ]);
    }
}

