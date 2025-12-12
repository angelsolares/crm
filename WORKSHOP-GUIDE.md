# Workshop: Construyendo un CRM con el AL-P Stack

## Guía para Instructores - Capacitación en Vivo

Este documento es una guía paso a paso para enseñar a tu equipo cómo construir un CRM desde cero utilizando **Angular 22 + Laravel 12 + PostgreSQL** (AL-P Stack).

---

## Información General

| Aspecto | Detalle |
|---------|---------|
| **Duración** | 1 día completo (8 horas) |
| **Nivel** | Intermedio |
| **Prerequisitos** | Conocimientos básicos de PHP, TypeScript, SQL |
| **Resultado** | CRUD completo de un módulo (Organizations) funcionando |

### Relación con el README.md

> Este workshop implementa exactamente la arquitectura descrita en el README:
> - Backend: Controller → Service → Repository Pattern
> - Frontend: Signal-based State Management
> - Base de datos: PostgreSQL con LTree

---

## Agenda del Día

| Hora | Duración | Tema | Tipo |
|------|----------|------|------|
| 09:00 | 30 min | Introducción y Setup | Teoría |
| 09:30 | 45 min | Backend: Migraciones y Modelos | Demo + Práctica |
| 10:15 | 15 min | Break | - |
| 10:30 | 45 min | Backend: Services y Repositories | Demo |
| 11:15 | 45 min | **Actividad 1**: Crear módulo Contacts | Práctica |
| 12:00 | 60 min | Almuerzo | - |
| 13:00 | 45 min | Backend: Controllers y API REST | Demo |
| 13:45 | 30 min | **Actividad 2**: API de Contacts | Práctica |
| 14:15 | 15 min | Break | - |
| 14:30 | 45 min | Frontend: Estructura y Services | Demo |
| 15:15 | 45 min | Frontend: State Management con Signals | Demo |
| 16:00 | 15 min | Break | - |
| 16:15 | 45 min | Frontend: Componentes (List, Detail, Form) | Demo |
| 17:00 | 45 min | **Actividad 3**: UI de Contacts completa | Práctica |
| 17:45 | 15 min | Cierre y Q&A | Discusión |

---

## Parte 1: Introducción (30 min)

### Objetivos
- Entender la arquitectura del proyecto
- Conocer el stack tecnológico
- Configurar el entorno de desarrollo

### Puntos a cubrir

#### 1.1 Presentación del Proyecto (10 min)

Explicar qué vamos a construir:

```
"Vamos a crear un CRM empresarial que maneja:
- Organizaciones (con estructura jerárquica)
- Contactos
- Proyectos (pipeline de ventas)
- Reuniones
- Propuestas"
```

**Referencia al README:**
> Ver sección "Core Modules" - Explicar cada módulo brevemente

#### 1.2 Arquitectura del Sistema (10 min)

Dibujar en pizarra/pantalla:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│   Angular 22    │     │   Laravel 12    │     │    + LTree      │
│   (Signals)     │◀────│  (REST API)     │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Referencia al README:**
> Ver sección "Architecture" - Mostrar el patrón Controller → Service → Repository

#### 1.3 Setup del Entorno (10 min)

Verificar que todos tengan:
- [ ] PHP 8.2+
- [ ] Composer
- [ ] Node.js 20+
- [ ] PostgreSQL 16+
- [ ] VS Code 

**Referencia al README:**
> Ver sección "Prerequisites"

---

## Parte 2: Backend - Migraciones y Modelos (45 min)

### Objetivos
- Crear la estructura de base de datos
- Entender las migraciones de Laravel
- Crear el modelo Organization

### 2.1 Crear Proyecto Laravel (Demo - 10 min)

```bash
# Crear proyecto
composer create-project laravel/laravel backend

# Entrar al directorio
cd backend

# Configurar .env
cp .env.example .env
```

