<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller for managing role permissions.
 * 
 * Provides endpoints for the Admin UI to configure permissions.
 */
class RolePermissionController extends Controller
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    /**
     * Get all permissions configuration.
     * 
     * Returns roles, modules, actions, and current permissions.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->permissionService->getFullConfiguration(),
        ]);
    }

    /**
     * Get permissions for a specific role.
     */
    public function show(string $role): JsonResponse
    {
        $roles = $this->permissionService->getRoles();
        
        if (!isset($roles[$role])) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'role' => $role,
                'label' => $roles[$role],
                'permissions' => $this->permissionService->getPermissionsForRole($role),
            ],
        ]);
    }

    /**
     * Update permissions for a role.
     * 
     * Expects: { permissions: { module: { action: boolean } } }
     */
    public function update(Request $request, string $role): JsonResponse
    {
        $roles = $this->permissionService->getRoles();
        
        if (!isset($roles[$role])) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        // Prevent modifying admin's critical permissions
        if ($role === 'admin') {
            $permissions = $request->input('permissions', []);
            
            // Admin must always have users.view permission
            if (isset($permissions['users']['view']) && !$permissions['users']['view']) {
                return response()->json([
                    'message' => 'Cannot remove user management access from admin role.',
                ], 422);
            }
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'array',
            'permissions.*.*' => 'boolean',
        ]);

        $this->permissionService->bulkUpdatePermissions($role, $validated['permissions']);

        return response()->json([
            'message' => 'Permissions updated successfully.',
            'data' => [
                'role' => $role,
                'permissions' => $this->permissionService->getPermissionsForRole($role),
            ],
        ]);
    }

    /**
     * Update a single permission.
     */
    public function updateSingle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'module' => 'required|string',
            'action' => 'required|string',
            'allowed' => 'required|boolean',
        ]);

        $roles = $this->permissionService->getRoles();
        
        if (!isset($roles[$validated['role']])) {
            return response()->json([
                'message' => 'Role not found.',
            ], 404);
        }

        // Prevent removing admin's users.view permission
        if ($validated['role'] === 'admin' && 
            $validated['module'] === 'users' && 
            $validated['action'] === 'view' && 
            !$validated['allowed']) {
            return response()->json([
                'message' => 'Cannot remove user management access from admin role.',
            ], 422);
        }

        $this->permissionService->updatePermission(
            $validated['role'],
            $validated['module'],
            $validated['action'],
            $validated['allowed']
        );

        return response()->json([
            'message' => 'Permission updated successfully.',
            'data' => [
                'role' => $validated['role'],
                'module' => $validated['module'],
                'action' => $validated['action'],
                'allowed' => $validated['allowed'],
            ],
        ]);
    }

    /**
     * Reset permissions to defaults.
     */
    public function reset(): JsonResponse
    {
        // Re-run the seeder
        \Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder', '--force' => true]);
        
        $this->permissionService->clearCache();

        return response()->json([
            'message' => 'Permissions reset to defaults.',
            'data' => $this->permissionService->getFullConfiguration(),
        ]);
    }
}

