# 09 — Itinerary View Plan

**Phase:** Phase 3  
**Problem statement:** Required Screens §6 — Itinerary View  
**Official mockup:** [Design 9 Itinerary Plan with Budget](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Show completed plan as **day-wise list of selected places/activities** (Design 9).
- Group by **Day 1, Day 2, …** with horizontal activity slots.
- Each slot: **checkbox + cost input** (inline budget — implement with [`10_BUDGET_PLAN.md`](./10_BUDGET_PLAN.md)).
- PS also asks calendar/list toggle — provide list as primary (mockup); calendar mode links to Schedule ([`11`](./11_CALENDAR_TIMELINE_PLAN.md)).

## B. User Flow

```text
Open /trips/[id]/itinerary
 ↓
GET itinerary + per-activity cost fields
 ↓
Browse Day sections
 ↓
Check items / enter costs → PATCH cost or custom_cost
 ↓
Toggle to Schedule view if desired
 ↓
Edit structure → Builder
```

## C. Routes

| Route | Purpose |
|---|---|
| `/trips/[tripId]/itinerary` | Design 9 primary |
| `/trips/[tripId]/view` | Alias |
| `?mode=list\|calendar` | List default; calendar → schedule |

## D. Components

`ItineraryViewPage`, `DaySection`, `ItineraryActivitySlot` (checkbox + cost input + title/time), `ViewModeToggle`, `TripSubNav`, shared with Budget summary header.

## E. shadcn/ui

`Checkbox`, `Input`, `Badge`, `Separator`, `Tabs`/`ToggleGroup`, `ScrollArea`, `Skeleton`, `Empty`, `Alert`, `Button`, `Card` (minimal).

## F–I. DB / Migrations

Read `trip_stops`, `trip_activities`, `activities`; costs via `custom_cost` and/or `trip_costs`. No new tables.

## J. API

`GET /api/trips/[id]/itinerary`  
`PATCH /api/trip-activities/[id]` for `custom_cost` / completion flag if added.

**Optional Recommendation:** `is_done BOOLEAN` on `trip_activities` for Design 9 checkbox persistence — add in `002` or small `003` if checkbox is not only UI-local.

Prefer persisting checkbox as `is_done` in `002_mockup_alignment.sql`.

## K. Validation

Cost ≥ 0; trip ownership.

## L–O. State / Flow / States / Security

Server itinerary; local editing with debounce save **Optional**; owner-only.

## P. Testing

Day grouping; cost patch; empty trip CTA to builder.

## Q. Order

Phase 3 after Builder has data; budget wiring with topic 10.

## R. Dependencies

```text
Depends On: Builder, Activity assign
Used By: Budget/Stats, Share public read-only clone of layout
```

## S. Definition of Done

- [ ] Day 1…N sections matching Design 9 from itinerary API
- [ ] Activity slots with checkbox + cost input (persisted, not local-only demo)
- [ ] Link to Schedule for calendar mode
- [ ] Authz + empty/loading/error
- [ ] Tests for day grouping
