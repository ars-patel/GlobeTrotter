# GlobeTrotter

Personalized multi-city travel planning — **Next.js** (App Router + API routes), **PostgreSQL** (pgAdmin), **shadcn/ui**.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16, React, Tailwind CSS, shadcn/ui (neutral theme) |
| Backend | Next.js Route Handlers under `src/app/api` |
| Database | PostgreSQL via `pg` (no Prisma) — manage with pgAdmin |

## Setup

### 1. PostgreSQL (pgAdmin)

1. Create a database named `globetrotter`.
2. Open Query Tool and run migrations in order from `backend/migrations/` (start with `001_initial_schema.sql`).
3. Optionally run seeds from `backend/seeding/` (e.g. `001_sample_cities_activities.sql`).
4. Copy `.env.example` → `.env` and set your connection string:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/globetrotter
JWT_SECRET=change-me-to-a-long-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install & run

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)  
Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Project structure

```
src/app/                 # Pages + API routes
src/components/          # Reusable feature components
src/components/ui/       # shadcn/ui primitives
src/lib/db.ts            # PostgreSQL pool (pg)
backend/migrations/      # Table / model SQL migrations
backend/seeding/         # Seed data SQL
db/schema.sql            # Reference snapshot (prefer migrations)
```

## Screens (scaffolded)

- Login / Signup
- Dashboard
- My Trips / Create Trip
- City Search
- Profile

## API (scaffolded)

- `GET /api/health` — DB connectivity check
- `POST /api/auth` — auth stub
- `GET|POST /api/trips`
- `GET /api/cities`
- `GET /api/activities`