Editar `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crm_workshop
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

**Explicar:**
> "Laravel usa migraciones para versionar la base de datos. 
> Es como Git pero para tu esquema de BD."

### 2.2 Habilitar LTree (Demo - 5 min)

Crear migración para extensión:

```bash
php artisan make:migration enable_ltree_extension
```

```php
// database/migrations/xxxx_enable_ltree_extension.php
public function up(): void
{
    DB::statement('CREATE EXTENSION IF NOT EXISTS ltree');
}
```

**Referencia al README:**
> Ver sección "PostgreSQL LTree Extension"
> "LTree nos permite hacer consultas jerárquicas eficientes - 
> ideal para Parent → Subsidiary → Branch"

### 2.3 Crear Migración de Organizations (Demo - 15 min)

```bash
php artisan make:migration create_organizations_table
```

```php
// database/migrations/xxxx_create_organizations_table.php
public function up(): void
{
    Schema::create('organizations', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->uuid('parent_id')->nullable();
        $table->string('name');
        $table->string('type')->default('parent'); // parent, subsidiary, branch
        $table->string('email')->nullable();
        $table->string('phone')->nullable();
        $table->string('website')->nullable();
        $table->text('address')->nullable();
        $table->string('status')->default('active');
        $table->timestamps();
        $table->softDeletes();
        
        $table->foreign('parent_id')
              ->references('id')
              ->on('organizations')
              ->onDelete('cascade');
    });
    
    // Agregar columna LTree
    DB::statement('ALTER TABLE organizations ADD COLUMN path ltree');
    DB::statement('CREATE INDEX organizations_path_gist_idx ON organizations USING GIST (path)');
}
```

**Explicar:**
> "Usamos UUIDs en lugar de auto-increment para mejor escalabilidad.
> El campo `path` de tipo `ltree` almacenará la ruta jerárquica."

### 2.4 Crear el Modelo (Demo - 15 min)

```bash
php artisan make:model Organization
```

```php
// app/Models/Organization.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'parent_id',
        'name',
        'type',
        'email',
        'phone',
        'website',
        'address',
        'status',
        'path',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación: Organización padre
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'parent_id');
    }

    // Relación: Organizaciones hijas
    public function children(): HasMany
    {
        return $this->hasMany(Organization::class, 'parent_id');
    }

    // Scope: Solo organizaciones activas
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Scope: Solo organizaciones padre (raíz)
    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }
}
```

**Explicar:**
> "El trait `HasUuids` genera automáticamente UUIDs.
> Los Scopes son métodos reutilizables para consultas comunes."

Ejecutar migración:
```bash
php artisan migrate
```

---

## Actividad 1: Crear módulo Contacts (45 min)

### Instrucciones para el equipo

**Objetivo:** Crear la migración y modelo para Contacts siguiendo el patrón de Organizations.

**Requisitos del modelo Contact:**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Primary key |
| organization_id | UUID | Foreign key a organizations |
| first_name | string | Requerido |
| last_name | string | Requerido |
| email | string | Único |
| phone | string | Nullable |
| title | string | Cargo/puesto, nullable |
| department | string | Nullable |
| is_primary | boolean | Default false |
| status | string | active/inactive |
| notes | text | Nullable |
| timestamps | - | created_at, updated_at |
| softDeletes | - | deleted_at |

**Pasos:**

1. Crear migración: `php artisan make:migration create_contacts_table`
2. Definir esquema con todos los campos
3. Crear modelo: `php artisan make:model Contact`
4. Agregar relaciones (belongsTo Organization)
5. Agregar scopes útiles (active, primary)
6. Ejecutar migración

**Tiempo:** 45 minutos

**Criterios de éxito:**
- [ ] Migración corre sin errores
- [ ] Modelo tiene relación con Organization
- [ ] Puedo crear un Contact desde Tinker

**Verificación:**
```bash
php artisan tinker
>>> Organization::factory()->create(['name' => 'Test Org'])
>>> Contact::create(['organization_id' => 'uuid-aqui', 'first_name' => 'Juan', 'last_name' => 'Pérez', 'email' => 'juan@test.com'])
```

---

## Parte 3: Backend - Services y Repositories (45 min)

### Objetivos
- Entender el patrón Repository
- Crear el Service Layer
- Separar la lógica de negocio

**Referencia al README:**
> Ver sección "Architecture - Backend (Laravel)"
> Controller (thin) → Service (business logic) → Repository (data access)

### 3.1 Crear el Repository (Demo - 20 min)

```bash
mkdir -p app/Repositories
```

```php
// app/Repositories/OrganizationRepository.php
<?php

namespace App\Repositories;

use App\Models\Organization;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class OrganizationRepository
{
    public function __construct(
        private Organization $model
    ) {}

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        // Filtro por búsqueda
        if (!empty($filters['search'])) {
            $query->where('name', 'ilike', '%' . $filters['search'] . '%');
        }

        // Filtro por tipo
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filtro por estado
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Ordenamiento
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        // Paginación
        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    public function find(string $id): ?Organization
    {
        return $this->model->with(['parent', 'children'])->find($id);
    }

    public function create(array $data): Organization
    {
        return $this->model->create($data);
    }

    public function update(Organization $organization, array $data): Organization
    {
        $organization->update($data);
        return $organization->fresh();
    }

    public function delete(Organization $organization): bool
    {
        return $organization->delete();
    }

    public function getRoots(): Collection
    {
        return $this->model->roots()->active()->orderBy('name')->get();
    }
}
```

**Explicar:**
> "El Repository encapsula TODA la lógica de acceso a datos.
> Si mañana cambiamos de Eloquent a otra cosa, solo modificamos aquí."

### 3.2 Crear el Service (Demo - 20 min)

```bash
mkdir -p app/Services
```

```php
// app/Services/OrganizationService.php
<?php

