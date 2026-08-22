# Quick Start

## Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First-time setup

1. Copy `.env.example` → `.env` and set at least `DATABASE_URL` and `JWT_SECRET`.
2. Create the PostgreSQL database named in `DATABASE_URL` (e.g. `globetrotter`) and keep Postgres running.
3. Install dependencies:

```bash
npm install
```

4. Apply **migrations** and **seeds** (one command):

```bash
npm run db:apply
```

5. Start the app:

```bash
npm run dev
```

## Migrations & seeding

`npm run db:apply` runs pending SQL in order, then archives each file so it is not re-applied.

| Step | Folder | Purpose |
| --- | --- | --- |
| 1. Migrations | `backend/migrations/*.sql` | Create/alter tables |
| 2. Seeding | `backend/seeding/*.sql` | Insert bootstrap data (cities, demo users, etc.) |

- Only numbered files like `001_….sql` are applied (sorted numerically).
- After a successful apply, each file moves to `backend/migrations/archived/` or `backend/seeding/archived/`.
- Re-running `npm run db:apply` does nothing if there are no pending files.
- Fresh database: copy needed files back from `archived/` into the parent folder (or restore from git), then run `npm run db:apply` again.

Requires `DATABASE_URL` in `.env`.

Optional check:

```bash
npm run db:verify
```

## Useful URLs

| What | URL |
| --- | --- |
| App | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |

## Demo login (after seed)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `demo@globetrotter.app` | `password123` |
| User | `traveler@globetrotter.app` | `password123` |
