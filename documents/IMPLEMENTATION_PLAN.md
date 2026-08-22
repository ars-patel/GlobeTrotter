# GlobeTrotter — Implementation Plan

**Primary source of truth (requirements):** [`PROBLEM_STATEMENT.md`](./PROBLEM_STATEMENT.md)  
**Primary source of truth (UI / IA):** Official mockup — [Excalidraw: GlobeTrotter - 8 hours](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Status:** Planning only — do not implement until topic documents are followed in order.  
**Stack (existing — do not replace):** Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui (neutral), PostgreSQL via `pg`, Zod, bcryptjs, jsonwebtoken, date-fns, recharts.

When the written problem statement and the mockup differ on **layout, navigation, or screen composition**, prefer the **mockup**. When they differ on **must-have product capabilities**, keep both: implement problem-statement capabilities using mockup screen structure. Anything only in the mockup and not in the problem statement is still in scope for this hackathon because the mockup is official — document it clearly below.

---

## 0. Official Mockup Screen Map (Design 1–12)

| Mockup | Screen | Maps to topic | Notes vs earlier plan |
|---|---|---|---|
| Design 1 | Login (logo, **Username**, Password, Login) | [`01`](./01_AUTHENTICATION_PLAN.md) | Centered auth card; username field (store as email or dedicated `username`) |
| Design 2 | Register (First/Last name, Email, Phone, City, Country, Additional info) | [`01`](./01_AUTHENTICATION_PLAN.md) | Richer signup than email-only; password still required (PS) |
| Design 3 | Landing / Discover — Banner, Top Destinations, Featured Trips | [`03`](./03_DASHBOARD_PLAN.md) | Not a link-grid hub; marketing/discover home |
| Design 4 | Plan your trip — name, dates, **Start Point**, **End Point**, weather packing grid | [`04`](./04_CREATE_TRIP_PLAN.md) | Start/end points + packing suggestions |
| Design 5 | Add activity — cards with times, **View Map**, **Add to my trip** | [`08`](./08_ACTIVITY_SEARCH_PLAN.md) + [`06`](./06_ITINERARY_BUILDER_PLAN.md) | Start **and end** time; map action |
| Design 6 | Your Trip History — **Ongoing / Upcoming / Completed** | [`05`](./05_MY_TRIPS_PLAN.md) | Segmented lists, not a flat grid only |
| Design 7 | User Profile — avatar, editable details, **Planned** + **Previous** trip cards | [`13`](./13_PROFILE_SETTINGS_PLAN.md) | Trip history on profile |
| Design 8 | Search — search bar + result cards (**view and book**) | [`07`](./07_CITY_SEARCH_PLAN.md) + [`08`](./08_ACTIVITY_SEARCH_PLAN.md) | Unified Discover search; “book” = view/add (no payment) |
| Design 9 | Itinerary list by Day + inline cost checkboxes/inputs | [`09`](./09_ITINERARY_VIEW_PLAN.md) + [`10`](./10_BUDGET_PLAN.md) | **Combined** itinerary + budget on one screen |
| Design 10 | **Community Talk** — feed + “Add your thoughts” sidebar | [`15`](./15_COMMUNITY_PLAN.md) | Official mockup screen (beyond PS share-only) |
| Design 11 | Calendar (month, highlighted days) under **Schedule** | [`11`](./11_CALENDAR_TIMELINE_PLAN.md) | Top-nav “Schedule” |
| Design 12 | Stats — pie + line + bar + trip-details sidebar | [`10`](./10_BUDGET_PLAN.md) / [`14`](./14_ADMIN_ANALYTICS_PLAN.md) | Personal trip/spend stats in Budget; admin remains optional |

### Global app chrome (mockup)

Consistent top bar after auth (Designs 3–12):

```text
[Logo] GlobeTrotter     Discover | Trips | Schedule | Community | User Profile     [Sign In / Log Out]
```

| Nav label | Primary route |
|---|---|
| Discover | `/` or `/discover` (Design 3 landing) |
| Trips | `/trips` (Design 6 history; create via CTA) |
| Schedule | `/schedule` (Design 11 calendar; trip-scoped calendar also under trip) |
| Community | `/community` (Design 10) |
| User Profile | `/profile` (Design 7) |

Shared shell component: `AppHeader` / `AppNav`.

---

## 1. Project Objective

Build a **personalized multi-city travel planning app** matching the official mockup IA and the problem statement capabilities:

- Authenticate (login + rich registration)
- Discover destinations and featured trips (banner landing)
- Create trips with points, dates, and weather-based packing suggestions
- Manage trip history by Ongoing / Upcoming / Completed
- Search cities/activities; add activities with times and map view
- Day-wise itinerary with inline budget tracking
- Schedule/calendar visualization and stats charts
- Community talk feed + public itinerary sharing
- Profile with planned/previous trips

Relational PostgreSQL + dynamic APIs. Responsive UI.

---

## 1A. Dynamic Data Mandate (non-negotiable)

Hackathon must-have: **real-time / dynamic data**. GlobeTrotter must **not** ship UI powered by hardcoded arrays, fixture objects, or static JSON files in the frontend.

### Rules

| Allowed | Forbidden in app UI / API handlers |
|---|---|
| Read/write via Next.js API → PostgreSQL (`src/lib/db.ts`) | `const CITIES = [...]` / `TRIPS = [...]` / `ACTIVITIES = [...]` in components or pages |
| Bootstrap/reference rows in `backend/seeding/*.sql` then loaded by API | `import data from './cities.json'` used as the live source |
| Empty states when DB has no rows | Fake demo cards painted in JSX to look “full” |
| Chart series computed from `trip_costs` / `trip_activities` queries | Hardcoded pie/bar/line demo numbers |
| Packing suggestions from DB templates (or live weather API) | Hardcoded packing item lists in TSX |
| Discover banner / copy from `app_settings` (or similar) table | Hardcoded banner URL + destination names in the page |
| Enums validated with Zod mirroring DB enums | Separate hardcoded filter option lists that can drift from DB |

### If you need “static” catalog data

Treat it as **database seed data**, not frontend constants:

```text
backend/seeding/*.sql
        ↓
PostgreSQL tables (cities, activities, packing templates, app_settings, …)
        ↓
GET /api/...
        ↓
UI renders whatever the API returns (0..N rows)
```

Changing a city name, featured trip, or packing item must be possible by **updating the database** (or re-running seeds)—not by editing React source.

### Temporary prototype exception

Static JSON is allowed **only** during the first hours of scaffolding a screen. It is **not** done until replaced with API/DB data. Topic Definition of Done checklists must include a dynamic-data item.

### Verification (final integration)

- [ ] No feature list/grid uses in-file sample arrays
- [ ] Discover, Search, Trips, Activities, Community, Schedule, Budget charts all hit APIs
- [ ] Seeds alone can populate a demo; UI stays empty-safe without seeds
- [ ] Grep hygiene: no committed `*.json` catalogs under `src/` for domain entities

---

## 2. Complete Feature List

| # | Feature | Required? | Topic Doc |
|---|---|---|---|
| 1 | Login / Signup (+ Forgot Password from PS) | **Must** | [`01_AUTHENTICATION_PLAN.md`](./01_AUTHENTICATION_PLAN.md) |
| 2 | Database schema + seeding (+ mockup additive migration) | **Must** | [`02_DATABASE_SCHEMA_PLAN.md`](./02_DATABASE_SCHEMA_PLAN.md) |
| 3 | Discover / Landing (Banner, Top Destinations, Featured Trips) | **Must** | [`03_DASHBOARD_PLAN.md`](./03_DASHBOARD_PLAN.md) |
| 4 | Create Trip (incl. start/end point, packing suggestions) | **Must** | [`04_CREATE_TRIP_PLAN.md`](./04_CREATE_TRIP_PLAN.md) |
| 5 | Trip History (Ongoing / Upcoming / Completed) | **Must** | [`05_MY_TRIPS_PLAN.md`](./05_MY_TRIPS_PLAN.md) |
| 6 | Itinerary Builder (stops, reorder, wire to Add Activity) | **Must** | [`06_ITINERARY_BUILDER_PLAN.md`](./06_ITINERARY_BUILDER_PLAN.md) |
| 7 | City / Discover Search | **Must** | [`07_CITY_SEARCH_PLAN.md`](./07_CITY_SEARCH_PLAN.md) |
| 8 | Activity Search / Add Activity (times, View Map, Add) | **Must** | [`08_ACTIVITY_SEARCH_PLAN.md`](./08_ACTIVITY_SEARCH_PLAN.md) |
| 9 | Itinerary View (day list; pairs with budget UI) | **Must** | [`09_ITINERARY_VIEW_PLAN.md`](./09_ITINERARY_VIEW_PLAN.md) |
| 10 | Budget + Stats charts (Design 9 inline + Design 12) | **Must** | [`10_BUDGET_PLAN.md`](./10_BUDGET_PLAN.md) |
| 11 | Schedule / Calendar | **Must** | [`11_CALENDAR_TIMELINE_PLAN.md`](./11_CALENDAR_TIMELINE_PLAN.md) |
| 12 | Shared / Public Itinerary (PS) | **Must** | [`12_PUBLIC_SHARING_PLAN.md`](./12_PUBLIC_SHARING_PLAN.md) |
| 13 | User Profile (planned + previous trips) | **Must** | [`13_PROFILE_SETTINGS_PLAN.md`](./13_PROFILE_SETTINGS_PLAN.md) |
| 14 | Admin / Analytics | **Optional** (PS) | [`14_ADMIN_ANALYTICS_PLAN.md`](./14_ADMIN_ANALYTICS_PLAN.md) |
| 15 | Community Talk | **Must** (official mockup Design 10) | [`15_COMMUNITY_PLAN.md`](./15_COMMUNITY_PLAN.md) |

**Out of scope:** real payment/booking engines, live map vendor accounts if unavailable (use placeholder map link / OpenStreetMap embed as **Optional Recommendation**), social OAuth unless time allows (**Optional Recommendation**).

“View and book” in Design 8 means **view detail / add to trip**, not commerce.

---

## 3. Recommended Implementation Order

```text
Phase 0 — Foundation
  02 Database Schema (+ 002 mockup alignment migration)
  01 Authentication (login + rich register)
  AppHeader nav shell (Discover | Trips | Schedule | Community | Profile)

Phase 1 — Trip Core
  04 Create Trip (start/end point + packing suggestions UX)
  05 Trip History (Ongoing / Upcoming / Completed)

Phase 2 — Discovery
  03 Discover Landing (banner, top destinations, featured trips)
  07 City Search
  08 Activity Search / Add Activity

Phase 3 — Itinerary
  06 Itinerary Builder
  09 + 10 Itinerary day list with inline budget (Design 9)
  10 Stats charts panel (Design 12)

Phase 4 — Schedule & Profile
  11 Schedule / Calendar
  13 Profile (planned / previous)

Phase 5 — Social
  15 Community Talk
  12 Public Sharing (share slug / copy trip)

Phase 6 — Optional
  14 Admin / Analytics
```

### Sequential chain

```text
Auth → Discover Landing
  → Create Trip (points + packing)
    → Trip History segments
      → Search Cities/Activities → Add Activity (map + times)
        → Builder / Day itinerary + inline costs
          → Schedule calendar + Stats charts
            → Profile trip cards
              → Community Talk + Public Share
```

---

## 4. Database Architecture Overview

**Engine:** PostgreSQL via `src/lib/db.ts`  
**Migrations:** `backend/migrations/`  
**Seeds:** `backend/seeding/`  
**Snapshot:** `db/schema.sql`

### Tables

| Table | Purpose |
|---|---|
| `users` | Accounts + mockup profile fields |
| `cities` | Destination catalog (Top Destinations) |
| `activities` | Activity catalog |
| `trips` | Plans (+ start/end point; featured/public flags) |
| `trip_stops` | Ordered city stops |
| `trip_activities` | Scheduled activities (+ end_time) |
| `trip_costs` | Manual cost lines |
| `trip_packing_items` | Weather packing checklist (Design 4) — **additive** |
| `saved_destinations` | Saved cities |
| `community_posts` | Community Talk (Design 10) — **additive** |
| `packing_suggestion_templates` | Season/month packing catalog for Design 4 — **seeded, API-read** |
| `app_settings` | Key/value site content (e.g. discover banner URL) — **dynamic config** |

### Enums (existing)

`user_role`, `activity_type`, `budget_category`

### Migrations

| File | Scope |
|---|---|
| `001_initial_schema.sql` | **Exists** — core tables |
| `002_mockup_alignment.sql` | **Plan** — user profile columns, trip start/end point, `trip_activities.end_time`, packing + community + `app_settings` + packing templates |
| Seeds | **Only** place for bootstrap catalogs: cities, activities, packing templates, app_settings, sample featured trips / community posts |

Details in [`02_DATABASE_SCHEMA_PLAN.md`](./02_DATABASE_SCHEMA_PLAN.md).

---

## 5. Table Relationships Overview

```text
users 1───N trips
users 1───N community_posts
users 1───N saved_destinations N───1 cities
users 1───N trip_packing_items (via trips)

cities 1───N activities
cities 1───N trip_stops

trips 1───N trip_stops
trips 1───N trip_costs
trips 1───N trip_packing_items

trip_stops 1───N trip_activities
activities 1───N trip_activities
```

---

## 6. Foreign Keys (global)

| Child.column | Parent | ON DELETE |
|---|---|---|
| `trips.user_id` | `users.id` | CASCADE |
| `activities.city_id` | `cities.id` | CASCADE |
| `trip_stops.trip_id` | `trips.id` | CASCADE |
| `trip_stops.city_id` | `cities.id` | RESTRICT / NO ACTION |
| `trip_activities.stop_id` | `trip_stops.id` | CASCADE |
| `trip_activities.activity_id` | `activities.id` | RESTRICT / NO ACTION |
| `trip_costs.trip_id` | `trips.id` | CASCADE |
| `trip_packing_items.trip_id` | `trips.id` | CASCADE |
| `saved_destinations.user_id` | `users.id` | CASCADE |
| `saved_destinations.city_id` | `cities.id` | CASCADE |
| `community_posts.user_id` | `users.id` | CASCADE |

---

## 7. Pages / Routes (mockup-aligned)

| Route | Mockup | Auth |
|---|---|---|
| `/login` | Design 1 | Public |
| `/signup` | Design 2 | Public |
| `/forgot-password`, `/reset-password` | PS | Public |
| `/` or `/discover` | Design 3 | Private (or public teaser **Optional**) |
| `/trips/new` | Design 4 | Private |
| `/trips` | Design 6 | Private |
| `/trips/[tripId]/activities` or builder add flow | Design 5 | Private |
| `/profile` | Design 7 | Private |
| `/search` or `/cities` + `/activities` | Design 8 | Private |
| `/trips/[tripId]/itinerary` (view+budget) | Design 9 | Private |
| `/community` | Design 10 | Private |
| `/schedule` | Design 11 | Private |
| `/trips/[tripId]/stats` or budget stats tab | Design 12 | Private |
| `/trips/[tripId]/builder` | PS builder | Private |
| `/share/[slug]` | PS public share | Public |
| `/admin` | Optional PS | ADMIN |

Trip sub-nav still useful: Itinerary | Builder | Schedule | Stats | Share.

---

## 8. Components Strategy

- **Shell:** `AppHeader` matching mockup nav labels exactly.
- **Feature components** under `src/components/` composed by thin `page.tsx` routes.
- **UI:** shadcn/ui only for primitives (`Button`, `Card`, `Input`, `Tabs`, `Calendar`, `Chart`, `Dialog`, `Avatar`, `Checkbox`, `Textarea`, `Skeleton`, `Empty`, `Alert`, `Toast`, etc.).

---

## 9. API / Backend Overview

Auth, trips, stops, activities, cities, costs/budget, schedule, profile, share, **community posts**, packing items, health.  
Ownership checks on all private trip resources.  
Community posts are authenticated create; feed readable to authenticated users (public feed **Optional Recommendation**).

---

## 10. Authentication Requirements

- Design 1: Username + Password login card  
- Design 2: First name, last name, email, phone, city, country, additional info + password (PS)  
- Forgot Password (PS)  
- JWT session; protect private routes  
- `role` for optional admin  

---

## 11. Data Flow Between Pages

```text
Login/Register → Discover (banner, destinations, featured)
  ├─ Trips → History segments → open itinerary / builder
  ├─ Plan trip → packing suggestions → builder / add activity
  ├─ Search → view → add to trip
  ├─ Schedule → month highlights
  ├─ Community → posts feed
  └─ Profile → planned / previous + edit details

Itinerary (Design 9) ↔ inline costs ↔ Stats charts (Design 12)
Share → /share/[slug] (PS) parallel to Community
```

---

## 12. Feature Dependencies

```text
Auth + DB → AppHeader
Create Trip → Trip History, Discover featured, Profile trip cards
Cities/Activities → Search, Add Activity, Builder
Builder → Itinerary+Budget, Schedule, Stats, Share
Community → Auth (independent of trips but uses users)
Admin → optional aggregates
```

---

## 13. MVP vs Optional

### MVP

All mockup Designs 1–12 capabilities listed above + PS public share + forgot password + multi-city stops/activities relational model.

### Optional (PS Admin)

- Admin analytics dashboard (`14`)

### Optional Recommendations

- Live weather API for packing (still persist results into `trip_packing_items`; templates remain in DB)
- Map provider embed for “View Map” (coords still from `cities` / `activities` rows)
- Real “book” integrations
- Google OAuth

---

## 14. Testing Strategy

Unit (Zod, date segmentation Ongoing/Upcoming/Completed, budget aggregate), API ownership tests, integration happy path matching mockup flow Login → Discover → Plan trip → Add activity → Itinerary/budget → Schedule → Community → Profile.

**Dynamic-data tests:** empty DB → empty UI; after seed → lists populate; mutating a seeded city via SQL changes Search/Discover without code changes.

---

## 15. Final Integration / Testing Plan

1. Migrate `001` + `002_mockup_alignment` + seeds.  
2. Walk Designs 1→12 UI smoke on desktop + mobile.  
3. Confirm nav labels match mockup.  
4. Confirm trip history three segments.  
5. Confirm itinerary day list allows cost entry.  
6. Confirm community post create/list.  
7. Confirm second user cannot mutate first user’s trips.  
8. Confirm public share still works (PS).  
9. Confirm **no hardcoded domain lists** in `src/` (cities/trips/activities/posts/chart demos).  
10. Confirm Discover/Search/Community/Budget work from API with seeds removed (empty states) and with seeds applied (data visible).  

---

## 16. Topic Document Index

1. [`01_AUTHENTICATION_PLAN.md`](./01_AUTHENTICATION_PLAN.md)  
2. [`02_DATABASE_SCHEMA_PLAN.md`](./02_DATABASE_SCHEMA_PLAN.md)  
3. [`03_DASHBOARD_PLAN.md`](./03_DASHBOARD_PLAN.md) — Discover / Landing  
4. [`04_CREATE_TRIP_PLAN.md`](./04_CREATE_TRIP_PLAN.md)  
5. [`05_MY_TRIPS_PLAN.md`](./05_MY_TRIPS_PLAN.md) — Trip History  
6. [`06_ITINERARY_BUILDER_PLAN.md`](./06_ITINERARY_BUILDER_PLAN.md)  
7. [`07_CITY_SEARCH_PLAN.md`](./07_CITY_SEARCH_PLAN.md)  
8. [`08_ACTIVITY_SEARCH_PLAN.md`](./08_ACTIVITY_SEARCH_PLAN.md) — Add Activity  
9. [`09_ITINERARY_VIEW_PLAN.md`](./09_ITINERARY_VIEW_PLAN.md)  
10. [`10_BUDGET_PLAN.md`](./10_BUDGET_PLAN.md) — inline + stats  
11. [`11_CALENDAR_TIMELINE_PLAN.md`](./11_CALENDAR_TIMELINE_PLAN.md) — Schedule  
12. [`12_PUBLIC_SHARING_PLAN.md`](./12_PUBLIC_SHARING_PLAN.md)  
13. [`13_PROFILE_SETTINGS_PLAN.md`](./13_PROFILE_SETTINGS_PLAN.md)  
14. [`14_ADMIN_ANALYTICS_PLAN.md`](./14_ADMIN_ANALYTICS_PLAN.md) *(Optional)*  
15. [`15_COMMUNITY_PLAN.md`](./15_COMMUNITY_PLAN.md) — Community Talk  

---

## 17. Definition of Done (whole project)

- [ ] Mockup Designs 1–12 represented in UI
- [ ] AppHeader nav matches Discover | Trips | Schedule | Community | User Profile
- [ ] Migrations applied including mockup alignment
- [ ] Dynamic data mandate satisfied (API + PostgreSQL only; seeds for catalogs; no hardcoded UI lists)
- [ ] Auth + ownership enforced
- [ ] Validation on client + server
- [ ] Public sharing (PS) + Community Talk (mockup)
- [ ] Responsive layouts
- [ ] Integration path verified
