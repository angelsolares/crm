# Práctica: Autenticación y Autorización

## Guía Rápida - AL-P Stack

Implementar autenticación con **Laravel Sanctum** y autorización basada en roles siguiendo el patrón del proyecto.

---

## Información General

| Aspecto | Detalle |
|---------|---------|
| **Duración** | 2-3 horas |
| **Nivel** | Intermedio |
| **Prerequisitos** | Workshop base completado |
| **Resultado** | Sistema de auth completo con roles |

### Arquitectura

```
┌─────────────┐    Token    ┌─────────────┐    Middleware    ┌─────────────┐
│  Frontend   │────────────▶│   Laravel   │────────────────▶│   Routes    │
│  Angular    │◀────────────│   Sanctum   │◀────────────────│  Protected  │
└─────────────┘   Response  └─────────────┘                 └─────────────┘
```

### Sistema de Roles

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso total a todo el sistema |
| `manager` | CRUD completo, no puede eliminar organizations ni gestionar usuarios |
| `sales_rep` | Vista de todo, crea contacts/meetings, actualiza proyectos asignados |

---

## Parte 1: Backend - Laravel Sanctum (45 min)

### 1.1 Instalar Sanctum

```bash
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 1.2 Configurar Usuario con Roles

```php
// app/Models/User.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_SALES_REP = 'sales_rep';

    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_MANAGER,
        self::ROLE_SALES_REP,
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(self::ROLE_ADMIN);
    }
}
```

### 1.3 Crear Form Requests

```bash
php artisan make:request LoginRequest
php artisan make:request RegisterRequest
```

```php
// app/Http/Requests/LoginRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
```

```php
// app/Http/Requests/RegisterRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()
            ],
        ];
    }
}
```

### 1.4 Crear AuthController

```bash
php artisan make:controller Api/AuthController
```

```php
// app/Http/Controllers/Api/AuthController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'sales_rep', // Default role
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate user and return token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user data.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ]);
    }
}
```

### 1.5 Crear Middleware de Roles

```bash
mkdir -p app/Http/Middleware
```

```php
// app/Http/Middleware/RoleMiddleware.php
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
     * Usage:
     *   ->middleware('role:admin')           // Only admin
     *   ->middleware('role:admin,manager')   // Admin or manager
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Flatten roles if comma-separated
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
```

### 1.6 Registrar Middleware

```php
// bootstrap/app.php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->create();
```

### 1.7 Configurar Rutas

```php
// routes/api.php
<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Protected auth routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Protected routes - all authenticated users
Route::middleware(['auth:sanctum'])->group(function () {
    // Dashboard - all roles
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Organizations
    Route::prefix('organizations')->group(function () {
        // Read - all roles
        Route::get('/', [OrganizationController::class, 'index']);
        Route::get('/{organization}', [OrganizationController::class, 'show']);
        
        // Create/Update - Admin and Manager only
        Route::middleware(['role:admin,manager'])->group(function () {
            Route::post('/', [OrganizationController::class, 'store']);
            Route::put('/{organization}', [OrganizationController::class, 'update']);
        });
        
        // Delete - Admin only
        Route::delete('/{organization}', [OrganizationController::class, 'destroy'])
            ->middleware('role:admin');
    });
});
```

---

## Parte 2: Frontend - Angular Auth (45 min)

### 2.1 Crear Auth Service

```typescript
// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales_rep';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'app_auth_token';
  private readonly USER_KEY = 'app_user';
  
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // State signals
  private _user = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Public read-only signals
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly userRole = computed(() => this._user()?.role ?? null);
  
  constructor() {
    this.loadUserFromStorage();
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  private loadUserFromStorage(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this._user.set(user);
        this.fetchCurrentUser();
      } catch {
        this.clearAuth();
      }
    }
  }
  
  fetchCurrentUser(): void {
    this._isLoading.set(true);
    this.http.get<User>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        this._user.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._isLoading.set(false);
      },
      error: () => {
        this.clearAuth();
        this._isLoading.set(false);
      }
    });
  }
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this._user.set(response.user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        const message = error.error?.message || 'Login failed.';
        this._error.set(message);
        return throwError(() => error);
      })
    );
  }
  
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        complete: () => this.clearAuth(),
        error: () => this.clearAuth()
      });
    } else {
      this.clearAuth();
    }
  }
  
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }
  
  hasRole(role: string): boolean {
    return this._user()?.role === role;
  }
  
  hasAnyRole(roles: string[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
  
  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
```

### 2.2 Crear HTTP Interceptor

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Add auth header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
```

### 2.3 Crear Guards

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects routes requiring authentication.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};

/**
 * Prevents authenticated users from accessing auth pages.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/dashboard']);
  return false;
};
```

```typescript
// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory for role-based guards.
 * Usage: canActivate: [roleGuard(['admin', 'manager'])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }
    
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }
    
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * Only allows admin users.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  if (authService.isAdmin()) {
    return true;
  }
  
  router.navigate(['/unauthorized']);
  return false;
};
```

### 2.4 Configurar Interceptor y Routes

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard, adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes (guest only)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },
  
  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'organizations',
        loadComponent: () => import('./features/organizations/organization-list/organization-list.component')
          .then(m => m.OrganizationListComponent)
      },
      // Admin only route
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users/user-list/user-list.component')
          .then(m => m.UserListComponent)
      },
      // Admin/Manager route
      {
        path: 'reports',
        canActivate: [roleGuard(['admin', 'manager'])],
        loadComponent: () => import('./features/reports/reports.component')
          .then(m => m.ReportsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  }
];
```

### 2.5 Crear Login Component

```typescript
// src/app/features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-midnight-50">
      <div class="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 class="text-2xl font-bold text-center text-midnight-900 mb-6">
          Sign In
        </h1>
        
        @if (authService.error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
            {{ authService.error() }}
          </div>
        }
        
        <form (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-midnight-700 mb-1">
              Email
            </label>
            <input 
              type="email"
              [(ngModel)]="credentials.email"
              name="email"
              required
              class="w-full px-4 py-2 border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500"
              placeholder="you@company.com"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-midnight-700 mb-1">
              Password
            </label>
            <input 
              type="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
              class="w-full px-4 py-2 border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            [disabled]="authService.isLoading()"
            class="w-full py-3 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 disabled:opacity-50"
          >
            @if (authService.isLoading()) {
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>
        
        <p class="mt-4 text-center text-midnight-500">
          Don't have an account?
          <a routerLink="/auth/register" class="text-nexus-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  credentials = {
    email: '',
    password: ''
  };
  
  onSubmit(): void {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }
}
```

---

## Parte 3: Probar el Sistema (30 min)

### 3.1 Crear Usuario de Prueba

```bash
php artisan tinker

>>> use App\Models\User;
>>> use Illuminate\Support\Facades\Hash;

# Admin user
>>> User::create([
    'name' => 'Admin User',
    'email' => 'admin@test.com',
    'password' => Hash::make('Password123'),
    'role' => 'admin'
]);

# Manager user
>>> User::create([
    'name' => 'Manager User', 
    'email' => 'manager@test.com',
    'password' => Hash::make('Password123'),
    'role' => 'manager'
]);

# Sales Rep user
>>> User::create([
    'name' => 'Sales User',
    'email' => 'sales@test.com', 
    'password' => Hash::make('Password123'),
    'role' => 'sales_rep'
]);
```

### 3.2 Probar API con cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "Password123"}'

# Guardar el token recibido y usarlo:
TOKEN="your-token-here"

# Get current user
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Access protected route
curl http://localhost:8000/api/organizations \
  -H "Authorization: Bearer $TOKEN"

# Test role restriction (as sales_rep trying admin route)
curl -X DELETE http://localhost:8000/api/organizations/some-id \
  -H "Authorization: Bearer $SALES_TOKEN"
# Should return 403 Forbidden
```

### 3.3 Probar Frontend

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
ng serve
```

1. Abrir http://localhost:4200
2. Intentar acceder a `/dashboard` → Redirige a login
3. Login con `admin@test.com` / `Password123`
4. Verificar acceso a rutas según rol

---

## Resumen de Archivos

### Backend

| Archivo | Propósito |
|---------|-----------|
| `app/Models/User.php` | Modelo con roles y HasApiTokens |
| `app/Http/Requests/LoginRequest.php` | Validación de login |
| `app/Http/Requests/RegisterRequest.php` | Validación de registro |
| `app/Http/Controllers/Api/AuthController.php` | Endpoints de auth |
| `app/Http/Middleware/RoleMiddleware.php` | Verificación de roles |
| `bootstrap/app.php` | Registro del middleware |
| `routes/api.php` | Rutas protegidas |

### Frontend

| Archivo | Propósito |
|---------|-----------|
| `core/services/auth.service.ts` | Estado y métodos de auth |
| `core/interceptors/auth.interceptor.ts` | Agrega token a requests |
| `core/guards/auth.guard.ts` | Protege rutas |
| `core/guards/role.guard.ts` | Verifica roles |
| `features/auth/login/login.component.ts` | UI de login |

---

## Criterios de Éxito

- [ ] Usuario puede registrarse
- [ ] Usuario puede hacer login y recibe token
- [ ] Token se envía en todas las requests
- [ ] Rutas protegidas redirigen a login
- [ ] Middleware de roles restringe acceso
- [ ] Logout revoca el token
- [ ] 401 redirige automáticamente a login

---

## Referencia Rápida

### Proteger Ruta en Laravel

```php
// Solo autenticados
Route::middleware('auth:sanctum')->get('/endpoint', ...);

// Solo admin
Route::middleware(['auth:sanctum', 'role:admin'])->get('/endpoint', ...);

// Admin o Manager
Route::middleware(['auth:sanctum', 'role:admin,manager'])->get('/endpoint', ...);
```

### Proteger Ruta en Angular

```typescript
// Solo autenticados
canActivate: [authGuard]

// Solo admin
canActivate: [adminGuard]

// Admin o Manager
canActivate: [roleGuard(['admin', 'manager'])]
```

### Verificar Rol en Component

```typescript
@if (authService.isAdmin()) {
  <button>Admin Action</button>
}

@if (authService.hasAnyRole(['admin', 'manager'])) {
  <button>Manager Action</button>
}
```
