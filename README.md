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
2. Open Query Tool and run `db/schema.sql`.
3. Copy `.env.example` → `.env` and set your connection string:

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
src/app/           # Pages + API routes (backend)
src/components/ui/ # shadcn/ui
src/lib/db.ts      # PostgreSQL pool (pg)
db/schema.sql      # Tables for pgAdmin
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
