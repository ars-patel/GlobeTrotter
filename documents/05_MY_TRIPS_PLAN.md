# 05 — Trip History (My Trips) Plan

**Phase:** Phase 1  
**Problem statement:** Required Screens §4 — My Trips  
**Official mockup:** [Design 6 Your Trip History](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- List user’s trips as **Your Trip History** with three sections:
  - **Ongoing**
  - **Upcoming**
  - **Completed**
- Each section: short list view of trips.
- PS actions still required: edit / view / delete; destination count on cards where space allows.

## B. User Flow

```text
User opens /trips (nav Trips)
 ↓
GET /api/trips?segmented=1
 ↓
Render Ongoing / Upcoming / Completed blocks
 ↓
Open trip → itinerary (Design 9) or builder
Edit / Delete via actions
Plan new → /trips/new
```

### Segment rules

```text
today = CURRENT_DATE
Ongoing:   start_date <= today <= end_date
Upcoming:  start_date > today
Completed: end_date < today
```

## C. Pages / Routes

| Route | Purpose |
|---|---|
| `/trips` | Design 6 history |
| `/trips/[tripId]/edit` | Edit metadata |
| `/trips/[tripId]/itinerary` | View (Design 9) |

## D. Components

### Page Components

- `TripHistoryPage`

### Reusable Components

- `TripSegmentSection` — title + list (Ongoing/Upcoming/Completed)
- `TripListRow` / `TripCard` — short list view per mockup
- `ConfirmDeleteDialog`
- `AppHeader`

## E. shadcn/ui Components

`Card`, `Button`, `Badge`, `DropdownMenu`, `AlertDialog`, `Skeleton`, `Empty`, `Alert`, `Toast`, `Separator` (between segments).

## F. Database

`trips`, `trip_stops` (count). No new tables; segmentation is query-time.

## G–H. FKs / Relationships

`trips.user_id → users.id`; Trip 1───N Stops.

## I. Migrations

None beyond existing.

## J. API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/trips` | Owner only; return `{ ongoing, upcoming, completed }` **or** flat list + client segment |
| `GET/PATCH/DELETE` | `/api/trips/[id]` | Owner checks |

Replace unscoped scaffold GET.

## K. Validation

UUID params; PATCH same as create for provided fields.

## L. State

Server list; local delete dialog; **Optional** URL `?tab=ongoing`.

## M. Data Flow

```text
TripHistoryPage → GET trips → three TripSegmentSections → actions
```

## N. States

| Empty segment | Hide section or show “None” |
| All empty | Empty + Plan your first trip |
| Loading | Skeletons per section |

## O. Security

Owner-only list/mutate.

## P. Testing

Fixture trips in each segment; cross-user isolation; delete cascade.

## Q. Order

Phase 1 with Create Trip.

## R. Dependencies

```text
Depends On: Auth, Create Trip
Used By: Nav Trips; Profile planned/previous subsets
```

## S. Definition of Done

- [ ] Design 6 three segments
- [ ] Segments computed from API trip dates (no hardcoded sample trips)
- [ ] Short list rows with view/edit/delete
- [ ] User-scoped API
- [ ] Empty/loading/error
- [ ] Tests for date segmentation
