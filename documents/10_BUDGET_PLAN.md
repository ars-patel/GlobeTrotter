# 10 — Budget & Stats Plan

**Phase:** Phase 3–4  
**Problem statement:** Required Screens §9 — Trip Budget & Cost Breakdown  
**Official mockup:** [Design 9 inline costs](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1), [Design 12 Stats View](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- **Design 9:** inline per-activity cost entry on itinerary days; over-budget awareness.
- **Design 12:** stats canvas with **pie + line + bar** charts and a **Trip Details** sidebar.
- PS: breakdown by transport/stay/activities/meals; avg cost/day; overbudget-day alerts.

Personal trip stats (Design 12) belong here for travelers; platform-wide admin stays in optional [`14`](./14_ADMIN_ANALYTICS_PLAN.md).

## B. User Flow

```text
From itinerary: edit slot costs (Design 9)
 ↓
Open /trips/[id]/stats or Budget/Stats tab (Design 12)
 ↓
GET /api/trips/[id]/budget
 ↓
View pie (categories), bar (by day), line (running total)
 ↓
Sidebar shows trip details / filters
 ↓
Add manual trip_costs for stay/transport/meals
```

## C. Routes

| Route | Purpose |
|---|---|
| `/trips/[tripId]/itinerary` | Inline costs (shared with 09) |
| `/trips/[tripId]/budget` or `/stats` | Design 12 charts |

## D. Components

`TripBudgetStatsPage`, `BudgetSummaryHeader`, `StatsChartsPanel` (pie/line/bar), `TripDetailsSidebar`, `CostLineForm`, `DailyCostList`, `OverBudgetAlert`, reuse `ItineraryActivitySlot`.

## E. shadcn/ui

`Chart` (recharts), `Card`, `Progress`, `Alert`, `Table`, `Select`, `Input`, `Button`, `Badge`, `Skeleton`, `Empty`, `Toast`, `Separator`.

## F. Database

`trips.budget_limit`, `trip_costs`, activity `custom_cost` / catalog `cost`.

## G–H. FKs / Relationships

`trip_costs.trip_id → trips.id CASCADE`.

## I. Migrations

Existing `001` + cost fields; no Design-12-specific table.

## J. API

| Method | Route | Response / body |
|---|---|---|
| `GET` | `/api/trips/[id]/budget` | totals, byCategory, byDay, avgPerDay, overBudgetDays, series for charts |
| `POST/PATCH/DELETE` | `/api/trips/[id]/costs…` | manual lines |

## K. Validation

category enum; amount ≥ 0; day within trip.

## L–O. State / Flow / States / Security

Server aggregates; owner-only; loading skeletons for chart panel; over-budget Alert.  
**Charts must use API series only** — never Recharts demo/sample datasets left in the page.

## P. Testing

Aggregation unit tests; chart series length; cross-user 403; empty trip → empty/zero charts (not fake data).

## Q. Order

After itinerary activities exist.

## R. Dependencies

```text
Depends On: Trips, trip_activities, trip_costs
Used By: Discover highlights (optional), Admin contrasts
```

## S. Definition of Done

- [ ] Inline costs on Design 9 itinerary
- [ ] Design 12 pie + line + bar + trip details sidebar from **live budget API**
- [ ] No hardcoded chart demo numbers in UI
- [ ] Category breakdown + avg/day + over-budget alerts (PS)
- [ ] Manual costs CRUD
- [ ] Tests + authz
