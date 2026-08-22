# 08 — Activity Search / Add Activity Plan

**Phase:** Phase 2–3  
**Problem statement:** Required Screens §8 — Activity Search  
**Official mockup:** [Design 5 Add Activity](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1), [Design 8 Search](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Browse activities by type/cost/duration (PS).
- **Design 5** layout: stacked options with **Title, Description, Start Time, End Time**, buttons **View Map** and **Add to my trip**, footer **+ Add another activity**.
- Design 8: search results with view/add actions.

## B. User Flow

```text
From builder or /trips/[id]/activities
 ↓
List activity options for stop’s city (filters optional)
 ↓
User sets/edits Start Time + End Time on card
 ↓
View Map → map URL/embed for city or activity coords
 ↓
Add to my trip → POST trip_activity
 ↓
+ Add another activity → keep listing / clear selection
```

## C. Routes

| Route | Purpose |
|---|---|
| `/activities` | Search/browse (Design 8 tab) |
| `/trips/[tripId]/activities` | Design 5 add flow |
| Query `cityId`, `stopId` | Scope |

## D. Components

### Page Components

- `ActivitySearchPage`
- `AddActivityPage` (Design 5)

### Reusable Components

- `ActivityOptionCard` — title, description, start/end time inputs, View Map, Add to my trip
- `ActivityFilters`
- `ActivityQuickView`
- `AddAnotherActivityButton`
- `MapViewButton` — opens Dialog with map embed or external link

## E. shadcn/ui Components

| Component | Where | Why |
|---|---|---|
| `Card` | Each option | Design 5 rows |
| `Input` | Start/End time | Times |
| `Button` | View Map / Add | Actions |
| `Dialog` | Map / quick view | Overlay |
| `Select` / `Slider` | Filters | PS filters |
| `Badge`, `Skeleton`, `Empty`, `Alert`, `Toast` | Meta / states | UX |

## F. Database

`activities`, `cities`; write `trip_activities` with `start_time`, **`end_time`**.

```text
trip_activities.start_time  VARCHAR(8) NULLABLE
trip_activities.end_time    VARCHAR(8) NULLABLE  -- 002
```

Use `cities.latitude/longitude` for map.

## G. Foreign Keys

`activities.city_id → cities.id`; `trip_activities` → stop + activity.

## H. Relationships

City 1───N Activities; Activity scheduled via trip_activities.

## I. Migrations

`002_mockup_alignment.sql` adds `end_time`.

## J. API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/activities` | Filters type/cost/duration/cityId — rows from DB only |
| `POST` | `/api/trips/[id]/stops/[stopId]/activities` | `{ activity_id, day_date, start_time?, end_time? }` |

Activity **type** filter options: expose via API from DB enum/`DISTINCT type` (or shared `/api/meta/activity-types` reading PostgreSQL enum)—do not maintain a parallel hardcoded list in the client that can drift.

## K. Validation

`end_time` ≥ `start_time` if both present; activity belongs to stop city; times `HH:MM`.

## L. State

URL filters; local time fields per card; server results.

## M. Data Flow

```text
AddActivityPage → GET activities → ActivityOptionCard
 → Add → POST trip_activity → Toast → optional stay for + another
 → View Map → Dialog using lat/lng
```

## N. States

Loading skeletons; empty city activities; map unavailable Alert; success Toast.

## O. Security

Owner-only add; catalog read authenticated.

## P. Testing

Add with start/end; reject end before start; map button with null coords graceful.

## Q. Order

Phase 2 catalog; Design 5 page with Builder in Phase 3.

## R. Dependencies

```text
Depends On: Cities, Auth, Trips/Stops
Used By: Builder, Itinerary, Budget, Schedule
```

## S. Definition of Done

- [ ] Design 5 cards with start/end time, View Map, Add to my trip
- [ ] + Add another activity
- [ ] PS filters on search
- [ ] Activity cards loaded from `/api/activities` (no hardcoded options)
- [ ] `end_time` persisted
- [ ] States + ownership tests
