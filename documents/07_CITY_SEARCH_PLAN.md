# 07 — City / Discover Search Plan

**Phase:** Phase 2  
**Problem statement:** Required Screens §7 — City Search  
**Official mockup:** [Design 8 Activity/Trip Search](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1) (shared search chrome)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Search destinations with country, cost index, popularity (PS).
- Mockup Design 8: prominent **search bar** + stacked result cards with **“view and book”** (interpret as **View** / **Add to trip** — no payments).
- Can share `/search` page with tabs: Cities | Activities | Trips.

## B. User Flow

```text
Nav Discover → search CTA OR /search?type=city
 ↓
Enter query + optional country/region filters
 ↓
GET /api/cities
 ↓
Card → View (detail) or Add to trip (if tripId)
```

## C. Routes

| Route | Purpose |
|---|---|
| `/search` | Design 8 unified search |
| `/cities` | Alias/filter `type=city` |
| `/cities?tripId=` | Add-stop helper |

## D. Components

`SearchPage`, `SearchBar`, `CityFilters`, `SearchResultRow` (title + View/Add button), `CityCard`.

## E. shadcn/ui

`Input`, `Select`, `Button`, `Card`, `Badge`, `Tabs` (Cities/Activities), `Skeleton`, `Empty`, `Alert`, `Command` optional.

## F–I. DB / FKs / Migrations

`cities` from `001`; seeds power Top Destinations + search.

## J. API

`GET /api/cities?q&country&region&sort&limit` — **always** from PostgreSQL. Country/region filter option lists should come from `SELECT DISTINCT country/region FROM cities` (or aggregated discover metadata endpoint), not a hardcoded country array in the client.

**Errors:** 400, 401, 500. Dynamic data from DB — do not ship static city JSON for DoD.

## K–O. Validation / State / Flow / States / Security

URL params for query; auth for in-app search; add-to-trip ownership checks.

## P. Testing

Filter + seed match; wildcard abuse parameterized; empty DB → empty UI (not fake cities).

## Q. Order

Phase 2.

## R. Dependencies

```text
Depends On: DB cities, Auth
Used By: Builder, Discover, Profile saved cities
```

## S. Definition of Done

- [ ] Design 8 search bar + result rows with view/add
- [ ] Country/region filters (PS) from DB `DISTINCT` values
- [ ] Cost index + popularity visible
- [ ] DB-backed API only (no static city JSON / in-file arrays)
- [ ] States + tests
