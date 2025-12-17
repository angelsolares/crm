<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller for handling permission-related requests.
 * 
 * Returns the current user's permissions based on their role.
 */
class PermissionController extends Controller
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    /**
     * Get permissions for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'data' => [
                'role' => $user->role,
                'permissions' => $this->permissionService->getPermissionsForRole($user->role),
            ]
        ]);
    }
}