namespace App\Services;

use App\Models\Organization;
use App\Repositories\OrganizationRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class OrganizationService
{
    public function __construct(
        private OrganizationRepository $repository
    ) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        return $this->repository->paginate($filters);
    }

    public function get(string $id): ?Organization
    {
        return $this->repository->find($id);
    }

    public function create(array $data): Organization
    {
        // Generar path LTree
        $data['path'] = $this->generatePath($data);
        
        return $this->repository->create($data);
    }

    public function update(string $id, array $data): Organization
    {
        $organization = $this->repository->find($id);
        
        if (!$organization) {
            throw new \Exception('Organization not found');
        }

        return $this->repository->update($organization, $data);
    }

    public function delete(string $id): bool
    {
        $organization = $this->repository->find($id);
        
        if (!$organization) {
            throw new \Exception('Organization not found');
        }

        return $this->repository->delete($organization);
    }

    private function generatePath(array $data): string
    {
        // Crear slug para el path
        $slug = Str::slug($data['name'], '_');
        
        if (!empty($data['parent_id'])) {
            $parent = $this->repository->find($data['parent_id']);
            if ($parent && $parent->path) {
                return $parent->path . '.' . $slug;
            }
        }
        
        return $slug;
    }
}
```

**Explicar:**
> "El Service contiene la LÓGICA DE NEGOCIO.
> Aquí generamos el path LTree automáticamente.
> El Controller nunca debería hacer esto."

### 3.3 Registrar en el Container (Demo - 5 min)

```php
// app/Providers/AppServiceProvider.php
public function register(): void
{
    $this->app->bind(OrganizationRepository::class, function ($app) {
        return new OrganizationRepository(new \App\Models\Organization());
    });
}
```

---

## Parte 4: Backend - Controllers y API REST (45 min)

### Objetivos
- Crear el Controller con acciones RESTful
- Definir rutas de API
- Implementar Form Requests para validación

### 4.1 Crear Form Request (Demo - 10 min)

```bash
php artisan make:request Organization/StoreOrganizationRequest
```

```php
// app/Http/Requests/Organization/StoreOrganizationRequest.php
<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // En producción: verificar permisos
    }

    public function rules(): array
    {
        return [
            'parent_id' => 'nullable|uuid|exists:organizations,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:parent,subsidiary,branch',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'status' => 'in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la organización es requerido',
            'type.in' => 'El tipo debe ser: parent, subsidiary o branch',
        ];
    }
}
```

### 4.2 Crear el Controller (Demo - 25 min)

```bash
php artisan make:controller Api/OrganizationController
```

```php
// app/Http/Controllers/Api/OrganizationController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Services\OrganizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function __construct(
        private OrganizationService $service
    ) {}

    /**
     * GET /api/organizations
     * Lista paginada de organizaciones
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'type', 'status', 
            'sort_by', 'sort_dir', 'per_page', 'page'
        ]);

        $organizations = $this->service->list($filters);

        return response()->json([
            'data' => $organizations->items(),
            'meta' => [
                'current_page' => $organizations->currentPage(),
                'last_page' => $organizations->lastPage(),
                'per_page' => $organizations->perPage(),
                'total' => $organizations->total(),
            ]
        ]);
    }

    /**
     * POST /api/organizations
     * Crear nueva organización
     */
    public function store(StoreOrganizationRequest $request): JsonResponse
    {
        $organization = $this->service->create($request->validated());

        return response()->json([
            'data' => $organization,
            'message' => 'Organization created successfully'
        ], 201);
    }

    /**
     * GET /api/organizations/{id}
     * Obtener una organización
     */
    public function show(string $id): JsonResponse
    {
        $organization = $this->service->get($id);

        if (!$organization) {
            return response()->json([
                'message' => 'Organization not found'
            ], 404);
        }

        return response()->json([
            'data' => $organization
        ]);
    }

    /**
     * PUT /api/organizations/{id}
     * Actualizar organización
     */
    public function update(UpdateOrganizationRequest $request, string $id): JsonResponse
    {
        try {
            $organization = $this->service->update($id, $request->validated());

            return response()->json([
                'data' => $organization,
                'message' => 'Organization updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * DELETE /api/organizations/{id}
     * Eliminar organización (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->service->delete($id);

            return response()->json([
                'message' => 'Organization deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
```

**Explicar:**
> "Observen que el Controller es DELGADO.
> Solo recibe la request, llama al service, y devuelve response.
> CERO lógica de negocio aquí."

### 4.3 Definir Rutas (Demo - 10 min)

```php
// routes/api.php
<?php

use App\Http\Controllers\Api\OrganizationController;
use Illuminate\Support\Facades\Route;

// Rutas de desarrollo (sin auth)
Route::prefix('dev')->group(function () {
    Route::apiResource('organizations', OrganizationController::class);
});

// Rutas protegidas (con auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('organizations', OrganizationController::class);
});
```

**Referencia al README:**
> Ver sección "API Endpoints - Organizations"
> Notar que seguimos el estándar REST

Probar con curl:
```bash
# Listar
curl http://localhost:8000/api/dev/organizations

# Crear
curl -X POST http://localhost:8000/api/dev/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "type": "parent"}'
```

---

## Actividad 2: API de Contacts (30 min)

### Instrucciones para el equipo

**Objetivo:** Crear el CRUD completo de API para Contacts.

**Archivos a crear:**

1. `app/Repositories/ContactRepository.php`
2. `app/Services/ContactService.php`
3. `app/Http/Requests/Contact/StoreContactRequest.php`
4. `app/Http/Controllers/Api/ContactController.php`
5. Agregar rutas en `routes/api.php`

**Validaciones requeridas:**
- `organization_id`: requerido, debe existir
- `first_name`: requerido, máximo 100 caracteres
- `last_name`: requerido, máximo 100 caracteres
- `email`: requerido, email válido, único en la tabla
- `phone`: opcional
- `title`: opcional
- `is_primary`: booleano

**Tiempo:** 30 minutos

**Criterios de éxito:**
- [ ] POST /api/dev/contacts crea un contacto
- [ ] GET /api/dev/contacts lista contactos
- [ ] GET /api/dev/contacts/{id} devuelve un contacto
- [ ] PUT /api/dev/contacts/{id} actualiza
- [ ] DELETE /api/dev/contacts/{id} elimina

**Verificación:**
```bash
# Crear contacto
curl -X POST http://localhost:8000/api/dev/contacts \
  -H "Content-Type: application/json" \
  -d '{"organization_id": "uuid", "first_name": "María", "last_name": "García", "email": "maria@test.com"}'
```

---

## Parte 5: Frontend - Estructura y Services (45 min)

### Objetivos
- Crear proyecto Angular 22
- Configurar estructura de carpetas
- Crear el API Service base

### 5.1 Crear Proyecto Angular (Demo - 10 min)

```bash
# Crear proyecto (fuera de backend)
cd ..
ng new frontend --routing --style=scss --ssr=false

cd frontend

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Configurar `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'nexus': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        'midnight': {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          900: '#0f172a',
        }
      }
    }
  }
}
```

### 5.2 Estructura de Carpetas (Demo - 10 min)

```bash
mkdir -p src/app/core/{models,services,state}
mkdir -p src/app/features/{organizations,contacts}
mkdir -p src/app/shared/layout
```

**Referencia al README:**
> Ver sección "Project Structure - Frontend"
> Explicar: core (compartido), features (módulos), shared (UI)

### 5.3 Crear Modelo (Demo - 5 min)

```typescript
// src/app/core/models/organization.model.ts
export interface Organization {
  id: string;
  parent_id: string | null;
  name: string;
  type: 'parent' | 'subsidiary' | 'branch';
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  status: 'active' | 'inactive';
  path: string;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  parent?: Organization;
  children?: Organization[];
}

export interface OrganizationFilters {
  search?: string;
  type?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export interface CreateOrganizationDto {
  parent_id?: string;
  name: string;
  type: 'parent' | 'subsidiary' | 'branch';
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}
```

### 5.4 Crear API Service Base (Demo - 20 min)

```typescript
// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params: Record<string, any> = {}): Observable<T> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
}
```

Configurar environment:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/dev'
};
```

**Referencia al README:**
> Ver sección "Environment Variables - Frontend"

---

## Parte 6: Frontend - State Management con Signals (45 min)

### Objetivos
- Entender Signals de Angular 22
- Crear el State Service para Organizations
- Implementar patrones reactivos

**Referencia al README:**
> Ver sección "Architecture - Frontend (Angular)"
> Component → State Service (Signals) → API Service

### 6.1 Introducción a Signals (Teoría - 10 min)

```typescript
// Ejemplo básico de Signals
import { signal, computed, effect } from '@angular/core';

// Signal: valor reactivo mutable
const count = signal(0);
console.log(count()); // 0

count.set(5);
console.log(count()); // 5

count.update(v => v + 1);
console.log(count()); // 6

// Computed: valor derivado (solo lectura)
const doubled = computed(() => count() * 2);
console.log(doubled()); // 12

// Effect: efecto secundario cuando cambia
effect(() => {
  console.log('Count changed:', count());
});
```

**Explicar:**
> "Signals reemplazan a BehaviorSubject/Observable para estado local.
> Son más simples y eficientes. Angular 22 está optimizado para ellos."

### 6.2 Crear Organization State (Demo - 35 min)

```typescript
// src/app/core/state/organization.state.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, PaginatedResponse, ApiResponse } from '../services/api.service';
import { Organization, OrganizationFilters, CreateOrganizationDto } from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationState {
  private api = inject(ApiService);
  
  // ═══════════════════════════════════════════
  // PRIVATE SIGNALS (solo el state puede modificar)
  // ═══════════════════════════════════════════
  private _organizations = signal<Organization[]>([]);
  private _selectedOrganization = signal<Organization | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  
  // ═══════════════════════════════════════════
  // PUBLIC SIGNALS (solo lectura para componentes)
  // ═══════════════════════════════════════════
  readonly organizations = this._organizations.asReadonly();
  readonly selectedOrganization = this._selectedOrganization.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  
  // ═══════════════════════════════════════════
  // COMPUTED SIGNALS (valores derivados)
  // ═══════════════════════════════════════════
  readonly hasOrganizations = computed(() => this._organizations().length > 0);
  readonly totalCount = computed(() => this._pagination().total);
  readonly parentOrganizations = computed(() => 
    this._organizations().filter(org => org.type === 'parent')
  );
  
  // ═══════════════════════════════════════════
  // ACTIONS (métodos que modifican el estado)
  // ═══════════════════════════════════════════
  
  loadOrganizations(filters: OrganizationFilters = {}): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<PaginatedResponse<Organization>>('organizations', filters)
      .subscribe({
        next: (response) => {
          this._organizations.set(response.data);
          this._pagination.set({
            currentPage: response.meta.current_page,
            lastPage: response.meta.last_page,
            perPage: response.meta.per_page,
            total: response.meta.total
          });
          this._isLoading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load organizations');
          this._isLoading.set(false);
        }
      });
  }
  
  loadOrganization(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<ApiResponse<Organization>>(`organizations/${id}`)
      .subscribe({
        next: (response) => {
          this._selectedOrganization.set(response.data);
          this._isLoading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load organization');
          this._isLoading.set(false);
        }
      });
  }
  
  createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Organization>>('organizations', data)
        .subscribe({
          next: (response) => {
            // Agregar al inicio de la lista
            this._organizations.update(orgs => [response.data, ...orgs]);
            this._isLoading.set(false);
            resolve(response.data);
          },
          error: (err) => {
            this._error.set(err.error?.message || 'Failed to create');
            this._isLoading.set(false);
            reject(err);
          }
        });
    });
  }
  
  updateOrganization(id: string, data: Partial<CreateOrganizationDto>): Promise<Organization> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.put<ApiResponse<Organization>>(`organizations/${id}`, data)
        .subscribe({
          next: (response) => {
            // Actualizar en la lista
            this._organizations.update(orgs => 
              orgs.map(org => org.id === id ? response.data : org)
            );
            // Actualizar seleccionado si es el mismo
            if (this._selectedOrganization()?.id === id) {
              this._selectedOrganization.set(response.data);
            }
            this._isLoading.set(false);
            resolve(response.data);
          },
          error: (err) => {
            this._error.set(err.error?.message || 'Failed to update');
            this._isLoading.set(false);
            reject(err);
          }
        });
    });
  }
  
  deleteOrganization(id: string): Promise<void> {
    this._isLoading.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.delete(`organizations/${id}`)
        .subscribe({
          next: () => {
            // Remover de la lista
            this._organizations.update(orgs => 
              orgs.filter(org => org.id !== id)
            );
            // Limpiar seleccionado si es el mismo
            if (this._selectedOrganization()?.id === id) {
              this._selectedOrganization.set(null);
            }
            this._isLoading.set(false);
            resolve();
          },
          error: (err) => {
            this._error.set(err.error?.message || 'Failed to delete');
            this._isLoading.set(false);
            reject(err);
          }
        });
    });
  }
  
  // Helpers
  clearSelected(): void {
    this._selectedOrganization.set(null);
  }
  
  clearError(): void {
    this._error.set(null);
  }
}
```

**Explicar paso a paso:**

1. **Signals privados** → Solo el state puede modificarlos
2. **Signals públicos readonly** → Los componentes solo leen
3. **Computed signals** → Valores derivados automáticos
4. **Actions** → Métodos que modifican el estado

> "Este patrón es similar a Redux/NgRx pero MUCHO más simple.
> No necesitamos acciones, reducers, effects separados."

---

## Parte 7: Frontend - Componentes (45 min)

### Objetivos
- Crear componentes standalone
- Implementar List, Detail, y Form
- Usar el State en componentes

### 7.1 Crear Lista de Organizaciones (Demo - 20 min)

```bash
ng generate component features/organizations/organization-list --standalone
```

```typescript
// src/app/features/organizations/organization-list/organization-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationState } from '../../../core/state/organization.state';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-midnight-900">Organizations</h1>
          <p class="text-midnight-500">Manage your organizations</p>
        </div>
        <a routerLink="/organizations/new" 
           class="px-4 py-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700">
          + New Organization
        </a>
      </div>
      
      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-midnight-100 p-4 mb-6">
        <div class="flex gap-4">
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="Search organizations..."
            class="flex-1 px-4 py-2 border border-midnight-200 rounded-lg"
          />
          <select 
            [(ngModel)]="typeFilter"
            (ngModelChange)="onSearch()"
            class="px-4 py-2 border border-midnight-200 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="parent">Parent</option>
            <option value="subsidiary">Subsidiary</option>
            <option value="branch">Branch</option>
          </select>
        </div>
      </div>
      
      <!-- Loading State -->
      @if (orgState.isLoading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin h-8 w-8 border-4 border-nexus-500 border-t-transparent rounded-full"></div>
        </div>
      }
      
      <!-- Error State -->
      @if (orgState.error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {{ orgState.error() }}
        </div>
      }
      
      <!-- Organizations Grid -->
      @if (!orgState.isLoading() && orgState.hasOrganizations()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (org of orgState.organizations(); track org.id) {
            <a [routerLink]="['/organizations', org.id]"
               class="bg-white rounded-xl shadow-sm border border-midnight-100 p-5 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-lg bg-nexus-100 flex items-center justify-center">
                  <span class="text-nexus-700 font-bold text-lg">
                    {{ org.name.charAt(0) }}
                  </span>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-midnight-900">{{ org.name }}</h3>
                  <span class="text-sm text-midnight-500 capitalize">{{ org.type }}</span>
                </div>
                <span [class]="getStatusClass(org.status)">
                  {{ org.status }}
                </span>
              </div>
            </a>
          }
        </div>
        
        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <span class="text-midnight-500">
            Showing {{ orgState.organizations().length }} of {{ orgState.totalCount() }}
          </span>
          <div class="flex gap-2">
            <button 
              (click)="prevPage()"
              [disabled]="orgState.pagination().currentPage === 1"
              class="px-3 py-1 border rounded disabled:opacity-50">
              Previous
            </button>
            <button 
              (click)="nextPage()"
              [disabled]="orgState.pagination().currentPage === orgState.pagination().lastPage"
              class="px-3 py-1 border rounded disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      }
      
      <!-- Empty State -->
      @if (!orgState.isLoading() && !orgState.hasOrganizations()) {
        <div class="text-center py-12">
          <p class="text-midnight-500 mb-4">No organizations found</p>
          <a routerLink="/organizations/new" class="text-nexus-600 hover:underline">
            Create your first organization
          </a>
        </div>
      }
    </div>
  `,
})
export class OrganizationListComponent implements OnInit {
  orgState = inject(OrganizationState);
  
  searchTerm = '';
  typeFilter = '';
  
  ngOnInit(): void {
    this.loadOrganizations();
  }
  
  loadOrganizations(): void {
    this.orgState.loadOrganizations({
      search: this.searchTerm,
      type: this.typeFilter
    });
  }
  
  onSearch(): void {
    this.loadOrganizations();
  }
  
  prevPage(): void {
    const current = this.orgState.pagination().currentPage;
    if (current > 1) {
      this.orgState.loadOrganizations({
        search: this.searchTerm,
        type: this.typeFilter,
        page: current - 1
      });
    }
  }
  
  nextPage(): void {
    const { currentPage, lastPage } = this.orgState.pagination();
    if (currentPage < lastPage) {
      this.orgState.loadOrganizations({
        search: this.searchTerm,
        type: this.typeFilter,
        page: currentPage + 1
      });
    }
  }
  
  getStatusClass(status: string): string {
    return status === 'active'
      ? 'px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full'
      : 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full';
  }
}
```

### 7.2 Configurar Rutas (Demo - 10 min)

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'organizations',
    pathMatch: 'full'
  },
  {
    path: 'organizations',
    loadComponent: () => import('./features/organizations/organization-list/organization-list.component')
      .then(m => m.OrganizationListComponent)
  },
  {
    path: 'organizations/new',
    loadComponent: () => import('./features/organizations/organization-form/organization-form.component')
      .then(m => m.OrganizationFormComponent)
  },
  {
    path: 'organizations/:id',
    loadComponent: () => import('./features/organizations/organization-detail/organization-detail.component')
      .then(m => m.OrganizationDetailComponent)
  },
  {
    path: 'organizations/:id/edit',
    loadComponent: () => import('./features/organizations/organization-form/organization-form.component')
      .then(m => m.OrganizationFormComponent)
  }
];
```

### 7.3 Configurar HttpClient (Demo - 5 min)

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

### 7.4 Probar la Aplicación (Demo - 10 min)

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
ng serve
```

