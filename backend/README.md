Sistema CRM Entheo Nexus (FDR)

1. Resumen Ejecutivo y Visión Arquitectónica
1.1 Alcance del Documento
El presente documento constituye la especificación detallada de los Requisitos de Diseño Funcional (FDR) y la arquitectura técnica para el desarrollo del sistema "Entheo Nexus CRM". Este informe ha sido elaborado con el objetivo de guiar al equipo de ingeniería en la construcción de un Producto Mínimo Viable (MVP) robusto, escalable y moderno. El sistema se diseñará replicando la lógica operativa observada en los diagramas y capturas de pantalla proporcionados 1, utilizando un stack tecnológico de vanguardia compuesto por Angular 22 (Frontend), Laravel 12 (Backend) y PostgreSQL 16+ (Base de Datos).

1.2 Visión del Producto
Entheo Nexus se concibe como una plataforma centralizada para la gestión de relaciones corporativas complejas. A diferencia de los CRM lineales tradicionales, este sistema debe manejar estructuras organizacionales jerárquicas multinivel (Organización Matriz -> Subsidiaria -> Rama/Sucursal), permitiendo una granularidad precisa en la gestión de contactos y oportunidades de negocio. El objetivo del MVP es validar la eficiencia operativa en la gestión de estas entidades y sus interacciones asociadas (Proyectos, Reuniones y Propuestas), priorizando la integridad de los datos y la reactividad de la interfaz de usuario.

1.3 Estrategia Tecnológica: El Stack "AL-P"
La selección tecnológica no es arbitraria; responde a la necesidad de longevidad, rendimiento y seguridad empresarial:

Angular 22 (Frontend): Se implementará una arquitectura "Zoneless" (sin Zone.js), basando la reactividad enteramente en Signals. Esto garantiza un rendimiento de renderizado superior y una gestión de estado predecible, alineándose con los estándares de desarrollo web proyectados para 2025 y más allá.2

Laravel 12 (Backend): Se utilizará como una API RESTful estricta siguiendo una Arquitectura en Capas (Layered Architecture) conforme al estándar Enterprise definido. Se implementará el patrón Controller-Service-Repository para desacoplar la lógica de presentación, la lógica de negocio y el acceso a datos. Esto garantiza consistencia con los módulos OMS/PMS/IMS y facilita la rotación de desarrolladores entre equipos. 

PostgreSQL (Datos): El motor de base de datos explotará la extensión LTree para el manejo nativo de jerarquías organizacionales y JSONB para atributos flexibles, ofreciendo un equilibrio óptimo entre integridad relacional y flexibilidad documental.8

2. Análisis de Dominio y Controladores Arquitectónicos
Para garantizar que el MVP de Entheo Nexus no sea solo un prototipo desechable sino una base sólida para el crecimiento futuro, es imperativo establecer los principios arquitectónicos que regirán el desarrollo.

2.1 Evolución del Frontend: Angular 22 y la Era Post-Zone.js
El ecosistema de Angular ha sufrido una transformación radical. Para este proyecto, el uso de Angular 22 implica la adopción obligatoria de Standalone Components, eliminando por completo los NgModules. La decisión crítica de diseño es operar en modo Zoneless (provideExperimentalZonelessChangeDetection()).

En las versiones anteriores, Zone.js monkey-patcheaba las APIs asíncronas del navegador para detectar cambios, lo que introducía una sobrecarga significativa y dificultades en la depuración. Con Angular 22, la detección de cambios se dispara explícitamente mediante la actualización de Signals. Esto significa que cuando un dato cambia en el modelo (por ejemplo, el estado de un "Proyecto" en el Dashboard), solo se actualiza el nodo DOM específico que depende de ese Signal, sin necesidad de verificar todo el árbol de componentes.4

