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

1. Create a database (name must match `DATABASE_URL`, e.g. `GlobeTrotter`).
2. Copy `.env.example` → `.env` and set:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/GlobeTrotter
JWT_SECRET=change-me-to-a-long-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Apply pending migrations + seeds (then auto-archive applied files):

```bash
npm run db:apply
```

- Pending SQL lives in `backend/migrations/*.sql` and `backend/seeding/*.sql` (numbered `NNN_*.sql`).
- After a successful run, each file is moved to `backend/migrations/archived/` or `backend/seeding/archived/`.
- Re-running `npm run db:apply` is a no-op when nothing is pending.
- To re-apply on a **fresh** database, copy needed files back from `archived/` into the parent folder (or restore from git history), then run `db:apply` again.

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
backend/migrations/      # Pending table SQL (applied files → archived/)
backend/migrations/archived/
backend/seeding/         # Pending seed SQL (applied files → archived/)
backend/seeding/archived/
db/schema.sql            # Reference snapshot (prefer migrations)
scripts/db-apply.mjs     # npm run db:apply
```

## Screens (scaffolded)

- Login / Signup / Forgot & Reset password (working)
- Discover (post-login hub shell)
- My Trips / Create Trip
- City Search
- Profile / Schedule / Community (shells)

## API

- `GET /api/health` — DB connectivity check
- `POST /api/auth/signup` | `login` | `logout` | `forgot-password` | `reset-password`
- `GET /api/auth/me`
- `GET|POST /api/trips`
- `GET /api/cities`
- `GET /api/activities`

### Demo login (after seed)

- Email / username: `demo@globetrotter.app` / `demo`
- Password: `password123`