Abrir http://localhost:4200

---

## Actividad 3: UI de Contacts Completa (45 min)

### Instrucciones para el equipo

**Objetivo:** Crear la interfaz completa de Contacts (List, Detail, Form).

**Archivos a crear:**

1. `src/app/core/models/contact.model.ts`
2. `src/app/core/state/contact.state.ts`
3. `src/app/features/contacts/contact-list/contact-list.component.ts`
4. `src/app/features/contacts/contact-detail/contact-detail.component.ts`
5. `src/app/features/contacts/contact-form/contact-form.component.ts`
6. Agregar rutas en `app.routes.ts`

**Requisitos UI:**

**Contact List:**
- Grid de tarjetas con nombre, email, organización
- Búsqueda por nombre/email
- Filtro por organización
- Badge de "Primary Contact"

**Contact Detail:**
- Avatar con iniciales
- Nombre completo y cargo
- Email y teléfono clickeables
- Link a la organización
- Botones: Edit, Delete

**Contact Form:**
- Campos: first_name, last_name, email, phone, title, organization_id
- Dropdown de organizaciones
- Checkbox is_primary
- Validación visual

**Tiempo:** 45 minutos

**Criterios de éxito:**
- [ ] Lista muestra contactos del API
- [ ] Puedo crear un nuevo contacto
- [ ] Puedo ver detalles de un contacto
- [ ] Puedo editar un contacto
- [ ] Puedo eliminar un contacto

