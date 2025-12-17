<?php

namespace App\Services;

use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * Service for handling role-based permissions.
 * 
 * Reads permissions from the database (role_permissions table).
 * Uses caching for performance.
 */
class PermissionService
{
    /**
     * Cache key for permissions.
     */
    private const CACHE_KEY = 'role_permissions';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get all permissions from cache or database.
     */
    public function getAllPermissions(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->loadPermissionsFromDatabase();
        });
    }

    /**
     * Load permissions from database.
     */
    private function loadPermissionsFromDatabase(): array
    {
        $permissions = RolePermission::all();
        $matrix = [];

        foreach (RolePermission::ROLES as $role => $label) {
            $matrix[$role] = [];
            foreach (RolePermission::MODULES as $module => $moduleLabel) {
                $matrix[$role][$module] = [];
            }
        }

        foreach ($permissions as $permission) {
            if (isset($matrix[$permission->role][$permission->module])) {
                $matrix[$permission->role][$permission->module][$permission->action] = $permission->allowed;
            }
        }

        return $matrix;
    }

    /**
     * Check if a user can perform an action on a module.
     */
    public function can(User $user, string $module, string $action): bool
    {
        $permissions = $this->getAllPermissions();
        return $permissions[$user->role][$module][$action] ?? false;
    }

    /**
     * Check if a user cannot perform an action on a module.
     */
    public function cannot(User $user, string $module, string $action): bool
    {
        return !$this->can($user, $module, $action);
    }

    /**
     * Get all permissions for a specific role.
     */
    public function getPermissionsForRole(string $role): array
    {
        $allPermissions = $this->getAllPermissions();
        return $allPermissions[$role] ?? [];
    }

    /**
     * Get the permission matrix for frontend use.
     * Returns permissions for a specific role in a flat format.
     */
    public function getPermissionMatrixForRole(string $role): array
    {
        $permissions = $this->getPermissionsForRole($role);
        $result = [];
        
        foreach ($permissions as $module => $actions) {
            $result[$module] = [];
            foreach ($actions as $action => $allowed) {
                $result[$module][$action] = $allowed;
            }
        }
        
        return $result;
    }

    /**
     * Get roles that can perform a specific action.
     */
    public function getRolesForAction(string $module, string $action): array
    {
        $permissions = $this->getAllPermissions();
        $roles = [];

        foreach ($permissions as $role => $modules) {
            if (isset($modules[$module][$action]) && $modules[$module][$action]) {
                $roles[] = $role;
            }
        }

        return $roles;
    }

    /**
     * Get middleware string for a specific permission.
     */
    public function getMiddleware(string $module, string $action): string
    {
        $roles = $this->getRolesForAction($module, $action);
        return 'role:' . implode(',', $roles);
    }

    /**
     * Clear the permissions cache.
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Update a permission.
     */
    public function updatePermission(string $role, string $module, string $action, bool $allowed): void
    {
        RolePermission::updateOrCreate(
            [
                'role' => $role,
                'module' => $module,
                'action' => $action,
            ],
            [
                'allowed' => $allowed,
            ]
        );

        $this->clearCache();
    }

    /**
     * Bulk update permissions for a role.
     */
    public function bulkUpdatePermissions(string $role, array $permissions): void
    {
        foreach ($permissions as $module => $actions) {
            foreach ($actions as $action => $allowed) {
                $this->updatePermission($role, $module, $action, $allowed);
            }
        }
    }

    /**
     * Get available modules with labels.
     */
    public function getModules(): array
    {
        return RolePermission::MODULES;
    }

    /**
     * Get available roles with labels.
     */
    public function getRoles(): array
    {
        return RolePermission::ROLES;
    }

    /**
     * Get all actions for a module.
     */
    public function getActionsForModule(string $module): array
    {
        return RolePermission::getActionsForModule($module);
    }

    /**
     * Get complete permission configuration for admin UI.
     */
    public function getFullConfiguration(): array
    {
        return [
            'roles' => $this->getRoles(),
            'modules' => $this->getModules(),
            'moduleActions' => $this->getAllModuleActions(),
            'permissions' => $this->getAllPermissions(),
        ];
    }

    /**
     * Get all module actions.
     */
    private function getAllModuleActions(): array
    {
        $result = [];
        
        foreach (RolePermission::MODULES as $module => $label) {
            $result[$module] = $this->getActionsForModule($module);
        }
        
        return $result;
    }
}
