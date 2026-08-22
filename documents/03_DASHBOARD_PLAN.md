# 03 — Discover / Landing Plan

**Phase:** Phase 2 (needs cities + some trips for real content; shell can land earlier)  
**Problem statement:** Required Screens §2 — Dashboard / Home  
**Official mockup:** [Design 3 Main Landing](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Central **Discover** home after login (mockup Design 3), not a grid of internal links only.
- Layout: **Banner Image** → **Top Destinations** (5 cards) → **Featured Trips** (3 cards) + **See more**.
- Satisfies PS “welcome / recent trips / plan new trip / recommended destinations / budget highlights” by mapping:
  - Recommended destinations → Top Destinations
  - Trips inspiration → Featured Trips (+ See more → `/trips`)
  - Plan New Trip → CTA in header or banner area
  - Budget highlights → compact strip **or** link into Stats (**Optional** on this page if cluttered; prefer Featured + Destinations per mockup)

## B. User Flow

```text
Auth user opens / or /discover
 ↓
AppHeader: Discover | Trips | Schedule | Community | User Profile | Log Out
 ↓
Load banner config + top cities by popularity + featured/public trips
 ↓
Click destination → /search or /cities?q=
Click featured trip → /share/[slug] or /trips/[id]/itinerary (if owned)
See more → /trips
Plan trip CTA → /trips/new
```

## C. Pages / Routes

| Route | Purpose |
|---|---|
| `/` | Redirect authenticated → `/discover` |
| `/discover` | Design 3 landing |

## D. Components

### Page Components

- `DiscoverPage`

### Reusable Components

- `AppHeader` (global)
- `HeroBanner` — full-width banner image plane (mockup “Banner Image”)
- `TopDestinationsRow` — 5 city cards
- `FeaturedTripsRow` — 3 trip cards + See more link
- `DestinationCard`, `FeaturedTripCard`

## E. shadcn/ui Components

| Component | Where | Why | Customize? |
|---|---|---|---|
| `Button` | CTA / See more | Actions | No |
| `Card` | Destination & trip tiles | Interaction containers | Light |
| `Badge` | Popularity / cost index | Meta | No |
| `Skeleton` | Loading rows | UX | No |
| `Empty` | No featured trips | Fallback | No |
| `Alert` | Errors | Recovery | No |
| `Carousel` | **Optional** for destinations on mobile | Overflow | Optional |
| `NavigationMenu` / custom header links | AppHeader | Nav | Match mockup labels |

## F. Database Planning

Tables: `cities` (Top Destinations), `trips` (`is_featured` / `is_public`), `users` (welcome name), `app_settings` (banner).

**Dynamic only:** Top Destinations = `ORDER BY popularity` from DB. Featured Trips = `is_featured = true` (or public featured) from DB. Banner URL = `app_settings`. No JSX placeholder city names.

## G–H. FKs / Relationships

Read joins only; featured trips still owned by a user.

## I. Migrations

`002_mockup_alignment.sql` adds `trips.is_featured` + `app_settings`.

## J. API / Backend Planning

| Method | Route | Auth | Response |
|---|---|---|---|
| `GET` | `/api/discover` | Yes | `{ bannerUrl, topDestinations[5], featuredTrips[3], userDisplayName }` from SQL |

Compose alternatively from `GET /api/cities?sort=popularity&limit=5` + `GET /api/trips/featured?limit=3` + settings.

## K. Validation

Limit caps only.

## L. State Management

Server fetch on page load; URL none beyond route.

## M. Data Flow

```text
DiscoverPage → GET discover → HeroBanner + TopDestinationsRow + FeaturedTripsRow
```

## N. Error / Loading / Empty States

Skeleton banner + rows; empty destinations from missing seed; Alert on failure.

## O. Security

Only safe public/featured trip fields on Discover (no other users’ private trips unless `is_featured` set by trusted process).

## P. Testing Plan

Seed 5+ cities → row length 5; featured flag → card appears; unauthorized 401.

## Q. Implementation Order

Phase 2 after cities seed; AppHeader from Phase 0.

## R. Dependency Mapping

```text
Depends On: Auth, Cities, Trips (featured)
Used By: Post-login home; nav Discover
```

## S. Definition of Done

- [ ] Design 3 structure: Banner + Top Destinations + Featured Trips + See more
- [ ] All three content areas loaded from API/DB (no hardcoded cards)
- [ ] AppHeader mockup labels
- [ ] Dynamic cities/trips
- [ ] Loading / empty / error
- [ ] CTA to Plan trip / Trips
- [ ] Responsive
