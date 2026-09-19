# Roxiler Store Rating Platform

A full-stack monorepo for the Roxiler Systems assignment - a store rating platform with role-based access control.

## Tech Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Backend**: Express.js + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Shared**: Types & Validation (Zod) packages
- **State Management**: Zustand + TanStack Query
- **Auth**: JWT + bcryptjs

## Project Structure

```
roxiler-assignment/
├── apps/
│   ├── backend/          # Express.js API
│   └── frontend/         # Next.js App
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── shared-validation/ # Shared Zod schemas
│   └── tsconfig/         # Shared TypeScript configs
├── turbo.json
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Bun >= 1.1.0
- PostgreSQL (via Docker or local)
- Node.js >= 20 (for compatibility)

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Setup Environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

### 4. Initialize Database

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Seed with demo data
bun run --filter=@roxiler/backend db:seed
```

### 5. Start Development Servers

```bash
bun run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## Demo Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@roxiler.com | Admin@123 |
| Store Owner | owner@roxiler.com | Admin@123 |
| Normal User | user@roxiler.com | Admin@123 |

## Available Scripts

```bash
# Development
bun run dev              # Start all dev servers
bun run dev --filter=@roxiler/backend   # Backend only
bun run dev --filter=@roxiler/frontend  # Frontend only

# Build
bun run build            # Build all packages

# Database
bun run db:generate      # Generate Prisma client
bun run db:push          # Push schema changes
bun run db:migrate       # Run migrations
bun run db:studio        # Open Prisma Studio
bun run db:seed          # Seed database

# Linting
bun run lint             # Lint all packages
bun run format           # Format with Prettier
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Users (Admin only)
- `GET /api/users` - List users (with filters, pagination, sorting)
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Stores
- `GET /api/stores` - List stores (with filters, pagination, sorting)
- `POST /api/stores` - Create store (Admin)
- `GET /api/stores/:id` - Get store details
- `PUT /api/stores/:id` - Update store (Admin/Owner)
- `DELETE /api/stores/:id` - Delete store (Admin)

### Ratings
- `POST /api/ratings/stores/:storeId` - Submit/Update rating (Normal User)
- `GET /api/ratings/stores/:storeId/my-rating` - Get user's rating
- `DELETE /api/ratings/stores/:storeId` - Delete rating
- `GET /api/ratings/store/:storeId` - Get all ratings for store (Owner/Admin)

### Dashboard
- `GET /api/dashboard/admin` - Admin stats
- `GET /api/dashboard/store-owner` - Store owner dashboard

## Form Validations

All validations are defined in `@roxiler/shared-validation` and used on both frontend and backend:

- **Name**: 20-60 characters
- **Email**: Valid email format
- **Address**: Max 400 characters
- **Password**: 8-16 chars, 1 uppercase, 1 special character
- **Rating**: 1-5 integers

## Features Implemented

- ✅ Role-based authentication (System Admin, Normal User, Store Owner)
- ✅ JWT-based auth with secure password hashing
- ✅ Admin dashboard with stats
- ✅ User management (CRUD + filters + sorting + pagination)
- ✅ Store management (CRUD + filters + sorting + pagination)
- ✅ Rating system (submit, update, delete, view)
- ✅ Store owner dashboard with ratings & average
- ✅ Normal user store browsing with search
- ✅ Password update for all roles
- ✅ Shared validation schemas (FE + BE)
- ✅ Type-safe database with Prisma
- ✅ End-to-end TypeScript types
- ✅ Responsive UI with Tailwind CSS

## License

MIT