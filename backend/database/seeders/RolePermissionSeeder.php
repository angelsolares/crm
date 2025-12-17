<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Seeds the role_permissions table with default permissions.
     */
    public function run(): void
    {
        // Clear existing permissions
        RolePermission::truncate();

        $permissions = [];

        foreach (RolePermission::MODULES as $module => $moduleLabel) {
            $actions = RolePermission::getActionsForModule($module);
            
            foreach ($actions as $action => $actionLabel) {
                foreach (RolePermission::ROLES as $role => $roleLabel) {
                    // Check if this role has this permission by default
                    $allowedRoles = RolePermission::DEFAULT_PERMISSIONS[$module][$action] ?? [];
                    $allowed = in_array($role, $allowedRoles);
                    
                    $permissions[] = [
                        'role' => $role,
                        'module' => $module,
                        'action' => $action,
                        'allowed' => $allowed,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Batch insert
        RolePermission::insert($permissions);
        
        // Clear cache
        RolePermission::clearCache();
        
        $this->command->info('Role permissions seeded: ' . count($permissions) . ' records');
    }
}