Además, se utilizará la Resource API (evolucionada desde la v19) para la obtención de datos asíncronos. Esto reemplaza el patrón tradicional de HttpClient + RxJS Observables para lecturas simples, permitiendo que los componentes declaren sus dependencias de datos de manera reactiva y manejen estados de carga (isLoading) y error de forma nativa.11

2.2 Estandarización del Backend: Patrón Service-Repository
Alineado con a los estandares que ya especificamos en nuestras guias de diseño y arquitectura, el backend evitará la lógica dispersa en controladores ("Fat Controllers"). La arquitectura se define estrictamente así:

Controllers: "Delgados". Solo validan la petición HTTP (usando FormRequests) y llaman al Servicio. No contienen lógica de negocio.

Services: Contienen toda la lógica de dominio (e.g., OrganizationService). Aquí reside la complejidad de calcular las rutas jerárquicas y coordinar transacciones.

Repositories: Encapsulan las consultas complejas a la base de datos, especialmente aquellas que involucran operadores específicos de PostgreSQL LTree, manteniendo a Eloquent abstraído de la lógica de negocio.13

2.3 Persistencia Jerárquica: PostgreSQL LTree
El requisito visual de manejar "Organización -> Subsidiaria -> Sucursal" 1 presenta un desafío clásico de modelado de datos. El enfoque tradicional de "Lista de Adyacencia" (Adjacency List), donde cada fila tiene un parent_id, es ineficiente para consultas recursivas profundas (e.g., "Dame todos los proyectos de la Organización X y todas sus subsidiarias multinivel").

La solución arquitectónica seleccionada es la extensión LTree de PostgreSQL. Esta permite almacenar la ruta jerárquica como un tipo de datos indexable (e.g., Top.Middle.Bottom). Las consultas de subárboles se vuelven operaciones de índice extremadamente rápidas en lugar de costosas recursiones CTE (Common Table Expressions), mejorando drásticamente el rendimiento del Dashboard cuando se agregan datos financieros o de proyectos a nivel corporativo.8

3. Especificación Detallada de Requisitos Funcionales (FDR)
A continuación, se desglosan los módulos funcionales basados en la evidencia visual 1 y las mejores prácticas de la industria CRM.15

3.1 Módulo 1: Dashboard Ejecutivo
El Dashboard actúa como el centro de mando operativo. No es una vista estática; debe ser un consumidor en tiempo real de eventos del sistema.

FR-DASH-01 (Búsqueda Global Omnicanal):

Requisito: Barra de búsqueda prominente en la cabecera.

Comportamiento: Debe soportar búsqueda difusa (fuzzy search) sobre Organizaciones, Contactos y Proyectos simultáneamente.

Implementación: Uso de índices GIN en PostgreSQL para búsquedas de texto completo sobre columnas vectoriales pre-calculadas.

FR-DASH-02 (Widgets de Métricas en Tiempo Real):

Organizaciones: Lista de tarjetas con las organizaciones más recientes. Debe mostrar: Nombre, Industria, Dirección y Logotipo.

Proyectos Activos: Contador numérico agregado. Este dato debe actualizarse vía WebSocket (Laravel Reverb) si otro usuario crea un proyecto.

Eventos/Reuniones: Lista cronológica de próximas reuniones ("Upcoming Meetings").

FR-DASH-03 (Visualización de Estado de Cliente):

Requisito: Indicadores visuales del estado de la relación (e.g., "Client", "Prospect"). En la captura se observa "Active Projects: N/A" para clientes potenciales, lo que implica una lógica condicional en la interfaz.1

3.2 Módulo 2: Gestión de Organizaciones (Núcleo Jerárquico)
Este es el módulo más complejo debido a la naturaleza polimórfica de la entidad "Organización".

FR-ORG-01 (Alta de Organización Matriz):

Campos Requeridos: Nombre de la Organización (Texto), Industria (Select), Tamaño de Organización (Select), Sitio Web (URL), Correo Electrónico (Email), Teléfono (Texto con selector de código país, e.g., "AF AFG"), Dirección completa (País, Estado, Ciudad, CP, Calle), Logotipo (Subida de archivo).1

