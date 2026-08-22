# 04 — Create Trip Plan

**Phase:** Phase 1  
**Problem statement:** Required Screens §3 — Create Trip  
**Official mockup:** [Design 4 Plan your trip](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Start a trip from mockup form **“Plan your trip.”**
- Fields: **Trip Name, Start Date, End Date, Start Point, End Point**.
- Section: **“Suggest the items for trip (based on weather)”** — 2×3 item cards.
- Also support PS: description + optional cover photo (can sit below mockup fields or in advanced section — do not drop PS fields; place without breaking Design 4 hierarchy).

## B. User Flow

```text
User opens /trips/new (from Discover CTA or Trips)
 ↓
AppHeader visible
 ↓
Enter Trip Name, Start/End dates, Start Point, End Point
 ↓
Optional description / cover (PS)
 ↓
System shows packing suggestion grid (rule-based or weather)
 ↓
User may toggle suggested items
 ↓
Validate → POST /api/trips (+ packing items)
 ↓
Redirect → builder or Add Activity flow
```

## C. Pages / Routes

| Route | Purpose |
|---|---|
| `/trips/new` | Design 4 create form |
| `/trips/[tripId]/edit` | Same form edit mode |

## D. Components

### Page Components

- `CreateTripPage`, `EditTripPage`

### Reusable Components

- `TripForm` — mockup fields + PS extras
- `DateRangePicker`
- `PackingSuggestionsGrid` — 2×3 cards (Design 4)
- `PackingItemCard` — label + optional checkbox

## E. shadcn/ui Components

| Component | Where | Why |
|---|---|---|
| `Input`, `Label`, `Textarea`, `Button` | Form | Standard |
| `Calendar` + `Popover` | Dates | Date UX |
| `Card` | Packing item tiles | Grid cards |
| `Checkbox` | Packing checked state | Toggle |
| `Alert`, `Toast`, `Skeleton` | States | Feedback |

## F. Database Planning

### `trips`

```text
name, start_date, end_date, start_point, end_point,
description, cover_photo, budget_limit, user_id, …
```

### `trip_packing_items`

```text
trip_id, label, checked, source, sort_order
```

| Column | Purpose |
|---|---|
| `start_point` / `end_point` | Design 4 journey endpoints (text; may later link city IDs) |
| packing `label` | Suggested item name |

## G. Foreign Keys

```text
trips.user_id → users.id CASCADE
trip_packing_items.trip_id → trips.id CASCADE
```

## H. Relationships

```text
User 1───N Trip 1───N PackingItem
```

## I. Migrations

`002_mockup_alignment.sql` — `start_point`, `end_point`, `trip_packing_items`, `packing_suggestion_templates`.

## J. API

| Method | Route | Body |
|---|---|---|
| `GET` | `/api/packing-suggestions?start_date=` | Returns template rows from DB for that date’s season/month |
| `POST` | `/api/trips` | `{ name, start_date, end_date, start_point, end_point, description?, cover_photo?, budget_limit?, packing_items?: [{label}] }` |
| `GET/PATCH` | `/api/trips/[id]/packing` | List / replace / toggle checked |

**Dynamic packing:** `GET /api/packing-suggestions` reads `packing_suggestion_templates` (seeded). Optional live weather API may *filter/reorder* those DB templates — never replace them with a hardcoded TS array. Persist chosen items into `trip_packing_items`.

## K. Validation

| Field | Rules |
|---|---|
| name | Required 1–200 |
| start_date / end_date | Required; end ≥ start |
| start_point / end_point | Required per mockup; 1–200 |
| description | Optional |
| packing labels | Max 12 items for create |

## L. State Management

Local form + suggestions list; submit → navigate by `trip.id`.

## M. Data Flow

```text
TripForm → GET packing-suggestions (DB) → PackingSuggestionsGrid
 → POST /api/trips → INSERT trip + packing → redirect builder
```

## N. States

Loading submit; Alert errors; Toast success.

## O. Security

Auth; force `user_id` from session.

## P. Testing

Date order; packing rows created; ownership.

## Q. Order

Phase 1 after Auth + `002`.

## R. Dependencies

```text
Depends On: Auth, DB 002
Used By: Trip History, Builder, Discover featured later
```

## S. Definition of Done

- [ ] Design 4 fields including start/end point
- [ ] Packing suggestions 2×3 grid from **API/DB templates** (not hardcoded)
- [ ] PS description/cover still available
- [ ] POST trip + redirect
- [ ] Validation + states + tests
