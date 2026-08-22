# 12 — Public Sharing Plan

**Phase:** Phase 5  
**Problem statement:** Required Screens §11 — Shared / Public Itinerary  
**Official mockup:** Community is Design 10 ([`15`](./15_COMMUNITY_PLAN.md)); sharing remains PS must-have alongside community  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Public read-only itinerary URL, Copy Trip, social sharing (PS).
- Distinct from Community Talk feed (mockup Design 10): sharing exposes a **trip**; community is **posts/discussion**.

## B. User Flow

```text
Owner enables share on trip → share_slug
 ↓
Visitor opens /share/[slug]
 ↓
Read-only itinerary summary (Design 9-like, no edits)
 ↓
Auth user Copy Trip → clone
```

## C. Routes

`/share/[slug]`; owner Share dialog on itinerary/builder.

## D. Components

`PublicItineraryPage`, `ShareTripDialog`, `CopyTripButton`, `ShareLinkField`.

## E. shadcn/ui

`Dialog`, `Switch`, `Input`, `Button`, `Alert`, `Badge`, `Skeleton`, `Toast`.

## F–I. DB

`trips.is_public`, `share_slug` (001). Clone writes new trip graph.

## J. API

`POST /api/trips/[id]/share`, `GET /api/share/[slug]`, `POST /api/share/[slug]/copy`.

## K–O. Validation / State / Security

404 if not public; sanitize PII; owner-only toggle.

## P. Testing

Private 404; copy isolation; unpublish.

## Q. Order

After itinerary readable.

## R. Dependencies

```text
Depends On: Auth, Itinerary data
Used By: Discover featured (optional public trips); demos
```

## S. Definition of Done

- [ ] Public URL + copy trip + share controls
- [ ] Read-only page
- [ ] Does not replace Community Talk
- [ ] Tests for access control