Lógica de Negocio: Al crear una matriz, el sistema debe inicializar su path LTree con su propio ID.

FR-ORG-02 (Alta de Subsidiaria):

Contexto: Accesible desde el perfil de una Organización Matriz o desde el menú general seleccionando un padre.

Campos Específicos: "Organization" (Lookup/Búsqueda de la matriz), Nombre de Subsidiaria.

Herencia: Debe ofrecer la opción de heredar la dirección o industria de la matriz, aunque permitir la sobreescritura.

FR-ORG-03 (Alta de Sucursal/Branch):

Contexto: Nivel 3 de la jerarquía.

Campos Específicos: "Subsidiary" (Lookup), Nombre de la Rama, Web de la Rama.

Validación: Una sucursal no puede tener subsidiarias debajo de ella (restricción de profundidad nlevel <= 3).

FR-ORG-04 (Perfil 360 de Organización):

Visualización: Cabecera con Logo y Metadatos (Industria | Tamaño).

Navegación por Pestañas:

Details: Información estática.

Subsidiaries/Branches: Lista de entidades hijas.

Contacts: Lista de personas asociadas a esta entidad o sus hijas (configurable).

3.3 Módulo 3: Gestión de Contactos
Los contactos son el eje relacional para las actividades de venta.

FR-CON-01 (Creación de Contacto):

Campos: Fuente del Contacto (Select), Categoría (e.g., "General Contact"), Nombre, Área, Título/Cargo, Notas (Textarea), Teléfono, Extensión, Organización (Lookup obligatorio), Email, Departamento, Foto.1

Validación: El email debe ser único en el sistema para evitar duplicados, un problema común en CRMs.17

FR-CON-02 (Perfil de Contacto y Timeline):

Pestañas Funcionales:

Projects: Tabla con columnas "Project Name", "Status", "Software Interest Level" (Nivel de interés), "Last Meeting".

Meetings: Historial de interacciones.

Proposals: Documentos enviados.

Notes: Anotaciones informales.

3.4 Módulo 4: Operaciones (Proyectos, Reuniones, Propuestas)
FR-OPS-01 (Gestión de Proyectos):

Cada proyecto debe vincularse obligatoriamente a una Organización y opcionalmente a un Contacto Principal.

Campo Crítico: "Software Interest Level". Esto sugiere un sistema de puntuación (Lead Scoring) manual o calculado (1-10 o Bajo/Medio/Alto) para priorizar esfuerzos de venta.18

FR-OPS-02 (Gestión de Reuniones):

Campos: Título, Tipo (Virtual/Teléfono), Fecha/Hora (Scheduled At), Outcome/Notas, Fecha de Seguimiento (Scheduled Follow Up), Asistentes (Multiselect de Contactos).

Integración: El sistema debe detectar conflictos de horario básicos en el MVP.

FR-OPS-03 (Gestión de Propuestas):

El estándar de CRM requiere: Carga de archivo (PDF), Monto Total, Fecha de Validez y Estado (Borrador, Enviada, Aceptada, Rechazada).19

4. Diseño de Esquema de Base de Datos (PostgreSQL)
El diseño del esquema prioriza la integridad referencial y el rendimiento de lectura. Se utilizarán convenciones de nomenclatura snake_case estándar de PostgreSQL.

4.1 Tablas Principales
4.1.1 Tabla organizations
Esta tabla utiliza un diseño de "Single Table Inheritance" para manejar Matrices, Subsidiarias y Ramas, diferenciadas por su profundidad en el árbol LTree.

Columna

Tipo de Dato

Restricciones

Descripción

id

UUID

PK, DEFAULT gen_random_uuid()

Identificador único global.

name

VARCHAR(255)

NOT NULL

Nombre legal de la entidad.

path

LTREE

INDEX

Ruta jerárquica (e.g., root_id.sub_id). Clave para consultas rápidas.

