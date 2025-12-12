<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]));

// Public routes (if needed)
Route::get('/industries', function () {
    return response()->json([
        'data' => \App\Models\Industry::active()->orderBy('name')->get(),
    ]);
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Current user
    Route::get('/user', fn(Request $request) => $request->user());

    // Global search
    Route::get('/search', SearchController::class);

    // Dashboard
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('/activity', [DashboardController::class, 'activity'])->name('activity');
        Route::get('/upcoming-meetings', [DashboardController::class, 'upcomingMeetings'])->name('upcoming-meetings');
        Route::get('/recent-organizations', [DashboardController::class, 'recentOrganizations'])->name('recent-organizations');
        Route::get('/high-priority-projects', [DashboardController::class, 'highPriorityProjects'])->name('high-priority-projects');
    });

    // Organizations
    Route::prefix('organizations')->name('organizations.')->group(function () {
        Route::get('/roots', [OrganizationController::class, 'roots'])->name('roots');
        Route::get('/search', [OrganizationController::class, 'search'])->name('search');
        Route::get('/for-select', [OrganizationController::class, 'forSelect'])->name('for-select');
        Route::get('/{organization}/hierarchy', [OrganizationController::class, 'hierarchy'])->name('hierarchy');
        Route::get('/{organization}/children', [OrganizationController::class, 'children'])->name('children');
        Route::get('/{organization}/contacts', [OrganizationController::class, 'contacts'])->name('contacts');
    });
    Route::apiResource('organizations', OrganizationController::class);

    // Contacts
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/search', [ContactController::class, 'search'])->name('search');
        Route::get('/for-select', [ContactController::class, 'forSelect'])->name('for-select');
        Route::get('/statistics', [ContactController::class, 'statistics'])->name('statistics');
    });
    Route::apiResource('contacts', ContactController::class);

    // Projects
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/pipeline', [ProjectController::class, 'pipeline'])->name('pipeline');
        Route::get('/statistics', [ProjectController::class, 'statistics'])->name('statistics');
        Route::get('/high-interest', [ProjectController::class, 'highInterest'])->name('high-interest');
        Route::patch('/{project}/stage', [ProjectController::class, 'updateStage'])->name('update-stage');
        Route::patch('/{project}/interest-level', [ProjectController::class, 'updateInterestLevel'])->name('update-interest');
    });
    Route::apiResource('projects', ProjectController::class);

    // Meetings
    Route::prefix('meetings')->name('meetings.')->group(function () {
        Route::get('/upcoming', [MeetingController::class, 'upcoming'])->name('upcoming');
        Route::get('/needs-follow-up', [MeetingController::class, 'needsFollowUp'])->name('needs-follow-up');
        Route::get('/statistics', [MeetingController::class, 'statistics'])->name('statistics');
        Route::post('/check-conflicts', [MeetingController::class, 'checkConflicts'])->name('check-conflicts');
        Route::post('/{meeting}/complete', [MeetingController::class, 'complete'])->name('complete');
        Route::post('/{meeting}/cancel', [MeetingController::class, 'cancel'])->name('cancel');
        Route::post('/{meeting}/reschedule', [MeetingController::class, 'reschedule'])->name('reschedule');
    });
    Route::apiResource('meetings', MeetingController::class);

    // Proposals
    Route::prefix('proposals')->name('proposals.')->group(function () {
        Route::get('/statistics', [ProposalController::class, 'statistics'])->name('statistics');
        Route::get('/recent', [ProposalController::class, 'recent'])->name('recent');
        Route::get('/by-project/{projectId}', [ProposalController::class, 'byProject'])->name('by-project');
        Route::post('/{proposal}/duplicate', [ProposalController::class, 'duplicate'])->name('duplicate');
        Route::post('/{proposal}/send', [ProposalController::class, 'send'])->name('send');
        Route::post('/{proposal}/accept', [ProposalController::class, 'accept'])->name('accept');
        Route::post('/{proposal}/reject', [ProposalController::class, 'reject'])->name('reject');
        Route::post('/{proposal}/view', [ProposalController::class, 'markViewed'])->name('view');
    });
    Route::apiResource('proposals', ProposalController::class);
});

