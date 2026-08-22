# 13 — Profile / Settings Plan

**Phase:** Phase 4  
**Problem statement:** Required Screens §12 — User Profile / Settings  
**Official mockup:** [Design 7 User Profile](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Design 7: large **profile photo**, **user details with edit**, then:
  - **Planned Trip** — row of cards + **View**
  - **Previous Trip** — row of cards + **View**
- PS also: editable name/photo/email, language, delete account, saved destinations list (keep; place under details or secondary tab so mockup hierarchy stays primary).

## B. User Flow

```text
Nav User Profile → /profile
 ↓
GET profile + planned/previous trips + saved destinations
 ↓
Edit details (Design 2 fields) → PATCH
 ↓
View planned/previous card → itinerary
 ↓
Delete account → confirm → logout
```

### Trip buckets on profile

```text
Planned  ≈ Upcoming (+ optional Ongoing)
Previous ≈ Completed
```

## C. Routes

`/profile`

## D. Components

`ProfileSettingsPage`, `ProfileHeader` (avatar + details + edit), `ProfileTripRow` (Planned / Previous), `ProfileTripCard` + View button, `SavedDestinationsList`, `DeleteAccountDialog`, `ProfileForm`.

## E. shadcn/ui

`Avatar`, `Input`, `Textarea`, `Select`, `Button`, `Card`, `AlertDialog`, `Badge`, `Separator`, `Alert`, `Toast`, `Skeleton`, `Empty`, `Label`.

## F. Database

`users` mockup columns (002); `trips` for planned/previous; `saved_destinations`.

## G. Foreign Keys

`saved_destinations` user/city; trips user CASCADE on delete account.

## H. Relationships

User 1───N Trips; User M───N Cities saved.

## I. Migrations

`002` user profile columns.

## J. API

`GET/PATCH/DELETE /api/profile`  
`GET` planned/previous can be part of profile payload  
Saved destinations POST/DELETE  
Do not accept `role` from client.

## K. Validation

Same as register fields; language allowlist; email unique.

## L–O. State / Flow / States / Security

Local form; server trips; warn on delete CASCADE; self-only access.

## P. Testing

Planned/previous split; PATCH phone/city; delete removes trips.

## Q. Order

Phase 4–5 with Trip History available.

## R. Dependencies

```text
Depends On: Auth, Trips, optional City save
Used By: AppHeader User Profile
```

## S. Definition of Done

- [ ] Design 7 avatar + editable details
- [ ] Planned Trip + Previous Trip card rows with View from **user’s trips API** (no sample cards)
- [ ] PS language, saved destinations, delete account
- [ ] States + authz tests