type

VARCHAR(50)

CHECK IN ('parent', 'subsidiary', 'branch')

Tipo explícito de entidad.

industry_id

INT

FK -> industries(id)

Normalización de industrias.

size

VARCHAR(50)

 

E.g., "Medium Company".

website

VARCHAR(255)

 

 

email

VARCHAR(255)

 

 

phone_country_code

VARCHAR(5)

 

E.g., "+52".

phone_number

VARCHAR(20)

 

 

address_data

JSONB

 

Almacena calle, ciudad, estado, CP estructurado.

logo_path

VARCHAR(255)

 

Ruta relativa en el sistema de archivos (S3/Local).

created_at

TIMESTAMP

DEFAULT NOW()

 

Nota sobre LTree: Se creará un índice GIST sobre la columna path (CREATE INDEX org_path_gist_idx ON organizations USING GIST (path);). Esto permite búsquedas de descendencia (<@) en tiempo logarítmico, esencial para el rendimiento cuando la base de datos crezca.20

4.1.2 Tabla contacts
Columna

Tipo de Dato

Restricciones

Descripción

id

UUID

PK

 

organization_id

UUID

FK -> organizations(id)

Organización a la que pertenece.

first_name

VARCHAR(100)

NOT NULL

 

last_name

VARCHAR(100)

NOT NULL

 

title

VARCHAR(100)

 

Cargo (e.g., "CTO").

category

VARCHAR(50)

 

E.g., "General Contact".

source

VARCHAR(50)

 

Fuente de adquisición.

email

VARCHAR(255)

UNIQUE

 

phone_full

VARCHAR(30)

 

Teléfono normalizado E.164.

extension

VARCHAR(10)

 

 

notes

TEXT

 

Notas internas.

photo_path

VARCHAR(255)

 

 

4.1.3 Tabla projects
Columna

Tipo de Dato

Restricciones

Descripción

id

UUID

PK

 

organization_id

UUID

FK -> organizations(id)

Cliente del proyecto.

primary_contact_id

UUID

FK -> contacts(id)

Contacto principal.

name

VARCHAR(255)

NOT NULL

Nombre del proyecto.

status

VARCHAR(50)

INDEX

'Active', 'On Hold', 'Completed'.

interest_level

INT

CHECK (value BETWEEN 1 AND 10)

Puntuación de interés del software.

budget

DECIMAL(15,2)

 

Presupuesto estimado.

start_date

DATE

 

 

4.1.4 Tabla meetings
Columna

Tipo de Dato

Restricciones

Descripción

id

UUID

PK

 

project_id

UUID

FK (Nullable)

Reunión vinculada a un proyecto.

title

VARCHAR(255)

NOT NULL

Asunto de la reunión.

type

VARCHAR(50)

 

'Virtual', 'In-Person'.

scheduled_at

TIMESTAMP

NOT NULL

Fecha y hora.

outcome

TEXT

 

Notas de resultados.

follow_up_date

TIMESTAMP

 

Fecha para el siguiente contacto.

4.1.5 Tabla proposals (Tablas de Propuestas y Líneas de Ítems)
Para soportar propuestas detalladas (aunque sea un MVP, el diseño de base de datos debe prevenir deuda técnica), se separa la cabecera de la propuesta de sus ítems.21

Columna

Tipo de Dato

Restricciones

Descripción

id

UUID

PK

 

project_id

UUID

FK

 

status

VARCHAR(50)

 

'Draft', 'Sent', 'Accepted'.

total_amount

DECIMAL(15,2)

 

Calculado o manual.

valid_until

DATE

 

Expiración de la oferta.

file_path

VARCHAR(255)

 

PDF generado/subido.

Tabla proposal_items (Detalle):

id, proposal_id (FK), description, quantity, unit_price, discount, tax_rate, total_line.