---

## Resumen y Cierre (15 min)

### Lo que aprendimos hoy

1. **Backend Laravel:**
   - Migraciones y modelos con UUID
   - Patrón Repository para acceso a datos
   - Patrón Service para lógica de negocio
   - Controllers RESTful delgados
   - Form Requests para validación

2. **Frontend Angular:**
   - Signals para estado reactivo
   - State Services como store centralizado
   - Componentes standalone
   - Lazy loading de rutas

3. **Arquitectura:**
   - Separación de responsabilidades
   - Código mantenible y testeable
   - Patrones consistentes

### Próximos pasos sugeridos

- [ ] Agregar autenticación con Sanctum
- [ ] Implementar WebSockets con Laravel Reverb
- [ ] Crear módulo de Projects
- [ ] Agregar testing unitario
- [ ] Configurar CI/CD

### Recursos adicionales

- [Laravel Documentation](https://laravel.com/docs)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [PostgreSQL LTree Documentation](https://www.postgresql.org/docs/current/ltree.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Anexo: Código de Referencia

### UpdateOrganizationRequest

```php
// app/Http/Requests/Organization/UpdateOrganizationRequest.php
<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => 'nullable|uuid|exists:organizations,id',
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:parent,subsidiary,branch',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ];
    }
}
```

### Organization Form Component

```typescript
// src/app/features/organizations/organization-form/organization-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OrganizationState } from '../../../core/state/organization.state';
import { CreateOrganizationDto } from '../../../core/models/organization.model';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="mb-6">
        <a routerLink="/organizations" class="text-nexus-600 hover:underline">
          ← Back to Organizations
        </a>
        <h1 class="text-2xl font-bold text-midnight-900 mt-2">
          {{ isEditMode() ? 'Edit Organization' : 'New Organization' }}
        </h1>
      </div>
      
      <form (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-midnight-700 mb-1">
            Name *
          </label>
          <input 
            type="text"
            [(ngModel)]="formData.name"
            name="name"
            required
            class="w-full px-4 py-2 border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500"
            placeholder="Organization name"
          />
        </div>
        
        <!-- Type -->
        <div>
          <label class="block text-sm font-medium text-midnight-700 mb-1">
            Type *
          </label>
          <select 
            [(ngModel)]="formData.type"
            name="type"
            required
            class="w-full px-4 py-2 border border-midnight-200 rounded-lg"
          >
            <option value="parent">Parent Company</option>
            <option value="subsidiary">Subsidiary</option>
            <option value="branch">Branch</option>
          </select>
        </div>
        
        <!-- Parent Organization (if not parent type) -->
        @if (formData.type !== 'parent') {
          <div>
            <label class="block text-sm font-medium text-midnight-700 mb-1">
              Parent Organization
            </label>
            <select 
              [(ngModel)]="formData.parent_id"
              name="parent_id"
              class="w-full px-4 py-2 border border-midnight-200 rounded-lg"
            >
              <option value="">Select parent...</option>
              @for (org of orgState.parentOrganizations(); track org.id) {
                <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
          </div>
        }
        
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-midnight-700 mb-1">
            Email
          </label>
          <input 
            type="email"
            [(ngModel)]="formData.email"
            name="email"
            class="w-full px-4 py-2 border border-midnight-200 rounded-lg"
            placeholder="contact@company.com"
          />
        </div>
        
        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-midnight-700 mb-1">
            Phone
          </label>
          <input 
            type="tel"
            [(ngModel)]="formData.phone"
            name="phone"
            class="w-full px-4 py-2 border border-midnight-200 rounded-lg"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        
        <!-- Website -->
        <div>
          <label class="block text-sm font-medium text-midnight-700 mb-1">
            Website
          </label>
          <input 
            type="url"
            [(ngModel)]="formData.website"
            name="website"
            class="w-full px-4 py-2 border border-midnight-200 rounded-lg"
            placeholder="https://www.company.com"
          />
        </div>
        
        <!-- Address -->
        <div>
          <label class="block text-sm font-medium text-midnight-700 mb-1">
            Address
          </label>
          <textarea 
            [(ngModel)]="formData.address"
            name="address"
            rows="3"
            class="w-full px-4 py-2 border border-midnight-200 rounded-lg"
            placeholder="Full address..."
          ></textarea>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <a routerLink="/organizations" 
             class="px-4 py-2 border border-midnight-200 rounded-lg hover:bg-midnight-50">
            Cancel
          </a>
          <button 
            type="submit"
            [disabled]="orgState.isLoading()"
            class="px-4 py-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 disabled:opacity-50"
          >
            @if (orgState.isLoading()) {
              Saving...
            } @else {
              {{ isEditMode() ? 'Update' : 'Create' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class OrganizationFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  orgState = inject(OrganizationState);
  
  isEditMode = signal(false);
  organizationId = signal<string | null>(null);
  
  formData: CreateOrganizationDto = {
    name: '',
    type: 'parent',
    parent_id: undefined,
    email: '',
    phone: '',
    website: '',
    address: ''
  };
  
  ngOnInit(): void {
    // Load parent organizations for dropdown
    this.orgState.loadOrganizations({ type: 'parent', per_page: 100 });
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.organizationId.set(id);
      this.loadOrganization(id);
    }
  }
  
  private loadOrganization(id: string): void {
    this.orgState.loadOrganization(id);
    // Wait for data and populate form
    const checkData = setInterval(() => {
      const org = this.orgState.selectedOrganization();
      if (org) {
        this.formData = {
          name: org.name,
          type: org.type,
          parent_id: org.parent_id || undefined,
          email: org.email || '',
          phone: org.phone || '',
          website: org.website || '',
          address: org.address || ''
        };
        clearInterval(checkData);
      }
    }, 100);
  }
  
  async onSubmit(): Promise<void> {
    try {
      if (this.isEditMode()) {
        await this.orgState.updateOrganization(this.organizationId()!, this.formData);
      } else {
        await this.orgState.createOrganization(this.formData);
      }
      this.router.navigate(['/organizations']);
    } catch (error) {
      console.error('Error saving organization:', error);
    }
  }
}
```

---

## Checklist del Instructor

Antes del workshop:
- [ ] PostgreSQL instalado y corriendo
- [ ] Crear base de datos `crm_workshop`
- [ ] Tener PHP 8.2+ y Composer instalados
- [ ] Tener Node.js 20+ instalado
- [ ] Código de ejemplo listo para mostrar
- [ ] Slides o notas preparadas

Durante el workshop:
- [ ] Verificar que todos pueden seguir
- [ ] Hacer pausas para preguntas
- [ ] Caminar por el salón durante actividades
- [ ] Resolver dudas individuales

Después del workshop:
- [ ] Compartir código final
- [ ] Enviar recursos adicionales
- [ ] Recopilar feedback

---

**Buena suerte con tu workshop!**