// Development-only routes (for testing without auth)
if (app()->environment('local', 'testing')) {
    Route::prefix('dev')->group(function () {
        // Industries
        Route::get('/industries', function () {
            return response()->json([
                'data' => \App\Models\Industry::active()->orderBy('name')->get(),
            ]);
        });
        
        Route::get('/search', SearchController::class);
        
        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [DashboardController::class, 'index']);
            Route::get('/activity', [DashboardController::class, 'activity']);
            Route::get('/upcoming-meetings', [DashboardController::class, 'upcomingMeetings']);
            Route::get('/recent-organizations', [DashboardController::class, 'recentOrganizations']);
            Route::get('/high-priority-projects', [DashboardController::class, 'highPriorityProjects']);
        });
        
        // Organizations
        Route::get('/organizations/roots', [OrganizationController::class, 'roots']);
        Route::get('/organizations/search', [OrganizationController::class, 'search']);
        Route::get('/organizations/for-select', [OrganizationController::class, 'forSelect']);
        Route::get('/organizations/{organization}/hierarchy', [OrganizationController::class, 'hierarchy']);
        Route::get('/organizations/{organization}/children', [OrganizationController::class, 'children']);
        Route::get('/organizations/{organization}/contacts', [OrganizationController::class, 'contacts']);
        Route::apiResource('organizations', OrganizationController::class);
        
        // Contacts
        Route::get('/contacts/search', [ContactController::class, 'search']);
        Route::get('/contacts/for-select', [ContactController::class, 'forSelect']);
        Route::get('/contacts/statistics', [ContactController::class, 'statistics']);
        Route::apiResource('contacts', ContactController::class);
        
        // Projects
        Route::get('/projects/pipeline', [ProjectController::class, 'pipeline']);
        Route::get('/projects/statistics', [ProjectController::class, 'statistics']);
        Route::get('/projects/high-interest', [ProjectController::class, 'highInterest']);
        Route::patch('/projects/{project}/stage', [ProjectController::class, 'updateStage']);
        Route::patch('/projects/{project}/interest-level', [ProjectController::class, 'updateInterestLevel']);
        Route::apiResource('projects', ProjectController::class);
        
        // Meetings
        Route::get('/meetings/upcoming', [MeetingController::class, 'upcoming']);
        Route::get('/meetings/needs-follow-up', [MeetingController::class, 'needsFollowUp']);
        Route::get('/meetings/statistics', [MeetingController::class, 'statistics']);
        Route::post('/meetings/check-conflicts', [MeetingController::class, 'checkConflicts']);
        Route::post('/meetings/{meeting}/complete', [MeetingController::class, 'complete']);
        Route::post('/meetings/{meeting}/cancel', [MeetingController::class, 'cancel']);
        Route::post('/meetings/{meeting}/reschedule', [MeetingController::class, 'reschedule']);
        Route::apiResource('meetings', MeetingController::class);
        
        // Proposals
        Route::get('/proposals/statistics', [ProposalController::class, 'statistics']);
        Route::get('/proposals/recent', [ProposalController::class, 'recent']);
        Route::get('/proposals/by-project/{projectId}', [ProposalController::class, 'byProject']);
        Route::post('/proposals/{proposal}/duplicate', [ProposalController::class, 'duplicate']);
        Route::post('/proposals/{proposal}/send', [ProposalController::class, 'send']);
        Route::post('/proposals/{proposal}/accept', [ProposalController::class, 'accept']);
        Route::post('/proposals/{proposal}/reject', [ProposalController::class, 'reject']);
        Route::post('/proposals/{proposal}/view', [ProposalController::class, 'markViewed']);
        Route::apiResource('proposals', ProposalController::class);
    });
}