5. Arquitectura del Backend (Laravel 12)
La arquitectura sigue el estándar Enterprise de separación de responsabilidades y modularidad lógica.

5.1 Estructura de Directorios
Se estructura app/ para reflejar el patrón de capas definido en el modelo de trabajo:



app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── OrganizationController.php
│   │   │   └── ContactController.php
│   ├── Requests/ (Validación de Formularios - DTOs de entrada)
│   └── Resources/ (Transformación JSON - DTOs de salida)
├── Services/ (Lógica de Negocio)
│   ├── OrganizationService.php
│   ├── ContactService.php
│   └── DashboardService.php
├── Repositories/ (Acceso a Datos LTree)
│   ├── OrganizationRepository.php
│   └── Contracts/
│       └── OrganizationRepositoryInterface.php
├── Models/ (Modelos Eloquent)
└── Events/ (Eventos para Reverb)
5.2 Implementación del Servicio (Lógica de Negocio)
La lógica de jerarquías LTree se encapsula en el servicio, inyectando el repositorio si es necesario para consultas complejas.

Ejemplo de Implementación (OrganizationService.php):



PHP


namespace App\Services;
use App\Models\Organization;
use App\Events\OrganizationCreated;
use Illuminate\Support\Facades\DB;
class OrganizationService
{
    public function createOrganization(array $data,?string $parentId = null): Organization
    {
        return DB::transaction(function () use ($data, $parentId) {
            $org = new Organization($data);
            if ($parentId) {
                // Recuperar padre para construir el path LTree
                $parent = Organization::findOrFail($parentId);
                $org->path = $parent->path. '.'. $org->id; 
                $org->parent_id = $parent->id;
                // Lógica de negocio: Validar profundidad o tipo
                $org->type = match($parent->type) {
                    'parent' => 'subsidiary',
                    'subsidiary' => 'branch',
                    default => throw new \Exception("Cannot nest below branch")
                };
            } else {
                $org->path = $org->id; // Raíz
                $org->type = 'parent';
            }
            $org->save();
            // Disparar evento para actualización en tiempo real (Reverb)
            OrganizationCreated::dispatch($org);
            return $org;
        });
    }
}
Insight: El uso de DB::transaction garantiza la integridad de los datos.

5.3 Real-Time con Laravel Reverb
Para los contadores del Dashboard ("Active Projects"), se implementará broadcasting.

Evento: OrganizationCreated o ProjectStatusUpdated implementan ShouldBroadcast.

Canal: private-dashboard-stats.

Frontend: Angular escuchará este canal. Cuando se recibe el evento, no se recarga toda la página; simplemente se incrementa el contador localmente mediante un Signal, ofreciendo una experiencia de usuario instantánea.7

5.4 Seguridad y RBAC (Control de Acceso)
Para el MVP, se utilizarán Laravel Policies nativas en lugar de paquetes pesados como Spatie Permissions, a menos que se requiera gestión dinámica de roles desde la UI. Las Policies se alinean perfectamente con el modelo de dominio.

OrganizationPolicy: Determina quién puede crear, editar o eliminar organizaciones.

Sanctum: Se utilizará para la autenticación de la API (Tokens para móvil/externos, Cookies para SPA Angular).24

6. Arquitectura del Frontend (Angular 22)
La arquitectura del frontend es el componente más innovador de esta especificación, aprovechando las capacidades de "Siguiente Generación" de Angular y el estándar "Feature-First".

6.1 Estructura de Proyecto (Feature-Based)
Se evita la estructura por tipos (componentes/servicios) en favor de una estructura por funcionalidades (features), lo que facilita la carga diferida (Lazy Loading) y el mantenimiento.25



