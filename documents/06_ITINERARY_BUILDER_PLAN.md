# 06 — Itinerary Builder Plan

**Phase:** Phase 3  
**Problem statement:** Required Screens §5 — Itinerary Builder  
**Official mockup:** Supports multi-stop planning; activity UI detailed in Design 5 (see [`08`](./08_ACTIVITY_SEARCH_PLAN.md)); day+budget in Design 9  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Construct multi-city plan: add stops, dates, activities, reorder cities (PS).
- Wire tightly to Design 5 **Add Activity** and Design 9 itinerary list.
- Builder is the structural editor; Design 5 is the activity-picking presentation.

## B. User Flow

```text
/trips/[id]/builder
 ↓
Load stops
 ↓
Add Stop → city search
 ↓
Add Activity → Design 5 flow (/activities or panel)
 ↓
Reorder stops
 ↓
Open Itinerary (Design 9) to review days + costs
```

## C. Routes

`/trips/[tripId]/builder`  
Deep link: `/trips/[tripId]/activities` for Design 5 list.

## D. Components

`ItineraryBuilderPage`, `StopList`, `StopCard`, `AddStopDialog`, `ReorderStopsControl`, `TripSubNav`, integrate `ActivityOptionCard` from topic 08.

## E. shadcn/ui

`Button`, `Dialog`/`Sheet`, `Combobox`/`Command`, `Calendar`/`Popover`, `Badge`, `ScrollArea`, `AlertDialog`, `Skeleton`, `Alert`, `Separator`.

## F–H. Database / FKs / Relationships

`trip_stops`, `trip_activities` (+ `end_time` from 002). Unchanged relationship graph.

## I. Migrations

`002` for `end_time` only.

## J. API

Same as prior plan: itinerary GET, stops CRUD, reorder, trip-activities CRUD — plus `end_time` on activity assign.

## K. Validation

Stop dates within trip; activity city match; `end_time` ≥ `start_time` when both set; `day_date` in stop range.

## L–O. State / Flow / States / Security

Server itinerary; local dialogs; owner-only mutations.

## P. Testing

Add two stops, reorder, assign activity with start/end time, unauthorized denied.

## Q. Order

Phase 3 after Search topics.

## R. Dependencies

```text
Depends On: Trips, City Search, Activity Search
Used By: Itinerary View, Budget, Schedule, Share
```

## S. Definition of Done

- [ ] Add/reorder stops
- [ ] Launch Design 5 add-activity flow
- [ ] Persist end_time
- [ ] Owner authz + tests
