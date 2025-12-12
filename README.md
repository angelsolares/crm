# Entheo Nexus CRM

A modern, enterprise-grade Customer Relationship Management system built with the **AL-P Stack** (Angular 22 + Laravel 12 + PostgreSQL).

## 🚀 Features

### Core Modules

- **Organizations** - Hierarchical structure (Parent → Subsidiary → Branch) using PostgreSQL LTree
- **Contacts** - Contact management with organization linking
- **Projects** - Sales pipeline with interest level scoring (1-10)
- **Meetings** - Scheduling with conflict detection
- **Proposals** - Document management with line items

### Technical Highlights

- **Angular 22 Zoneless** - Signal-based reactivity without Zone.js
- **Laravel 12** - Service-Repository pattern for clean architecture
- **PostgreSQL LTree** - Native hierarchical queries with GIST indexing
- **Real-time Updates** - Laravel Reverb WebSocket broadcasting
- **Full-text Search** - GIN indexed search across all entities

## 📦 Project Structure

```
CRM/
├── backend/                 # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Events/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
└── frontend/                # Angular 22 SPA
    └── src/app/
        ├── core/
        │   ├── models/
        │   ├── services/
        │   └── state/       # Signal-based state management
        ├── features/
        │   ├── dashboard/
        │   ├── organizations/
        │   ├── contacts/
        │   ├── projects/
        │   └── meetings/
        └── shared/
            └── layout/
```

## 🛠️ Prerequisites

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 20.x
- **PostgreSQL** >= 16 with `ltree` extension
- **npm** >= 10.x

## ⚙️ Installation

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env

# Set database connection in .env:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=entheo_nexus
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

## 🔧 Configuration

### PostgreSQL LTree Extension

The LTree extension is automatically enabled via migration. If you need to enable it manually:

```sql
CREATE EXTENSION IF NOT EXISTS ltree;
```

### Environment Variables

**Backend (.env)**
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200

DB_CONNECTION=pgsql
DB_DATABASE=entheo_nexus

SANCTUM_STATEFUL_DOMAINS=localhost:4200
```

**Frontend (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/dev'
};
```

## 📡 API Endpoints

### Organizations
- `GET /api/organizations` - List with pagination
- `POST /api/organizations` - Create (auto-generates LTree path)
- `GET /api/organizations/{id}` - Get with relations
- `PUT /api/organizations/{id}` - Update
- `DELETE /api/organizations/{id}` - Soft delete
- `GET /api/organizations/{id}/hierarchy` - Get descendants
- `GET /api/organizations/roots` - Get parent organizations
- `GET /api/organizations/search?q=` - Full-text search

### Contacts
- `GET /api/contacts` - List with filters
- `POST /api/contacts` - Create (validates unique email)
- `GET /api/contacts/{id}` - Get with organization
- `PUT /api/contacts/{id}` - Update
- `DELETE /api/contacts/{id}` - Soft delete

### Projects
- `GET /api/projects` - List with filters
- `GET /api/projects/pipeline` - Grouped by stage
- `PATCH /api/projects/{id}/stage` - Update pipeline stage
- `PATCH /api/projects/{id}/interest-level` - Update lead score

### Meetings
- `GET /api/meetings/upcoming` - Next N meetings
- `POST /api/meetings/check-conflicts` - Conflict detection
- `POST /api/meetings/{id}/complete` - Mark with outcome
- `POST /api/meetings/{id}/reschedule` - Change date/time

### Dashboard
- `GET /api/dashboard` - All statistics
- `GET /api/dashboard/activity` - Recent activity feed
- `GET /api/dashboard/upcoming-meetings` - Widget data

### Global Search
- `GET /api/search?q=` - Search across all entities

## 🎨 UI/UX

Built with **Tailwind CSS** featuring:
- Custom Nexus color palette (forest green aesthetic)
- Clash Display + Satoshi typography
- Smooth animations with staggered reveals
- Glass morphism effects
- Responsive design

## 🏗️ Architecture

### Backend (Laravel)

**Controller → Service → Repository Pattern**

```
Controller (thin)
    ↓ validates input, calls service
Service (business logic)
    ↓ coordinates, handles transactions
Repository (data access)
    ↓ Eloquent queries, LTree operations
```

### Frontend (Angular)

**Signal-based State Management**

```
Component
    ↓ injects state service
State Service (Signals)
    ↓ manages reactive state
API Service
    ↓ HTTP calls
```

## 📄 License

Proprietary - Entheospace © 2025

## 🤝 Contributing

Contact the development team for contribution guidelines.