src/app/
├── core/                  # Singleton services, interceptors, guards
│   ├── auth/
│   └── api/
├── features/              # Dominios de negocio (Lazy Loaded)
│   ├── dashboard/
│   ├── organizations/
│   │   ├── org-list/
│   │   ├── org-form/    # Formulario reactivo con Signals
│   │   └── org-detail/
│   ├── contacts/
│   └── projects/
└── shared/                # UI Components (Botones, Tablas, Cards)
6.2 Gestión de Estado: Service-based Signals
Siguiendo la recomendación "Tier 2" del modelo de trabajo (para evitar complejidad innecesaria de librerías externas como NgRx en el MVP), se utilizará el patrón State Services con Signals nativos.

Ejemplo: OrganizationState.service.ts



TypeScript


@Injectable({ providedIn: 'root' })
export class OrganizationStateService {
  private http = inject(HttpClient); // O un ApiService wrapper
  // Estado privado (Writable)
  private _organizations = signal<Organization>();
  private _isLoading = signal<boolean>(false);
  // Estado público (Read-only) para los componentes
  readonly organizations = this._organizations.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  // Acción para cargar datos
  loadOrganizations() {
    this._isLoading.set(true);
    this.http.get<Organization>('/api/organizations').subscribe({
      next: (data) => {
        this._organizations.set(data);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }
}
Insight: Este enfoque mantiene el código ligero y sin dependencias externas, alineado con la directriz de "comenzar simple y escalar solo si es necesario".26

6.3 Formularios Reactivos Basados en Signals
Angular 22 introduce mejoras significativas en formularios. Se utilizará la aproximación de Signal-Based Forms (aún experimental/avanzada en v19-20, estándar en v22).

Ventaja: Tipado fuerte automático inferido del modelo.

Validación: Esquemas de validación centralizados que se ejecutan reactivamente. Por ejemplo, al seleccionar un país "AFG" en el formulario de Organización, un computed signal puede filtrar automáticamente las ciudades disponibles sin lógica imperativa compleja.27

6.4 Obtención de Datos: Resource API
En lugar de useEffect o suscripciones manuales en ngOnInit, se utilizará la primitiva resource de Angular.



TypeScript


// Ejemplo conceptual de Angular 22
const organizationsResource = resource({
  loader: () => fetch('/api/organizations').then(r => r.json()),
});
// En el template
@if (organizationsResource.isLoading()) {
  <app-spinner />
} @else {
  @for (org of organizationsResource.value()) {... }
}
Esto simplifica drásticamente el manejo de estados de carga y error en la UI.11

7. Roadmap de Implementación y Estrategia MVP
Para entregar valor rápidamente, el desarrollo se dividirá en fases.

Fase 1: Cimientos
Backend: Configuración de Laravel 12, PostgreSQL + LTree. Implementación de Autenticación Sanctum.

Frontend: Setup de Angular 22 (Zoneless). Configuración de Tailwind CSS y estructura de carpetas. Layout principal (Sidebar, Header).

Fase 2: Entidades Núcleo 
Organizaciones: Implementación de Services y Repositories para CRUD de Organizaciones y lógica LTree. Pruebas unitarias de Servicios con Pest. Formularios en Angular con Signals.

Contactos: CRUD de Contactos y vinculación con Organizaciones.

Fase 3: Operativa y Tiempo Real
Proyectos y Reuniones: Tablas relacionales y lógica de negocio.

Dashboard: Implementación de widgets. Configuración de Laravel Reverb y suscripción desde Angular para contadores en tiempo real.

Fase 4: Refinamiento
UI/UX: Pulido de estilos. Implementación de estados de carga (skeletons).

QA: Pruebas End-to-End (E2E) con Cypress o Playwright para flujos críticos (Crear Org -> Añadir Subsidiaria -> Crear Contacto).

8. Conclusiones y Recomendaciones
Este FDR proporciona un camino técnico claro y moderno para construir e CRM de Entheo Nexus. Al evitar deuda técnica desde el inicio (usando LTree en lugar de recursión SQL lenta y Signals en lugar de Zone.js), el sistema no solo cumplirá con los requisitos del MVP, sino que estará preparado para escalar sin requerir una reescritura arquitectónica.

 