<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * 
     * Usage in routes:
     *   ->middleware('role:admin')           // Only admin
     *   ->middleware('role:admin,manager')   // Admin or manager
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Allowed roles (comma-separated or multiple args)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Flatten roles if passed as comma-separated string
        $allowedRoles = collect($roles)
            ->flatMap(fn($role) => explode(',', $role))
            ->map(fn($role) => trim($role))
            ->filter()
            ->toArray();

        if (!in_array($user->role, $allowedRoles)) {
            return response()->json([
                'message' => 'Forbidden. Insufficient permissions.',
                'required_roles' => $allowedRoles,
                'user_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}

