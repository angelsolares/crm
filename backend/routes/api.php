<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Permission Matrix:
| - admin: Full access to everything
| - manager: Can create/edit most things, cannot delete organizations or manage users
| - sales_rep: Can view everything, create contacts/meetings, update assigned projects
|
*/

// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]));

// Public routes
Route::get('/industries', function () {
    return response()->json([
        'data' => \App\Models\Industry::active()->orderBy('name')->get(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes (Public)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    
    // Protected auth routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
    });
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Authenticated Users)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {
    // Current user (legacy endpoint)
    Route::get('/user', fn(Request $request) => $request->user());
    
    // Get user permissions
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions');

    // Global search (all authenticated users)
    Route::get('/search', SearchController::class);

    /*
    |--------------------------------------------------------------------------
    | Dashboard - All roles can view
    |--------------------------------------------------------------------------
    */
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('/activity', [DashboardController::class, 'activity'])->name('activity');
        Route::get('/upcoming-meetings', [DashboardController::class, 'upcomingMeetings'])->name('upcoming-meetings');
        Route::get('/recent-organizations', [DashboardController::class, 'recentOrganizations'])->name('recent-organizations');
        Route::get('/high-priority-projects', [DashboardController::class, 'highPriorityProjects'])->name('high-priority-projects');
    });

    /*
    |--------------------------------------------------------------------------
    | Organizations
    | - View: All roles
    | - Create/Update: Admin, Manager
    | - Delete: Admin only
    |--------------------------------------------------------------------------
    */
    Route::prefix('organizations')->name('organizations.')->group(function () {
        // Read operations - all roles
        Route::get('/roots', [OrganizationController::class, 'roots'])->name('roots');
        Route::get('/search', [OrganizationController::class, 'search'])->name('search');
        Route::get('/for-select', [OrganizationController::class, 'forSelect'])->name('for-select');
        Route::get('/{organization}/hierarchy', [OrganizationController::class, 'hierarchy'])->name('hierarchy');
        Route::get('/{organization}/children', [OrganizationController::class, 'children'])->name('children');
        Route::get('/{organization}/contacts', [OrganizationController::class, 'contacts'])->name('contacts');
        Route::get('/', [OrganizationController::class, 'index'])->name('index');
        Route::get('/{organization}', [OrganizationController::class, 'show'])->name('show');
        
        // Create/Update - Admin and Manager only
        Route::middleware(['role:admin,manager'])->group(function () {
            Route::post('/', [OrganizationController::class, 'store'])->name('store');
            Route::put('/{organization}', [OrganizationController::class, 'update'])->name('update');
            Route::patch('/{organization}', [OrganizationController::class, 'update']);
        });
        
        // Delete - Admin only
        Route::delete('/{organization}', [OrganizationController::class, 'destroy'])
            ->middleware('role:admin')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Contacts
    | - View/Create/Update: All roles
    | - Delete: Admin, Manager
    |--------------------------------------------------------------------------
    */
    Route::prefix('contacts')->name('contacts.')->group(function () {
        // Read operations - all roles
        Route::get('/search', [ContactController::class, 'search'])->name('search');
        Route::get('/for-select', [ContactController::class, 'forSelect'])->name('for-select');
        Route::get('/statistics', [ContactController::class, 'statistics'])->name('statistics');
        Route::get('/', [ContactController::class, 'index'])->name('index');
        Route::get('/{contact}', [ContactController::class, 'show'])->name('show');
        
        // Create/Update - all roles
        Route::post('/', [ContactController::class, 'store'])->name('store');
        Route::put('/{contact}', [ContactController::class, 'update'])->name('update');
        Route::patch('/{contact}', [ContactController::class, 'update']);
        
        // Delete - Admin and Manager only
        Route::delete('/{contact}', [ContactController::class, 'destroy'])
            ->middleware('role:admin,manager')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Projects
    | - View: All roles
    | - Create: Admin, Manager
    | - Update/Stage/Interest: All roles (for assigned projects)
    | - Delete: Admin only
    |--------------------------------------------------------------------------
    */
    Route::prefix('projects')->name('projects.')->group(function () {
        // Read operations - all roles
        Route::get('/pipeline', [ProjectController::class, 'pipeline'])->name('pipeline');
        Route::get('/statistics', [ProjectController::class, 'statistics'])->name('statistics');
        Route::get('/high-interest', [ProjectController::class, 'highInterest'])->name('high-interest');
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::get('/{project}', [ProjectController::class, 'show'])->name('show');
        
        // Update stage/interest - all roles
        Route::patch('/{project}/stage', [ProjectController::class, 'updateStage'])->name('update-stage');
        Route::patch('/{project}/interest-level', [ProjectController::class, 'updateInterestLevel'])->name('update-interest');
        Route::put('/{project}', [ProjectController::class, 'update'])->name('update');
        Route::patch('/{project}', [ProjectController::class, 'update']);
        
        // Create - Admin and Manager only
        Route::post('/', [ProjectController::class, 'store'])
            ->middleware('role:admin,manager')
            ->name('store');
        
        // Delete - Admin only
        Route::delete('/{project}', [ProjectController::class, 'destroy'])
            ->middleware('role:admin')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Meetings
    | - View/Create/Update: All roles
    | - Delete: Admin, Manager
    |--------------------------------------------------------------------------
    */
    Route::prefix('meetings')->name('meetings.')->group(function () {
        // Read operations - all roles
        Route::get('/upcoming', [MeetingController::class, 'upcoming'])->name('upcoming');
        Route::get('/needs-follow-up', [MeetingController::class, 'needsFollowUp'])->name('needs-follow-up');
        Route::get('/statistics', [MeetingController::class, 'statistics'])->name('statistics');
        Route::get('/', [MeetingController::class, 'index'])->name('index');
        Route::get('/{meeting}', [MeetingController::class, 'show'])->name('show');
        
        // Create/Update - all roles
        Route::post('/check-conflicts', [MeetingController::class, 'checkConflicts'])->name('check-conflicts');
        Route::post('/', [MeetingController::class, 'store'])->name('store');
        Route::put('/{meeting}', [MeetingController::class, 'update'])->name('update');
        Route::patch('/{meeting}', [MeetingController::class, 'update']);
        Route::post('/{meeting}/complete', [MeetingController::class, 'complete'])->name('complete');
        Route::post('/{meeting}/cancel', [MeetingController::class, 'cancel'])->name('cancel');
        Route::post('/{meeting}/reschedule', [MeetingController::class, 'reschedule'])->name('reschedule');
        
        // Delete - Admin and Manager only
        Route::delete('/{meeting}', [MeetingController::class, 'destroy'])
            ->middleware('role:admin,manager')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Proposals
    | - View: All roles
    | - Create/Update/Send/Duplicate: Admin, Manager
    | - Delete: Admin only
    |--------------------------------------------------------------------------
    */
    Route::prefix('proposals')->name('proposals.')->group(function () {
        // Read operations - all roles
        Route::get('/statistics', [ProposalController::class, 'statistics'])->name('statistics');
        Route::get('/recent', [ProposalController::class, 'recent'])->name('recent');
        Route::get('/by-project/{projectId}', [ProposalController::class, 'byProject'])->name('by-project');
        Route::get('/', [ProposalController::class, 'index'])->name('index');
        Route::get('/{proposal}', [ProposalController::class, 'show'])->name('show');
        
        // Create/Update/Actions - Admin and Manager only
        Route::middleware(['role:admin,manager'])->group(function () {
            Route::post('/', [ProposalController::class, 'store'])->name('store');
            Route::put('/{proposal}', [ProposalController::class, 'update'])->name('update');
            Route::patch('/{proposal}', [ProposalController::class, 'update']);
            Route::post('/{proposal}/duplicate', [ProposalController::class, 'duplicate'])->name('duplicate');
            Route::post('/{proposal}/send', [ProposalController::class, 'send'])->name('send');
        });
        
        // Accept/Reject - all roles (client actions or internal processing)
        Route::post('/{proposal}/accept', [ProposalController::class, 'accept'])->name('accept');
        Route::post('/{proposal}/reject', [ProposalController::class, 'reject'])->name('reject');
        Route::post('/{proposal}/view', [ProposalController::class, 'markViewed'])->name('view');
        
        // Delete - Admin only
        Route::delete('/{proposal}', [ProposalController::class, 'destroy'])
            ->middleware('role:admin')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | User Management - Admin Only
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:admin'])->prefix('users')->name('users.')->group(function () {
        Route::get('/roles', [UserController::class, 'roles'])->name('roles');
        Route::patch('/{user}/role', [UserController::class, 'updateRole'])->name('update-role');
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::patch('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Role Permissions Management - Admin Only
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:admin'])->prefix('role-permissions')->name('role-permissions.')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])->name('index');
        Route::get('/{role}', [RolePermissionController::class, 'show'])->name('show');
        Route::put('/{role}', [RolePermissionController::class, 'update'])->name('update');
        Route::patch('/single', [RolePermissionController::class, 'updateSingle'])->name('update-single');
        Route::post('/reset', [RolePermissionController::class, 'reset'])->name('reset');
    });
});

/*
|--------------------------------------------------------------------------
| Development Routes (No Auth Required)
|--------------------------------------------------------------------------
*/
if (app()->environment('local', 'testing')) {
    Route::prefix('dev')->group(function () {
        Route::get('/industries', fn() => response()->json([
            'data' => \App\Models\Industry::active()->orderBy('name')->get(),
        ]));
        
        Route::get('/search', SearchController::class);
        
        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [DashboardController::class, 'index']);
            Route::get('/activity', [DashboardController::class, 'activity']);
            Route::get('/upcoming-meetings', [DashboardController::class, 'upcomingMeetings']);
            Route::get('/recent-organizations', [DashboardController::class, 'recentOrganizations']);
            Route::get('/high-priority-projects', [DashboardController::class, 'highPriorityProjects']);
        });
        
        // Full CRUD for dev testing
        Route::apiResource('organizations', OrganizationController::class);
        Route::get('/organizations/roots', [OrganizationController::class, 'roots']);
        Route::get('/organizations/search', [OrganizationController::class, 'search']);
        Route::get('/organizations/for-select', [OrganizationController::class, 'forSelect']);
        Route::get('/organizations/{organization}/hierarchy', [OrganizationController::class, 'hierarchy']);
        Route::get('/organizations/{organization}/children', [OrganizationController::class, 'children']);
        Route::get('/organizations/{organization}/contacts', [OrganizationController::class, 'contacts']);
        
        Route::apiResource('contacts', ContactController::class);
        Route::get('/contacts/search', [ContactController::class, 'search']);
        Route::get('/contacts/for-select', [ContactController::class, 'forSelect']);
        Route::get('/contacts/statistics', [ContactController::class, 'statistics']);
        
        Route::apiResource('projects', ProjectController::class);
        Route::get('/projects/pipeline', [ProjectController::class, 'pipeline']);
        Route::get('/projects/statistics', [ProjectController::class, 'statistics']);
        Route::get('/projects/high-interest', [ProjectController::class, 'highInterest']);
        Route::patch('/projects/{project}/stage', [ProjectController::class, 'updateStage']);
        Route::patch('/projects/{project}/interest-level', [ProjectController::class, 'updateInterestLevel']);
        
        Route::apiResource('meetings', MeetingController::class);
        Route::get('/meetings/upcoming', [MeetingController::class, 'upcoming']);
        Route::get('/meetings/needs-follow-up', [MeetingController::class, 'needsFollowUp']);
        Route::get('/meetings/statistics', [MeetingController::class, 'statistics']);
        Route::post('/meetings/check-conflicts', [MeetingController::class, 'checkConflicts']);
        Route::post('/meetings/{meeting}/complete', [MeetingController::class, 'complete']);
        Route::post('/meetings/{meeting}/cancel', [MeetingController::class, 'cancel']);
        Route::post('/meetings/{meeting}/reschedule', [MeetingController::class, 'reschedule']);
        
        Route::apiResource('proposals', ProposalController::class);
        Route::get('/proposals/statistics', [ProposalController::class, 'statistics']);
        Route::get('/proposals/recent', [ProposalController::class, 'recent']);
        Route::get('/proposals/by-project/{projectId}', [ProposalController::class, 'byProject']);
        Route::post('/proposals/{proposal}/duplicate', [ProposalController::class, 'duplicate']);
        Route::post('/proposals/{proposal}/send', [ProposalController::class, 'send']);
        Route::post('/proposals/{proposal}/accept', [ProposalController::class, 'accept']);
        Route::post('/proposals/{proposal}/reject', [ProposalController::class, 'reject']);
        Route::post('/proposals/{proposal}/view', [ProposalController::class, 'markViewed']);
    });
}
