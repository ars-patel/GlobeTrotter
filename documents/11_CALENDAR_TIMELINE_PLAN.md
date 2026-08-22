# 11 — Schedule / Calendar Plan

**Phase:** Phase 4  
**Problem statement:** Required Screens §10 — Trip Calendar / Timeline  
**Official mockup:** [Design 11 Calendar View](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1); top nav **Schedule**  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- **Schedule** nav item → month calendar with **highlighted days** that have trips/activities (Design 11).
- Trip-scoped calendar/timeline with expandable days + reorder (PS).
- Mockup shows a full-page month (e.g. January) with dark blocks on active dates.

## B. User Flow

```text
Click Schedule in AppHeader → /schedule
 ↓
GET /api/schedule (all user’s trip days) OR trip filter
 ↓
Month grid; highlighted days
 ↓
Click day → expand activities / open trip itinerary
 ↓
From trip: /trips/[id]/calendar for focused timeline + reorder
```

## C. Routes

| Route | Purpose |
|---|---|
| `/schedule` | Design 11 global schedule |
| `/trips/[tripId]/calendar` | Trip-focused calendar/timeline (PS) |

## D. Components

`SchedulePage`, `TripCalendarPage`, `MonthCalendarHighlight`, `DayExpandPanel`, `DraggableActivityRow` or up/down reorder, `QuickEditActivitySheet`, `AppHeader`.

## E. shadcn/ui

`Calendar`, `Collapsible`/`Accordion`, `Sheet`, `Button`, `Badge`, `ScrollArea`, `Skeleton`, `Empty`, `Alert`, `Toast`.

## F–I. DB / Migrations

Uses trip dates + `trip_activities.day_date`. Optional index on `day_date`.

## J. API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/schedule?month=YYYY-MM` | Owner’s highlighted dates + summaries |
| `GET` | `/api/trips/[id]/itinerary` | Trip calendar |
| `PUT` | `…/activities/reorder` | PS reorder |

## K–O. Validation / State / Flow / States / Security

URL `month=`; owner-only; empty month message; loading skeleton calendar.

## P. Testing

Highlights match trip ranges; day click payload; reorder authz.

## Q. Order

Phase 4 after itinerary data exists; `/schedule` can show trip date ranges even before activities.

## R. Dependencies

```text
Depends On: Auth, Trips, Activities (for day details)
Used By: AppHeader Schedule
```

## S. Definition of Done

- [ ] `/schedule` month view with highlighted days (Design 11) from `/api/schedule`
- [ ] Highlights derived from DB trip/activity dates (no fake marked days)
- [ ] Trip calendar/timeline with expand + reorder (PS)
- [ ] AppHeader Schedule link
- [ ] States + tests
