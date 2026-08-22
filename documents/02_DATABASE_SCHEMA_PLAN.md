# 02 — Database Schema Plan

**Phase:** Phase 0 (Foundation)  
**Problem statement:** Relational storage of itineraries, stops, activities, expenses  
**Official mockup:** Drives additive columns/tables for Designs 2, 4, 5, 9, 10  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Canonical PostgreSQL model for GlobeTrotter.
- Keep `001_initial_schema.sql` as base; add **`002_mockup_alignment.sql`** for official mockup fields/screens not fully covered by `001`.
- **All catalog / “static” content lives in PostgreSQL + seeds**, then is served by APIs. Never hardcode cities, activities, packing lists, banners, or featured trips in React.

## B. User Flow

```text
CREATE DATABASE globetrotter
 ↓
Apply 001_initial_schema.sql
 ↓
Apply 002_mockup_alignment.sql
 ↓
Run seeds (ONLY bootstrap path for reference data)
 ↓
App uses src/lib/db.ts — every screen reads live rows
```

### Dynamic data rule for this topic

| Bootstrap location | Runtime source of truth |
|---|---|
| `backend/seeding/*.sql` | `SELECT` via `/api/*` |
| Not `src/**/*.json` domain catalogs | Not in-component arrays |

## C–E. Pages / Components / shadcn

None (infrastructure). Health: `GET /api/health`.

## F. Database Planning — Tables

### `users` (001 + 002)

```text
id, email, password_hash, name,
first_name, last_name, username, phone,
home_city, home_country, additional_info,
photo_url, language, role, created_at, updated_at
```

Supports Design 1–2 and Design 7 profile.

### `cities` / `activities`

Unchanged catalog for Discover Top Destinations + Search (Designs 3, 5, 8).

### `trips` (001 + 002)

```text
id, user_id, name, description, cover_photo,
start_date, end_date,
start_point, end_point,          -- Design 4
is_public, share_slug, budget_limit,
is_featured BOOLEAN DEFAULT FALSE, -- Design 3 Featured Trips (admin/seed)
created_at, updated_at
```

### `trip_stops` / `trip_costs` / `saved_destinations`

As in `001`.

### `trip_activities` (001 + 002)

```text
…, start_time, end_time, is_done, …
-- Design 5 start + end time
-- Design 9 checkbox persistence (is_done BOOLEAN DEFAULT FALSE)
```

### `trip_packing_items` (**new** — Design 4)

```text
id          UUID PK
trip_id     UUID NOT NULL → trips.id ON DELETE CASCADE
label       VARCHAR(120) NOT NULL
checked     BOOLEAN NOT NULL DEFAULT FALSE
source      VARCHAR(40) NOT NULL DEFAULT 'weather_suggestion'
sort_order  INTEGER NOT NULL DEFAULT 0
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Weather packing grid (2×3 cards); checklist toggles allowed on trip.

### `community_posts` (**new** — Design 10)

```text
id          UUID PK
user_id     UUID NOT NULL → users.id ON DELETE CASCADE
body        TEXT NOT NULL
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### `packing_suggestion_templates` (**new** — Design 4 dynamic packing)

```text
id           UUID PK
season       VARCHAR(20) NOT NULL   -- e.g. winter|spring|summer|autumn|all
month_from   SMALLINT NULLABLE      -- 1-12 optional range
month_to     SMALLINT NULLABLE
label        VARCHAR(120) NOT NULL
sort_order   INTEGER NOT NULL DEFAULT 0
is_active    BOOLEAN NOT NULL DEFAULT TRUE
```

API selects templates by trip `start_date` month/season → copies into `trip_packing_items`. **Do not** hardcode suggestion arrays in the Create Trip page.

### `app_settings` (**new** — Discover banner & site copy)

```text
key          VARCHAR(100) PRIMARY KEY
value        TEXT NOT NULL
updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Example keys (seeded): `discover.banner_url`, `discover.banner_alt`. UI reads via `GET /api/discover` / `GET /api/settings`.

### Constraints cheat sheet

| Kind | Examples |
|---|---|
| PK | All `id` |
| UNIQUE | `users.email`, `users.username`, `cities(name,country)`, `trips.share_slug`, … |
| FK | See §G |
| INDEX | popularity, trip user, community created_at DESC |
| CHECK **Optional** | `trips.end_date >= start_date`, amounts ≥ 0 |

## G. Foreign Keys

```text
trips.user_id → users.id CASCADE
activities.city_id → cities.id CASCADE
trip_stops.trip_id → trips.id CASCADE
trip_stops.city_id → cities.id RESTRICT
trip_activities.stop_id → trip_stops.id CASCADE
trip_activities.activity_id → activities.id RESTRICT
trip_costs.trip_id → trips.id CASCADE
trip_packing_items.trip_id → trips.id CASCADE
saved_destinations.user_id → users.id CASCADE
saved_destinations.city_id → cities.id CASCADE
community_posts.user_id → users.id CASCADE
```

## H. Relationships

```text
User 1───N Trip | CommunityPost | SavedDestination
Trip 1───N Stop | Cost | PackingItem
Stop 1───N TripActivity N───1 Activity
City 1───N Activity | Stop
```

## I. Database Migrations

| File | Creates / Alters |
|---|---|
| `001_initial_schema.sql` | Core enums + tables (**exists**) |
| `002_mockup_alignment.sql` | User mockup columns; `trips.start_point/end_point/is_featured`; `trip_activities.end_time` / `is_done`; `trip_packing_items`; `packing_suggestion_templates`; `community_posts`; `app_settings` + indexes |
| Seeds | Cities, activities, packing templates, app_settings, demo user, optional featured trips + sample posts |

Order: `001` → `002` → seeds. Update `db/schema.sql` snapshot after `002`.

## J. API

`GET /api/health` only here.

## K–O. Validation / State / Flow / Errors / Security

Parameterized SQL only; least-privilege DB user **Optional Recommendation**.

## P. Testing Plan

Fresh migrate 001+002; seed; insert packing items + community post; FK cascade on trip delete removes packing items.

## Q. Implementation Order

**Phase 0 first.**

## R. Dependency Mapping

```text
Depends On: PostgreSQL, DATABASE_URL
Used By: Every feature topic
```

## S. Definition of Done

- [x] `001` + `002` applied (+ `003` check constraints)
- [x] Seeds run (catalogs only via SQL seeds, not frontend files) — cities/activities + packing templates + app_settings
- [x] `/api/health` OK (reports schema + catalog counts)
- [x] `db/schema.sql` updated
- [x] Mockup tables/columns documented and present (`packing_suggestion_templates`, `app_settings`, etc.)
- [x] No ad-hoc DDL in app routes
- [x] Confirmed no domain hardcoded lists required for schema to demo

### Apply / verify commands

```bash
npm run db:apply    # pending SQL → apply → archive
npm run db:verify   # confirm required tables + catalog counts
# GET http://localhost:3000/api/health
```
