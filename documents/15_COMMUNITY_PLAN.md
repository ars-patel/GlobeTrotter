# 15 — Community Talk Plan

**Phase:** Phase 5  
**Problem statement:** Sharing/community vision (mission); not a numbered PS screen — **required by official mockup Design 10**  
**Official mockup:** [Design 10 Community Talk](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Design 10: **Community Talk** feed of user posts (avatar + text).
- Right sidebar: **“Add your thoughts”** composer + submit.
- Top nav **Community** → `/community`.
- Complementary to public itinerary share ([`12`](./12_PUBLIC_SHARING_PLAN.md)): this is discussion UGC, not a trip page.

## B. User Flow

```text
User clicks Community in AppHeader
 ↓
GET /api/community/posts
 ↓
See feed cards (avatar, author name, body, time)
 ↓
Sidebar: type thoughts → POST /api/community/posts
 ↓
Feed prepends new post
```

## C. Pages / Routes

| Route | Purpose |
|---|---|
| `/community` | Design 10 Community Talk |

## D. Components

### Page Components

- `CommunityPage`

### Reusable Components

- `CommunityFeed`
- `CommunityPostCard` — avatar + body
- `CommunityComposer` — sidebar “Add your thoughts”
- `AppHeader`

## E. shadcn/ui Components

| Component | Where | Why | Customize? |
|---|---|---|---|
| `Avatar` | Post author | Design 10 circles | No |
| `Card` | Post rows | Feed items | Light |
| `Textarea` | Composer | Add thoughts | No |
| `Button` | Submit | Post | No |
| `ScrollArea` | Long feed | Overflow | No |
| `Skeleton` / `Empty` / `Alert` / `Toast` | States | UX | No |
| `Separator` | Layout feed/sidebar | Structure | No |

Responsive: sidebar stacks below feed on mobile.

## F. Database Planning

### Tables Used

```text
Table: community_posts

id          UUID PK DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
body        TEXT NOT NULL
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Index: `created_at DESC`.  
Join `users` for `first_name`, `last_name`, `photo_url`.

## G. Foreign Keys

```text
community_posts.user_id → users.id
  Parent: users (1)
  Child: community_posts (N)
  ON DELETE CASCADE
```

## H. Relationships

```text
User 1───N CommunityPost
```

No trip FK required for MVP mockup (general talk).  
**Optional Recommendation:** `trip_id` nullable to attach discussion to a trip.

## I. Database Migrations

```text
Migration: 002_mockup_alignment.sql
  - CREATE TABLE community_posts …
  - INDEX idx_community_posts_created
```

## J. API / Backend Planning

| Method | Route | Auth | Body | Response | Errors |
|---|---|---|---|---|---|
| `GET` | `/api/community/posts` | Yes | `limit`, `cursor` | `{ posts: [{ id, body, created_at, author }] }` | 401, 500 |
| `POST` | `/api/community/posts` | Yes | `{ body }` | `{ post }` 201 | 400, 401 |
| `DELETE` | `/api/community/posts/[id]` | Yes | — | Owner or ADMIN | 403, 404 |

## K. Validation

| Field | Rules |
|---|---|
| body | Required, trim, 1–2000 chars, reject empty HTML-only |

Backend authoritative; basic profanity filter **Optional Recommendation**.

## L. State Management

| State | Location |
|---|---|
| Feed | Server state |
| Composer text | Local |
| Submitting | Local |

## M. Data Flow

```text
CommunityPage → GET posts → CommunityFeed
Composer → POST → optimistic prepend or refetch
```

## N. Error / Loading / Empty States

| State | UX |
|---|---|
| Loading | Skeleton cards |
| Empty | “No talks yet — share your thoughts” |
| Error | Alert + retry |
| Success | Toast optional; clear composer |

## O. Security

- Auth required for feed + create (mockup sits behind app nav).
- Users delete own posts only (admin override optional).
- Sanitize/escape body on render; store plain text.
- Rate-limit posts **Optional Recommendation**.

## P. Testing Plan

### Unit

Body Zod schema.

### API

Create/list; delete own; cannot delete others’; 401 without auth.

### Integration

Post appears in feed with avatar initials/photo.

### Edge cases

Max length; whitespace-only rejected.

## Q. Implementation Order

**Phase 5** after Auth + AppHeader; independent of Builder but after core trip MVP preferred for demo narrative.

## R. Dependency Mapping

```text
Depends On:
- Authentication
- Database 002 community_posts
- AppHeader nav

Used By:
- Top nav Community
- Hackathon demo social angle

Related:
- Public Sharing (trips) — different feature
```

## S. Definition of Done

- [ ] `/community` matches Design 10 feed + composer sidebar
- [ ] Feed from `GET /api/community/posts` only (no hardcoded posts)
- [ ] AppHeader Community link
- [ ] `community_posts` migration + APIs
- [ ] Avatar + author on cards
- [ ] Validation + authz
- [ ] Loading / empty / error
- [ ] shadcn Avatar/Textarea/Card
- [ ] Tests for create/list/delete-own
- [ ] Mobile stacked layout
