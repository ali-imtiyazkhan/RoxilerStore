# Roxiler Store - Assignment Submission Notes

## Project Overview
Full-stack store rating application with role-based access control (System Admin, Store Owner, Normal User).

## Tech Stack
- **Monorepo**: Turborepo with Bun
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT with bcrypt password hashing
- **Shared Packages**: Types & Validation (Zod)

## Deployed URLs
- **Backend API**: https://roxilerstore.onrender.com
- **Frontend**: https://roxiler-store.vercel.app (to be deployed)
- **Health Check**: https://roxilerstore.onrender.com/health

## Architecture
```
roxiler-assignment/
├── apps/
│   ├── backend/          # Express API (port 3001)
│   │   ├── src/
│   │   │   ├── routes/   # auth, users, stores, ratings, dashboard
│   │   │   ├── middleware/ # auth, errorHandler
│   │   │   └── lib/      # prisma client
│   │   └── prisma/       # schema & migrations
│   └── frontend/         # Next.js App Router
│       └── src/app/      # pages by role (admin, owner, user)
├── packages/
│   ├── shared-types/     # TypeScript interfaces
│   └── shared-validation/# Zod schemas
└── turbo.json            # Build orchestration
```

## Key Features
- **Role-based access**: SYSTEM_ADMIN, STORE_OWNER, NORMAL_USER
- **Store CRUD** (Admin only)
- **User management** (Admin only)
- **Rating system**: Submit/update/delete ratings (1-5)
- **Dashboard stats**: Role-specific analytics
- **JWT auth**: Secure password requirements (8-16 chars, uppercase, special char)

## Environment Variables

### Backend (Render)
```
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ char secret>
NODE_ENV=production
FRONTEND_URL=https://roxiler-store.vercel.app
PORT=10000 (auto-assigned)
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://roxilerstore.onrender.com
```

## API Endpoints
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/password

GET    /api/users              (Admin)
POST   /api/users              (Admin)
GET    /api/users/:id          (Admin)
PUT    /api/users/:id          (Admin)
DELETE /api/users/:id          (Admin)

GET    /api/stores             (All authenticated)
POST   /api/stores             (Admin)
GET    /api/stores/:id         (All authenticated)
PUT    /api/stores/:id         (Admin/Owner)
DELETE /api/stores/:id         (Admin)

POST   /api/ratings/stores/:storeId           (User)
GET    /api/ratings/stores/:storeId/my-rating (User)
DELETE /api/ratings/stores/:storeId           (User)
GET    /api/ratings/store/:storeId            (Owner/Admin)

GET    /api/dashboard/admin       (Admin)
GET    /api/dashboard/store-owner (Store Owner)
```

## Database Schema
- **User**: id, name, email, password, address, role
- **Store**: id, name, email, address, ownerId (unique)
- **Rating**: id, value (1-5), userId, storeId (unique per user-store)

## Deployment Commands
```bash
# Local development
bun install
bun run dev          # Starts both frontend & backend

# Backend only
cd apps/backend
bun run dev
bun run db:push      # Sync schema
bun run db:studio    # Prisma Studio

# Build
bun run build        # Turbo builds all packages

# Database
bun run db:migrate   # Create migration
bun run db:generate  # Generate Prisma Client
bun run db:seed      # Seed test data
```

## Render Deployment (Backend)
- **Root Directory**: `apps/backend`
- **Build Command**: `bun install && tsc && bunx prisma generate --schema=prisma/schema.prisma`
- **Start Command**: `node dist/index.js`
- **Auto-deploy**: On push to main

## Vercel Deployment (Frontend)
- **Root Directory**: `apps/frontend`
- **Framework**: Next.js (auto-detected)
- **Env**: `NEXT_PUBLIC_API_URL=https://roxilerstore.onrender.com`

## Security Notes
- Passwords: bcrypt with 12 rounds
- JWT: HS256, 7-day expiry
- CORS: Restricted to frontend URL
- Rate limiting: 100 req/15min
- Helmet: Security headers
- Input validation: Zod schemas

## Test Credentials (after seeding)
```
Admin:     admin@roxiler.com / Admin@123
Owner:     owner@roxiler.com / Owner@123
User:      user@roxiler.com  / User@123
```

## Known Limitations
- Neon free tier pauses after 5min inactivity (cold start ~10s)
- Render free tier spins down after 15min inactivity
- No email verification flow implemented
- File uploads not supported

## Future Improvements
- Add email verification / password reset
- Image upload for stores
- Pagination cursor-based
- Real-time notifications (WebSocket)
- Comprehensive test suite
- CI/CD pipeline with tests