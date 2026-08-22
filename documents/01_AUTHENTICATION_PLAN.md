# 01 — Authentication Plan

**Phase:** Phase 0 (with Database)  
**Problem statement:** Required Screens §1 — Login / Signup  
**Official mockup:** [Design 1 Login](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1), [Design 2 Registration](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Authenticate travelers (mockup entry screens).
- Design 1: centered login card with logo, **Username**, **Password**, Login.
- Design 2: registration with **First Name, Last Name, Email, Phone, City, Country, Additional Information**, Register now.
- Also satisfy PS: email/password validation + Forgot Password.
- After success → **Discover** landing (`/` or `/discover`), not a stub link grid.

## B. User Flow

```text
User opens /
 ↓
Unauthenticated → /login (Design 1 card)
 ↓
Login with Username + Password
  OR open /signup (Design 2 two-column register form)
 ↓
Frontend validates
 ↓
POST /api/auth/login or /api/auth/signup
 ↓
bcrypt + JWT cookie
 ↓
Redirect to /discover (Design 3)

Forgot password (PS): /forgot-password → /reset-password
```

## C. Pages / Routes

| Route | Mockup | Purpose |
|---|---|---|
| `/login` | Design 1 | Username + password card |
| `/signup` | Design 2 | Full registration form |
| `/forgot-password` | PS | Request reset |
| `/reset-password` | PS | Confirm new password |

## D. Components

### Page Components

- `LoginPage` — centered modal-like card (Design 1)
- `SignupPage` — wider two-column register card (Design 2)
- `ForgotPasswordPage`, `ResetPasswordPage`

### Reusable Components

- `LoginForm` — username + password
- `RegisterForm` — mockup fields + password (+ confirm)
- `AuthBrandHeader` — circular logo placeholder + “GlobeTrotter”
- `PasswordField`
- `AppHeader` — after login (Sign Out); on public pages show Sign In

## E. shadcn/ui Components

| Component | Where | Why | Customize? |
|---|---|---|---|
| `Card` | Login/Register shells | Centered mockup cards | Light branding |
| `Input` | All fields | Text entry | No |
| `Textarea` | Additional Information | Design 2 | No |
| `Label` | Fields | A11y | No |
| `Button` | Login / Register now | Primary CTA | No |
| `Alert` | Errors | Inline | No |
| `Toast` | Success | Feedback | No |
| `Separator` | Footer links | Structure | No |

## F. Database Planning

### Tables Used

`users` — extend via `002_mockup_alignment.sql`

```text
Table: users

id              UUID PK
email           VARCHAR(255) NOT NULL UNIQUE
username        VARCHAR(60) UNIQUE NULLABLE
  -- login field for Design 1; may equal local-part of email if unused
password_hash   VARCHAR(255) NOT NULL
first_name      VARCHAR(80) NOT NULL
last_name       VARCHAR(80) NOT NULL
name            VARCHAR(160) NOT NULL
  -- keep for display convenience = first + last (or generated)
phone           VARCHAR(30) NULLABLE
home_city       VARCHAR(120) NULLABLE
home_country    VARCHAR(120) NULLABLE
additional_info TEXT NULLABLE
photo_url       TEXT NULLABLE
language        VARCHAR(10) NOT NULL DEFAULT 'en'
role            user_role NOT NULL DEFAULT 'USER'
created_at      TIMESTAMPTZ NOT NULL
updated_at      TIMESTAMPTZ NOT NULL
```

| Column | Purpose |
|---|---|
| `username` | Design 1 login identifier |
| `first_name` / `last_name` | Design 2 |
| `phone`, `home_city`, `home_country`, `additional_info` | Design 2 |
| `email` | PS + Design 2; unique account key |
| `password_hash` | Auth secret |

**Migration note:** Existing `001` has `name` only — `002` adds mockup columns; backfill `first_name`/`last_name` from `name` if needed.

## G. Foreign Keys

Optional `password_reset_tokens.user_id → users.id ON DELETE CASCADE`.

## H. Relationships

```text
User 1───N Trips | Community posts | Saved destinations
```

## I. Database Migrations

| Migration | Notes |
|---|---|
| `001_initial_schema.sql` | Base `users` |
| `002_mockup_alignment.sql` | Username + register profile columns |
| Optional `003_password_reset_tokens.sql` | Forgot password persistence |

## J. API / Backend Planning

| Method | Route | Auth | Body | Notes |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | No | `{ first_name, last_name, email, phone?, home_city?, home_country?, additional_info?, username?, password }` | Create user |
| `POST` | `/api/auth/login` | No | `{ username OR email, password }` | Accept either identifier |
| `POST` | `/api/auth/logout` | Yes | — | Clear cookie |
| `GET` | `/api/auth/me` | Yes | — | Profile fields sans hash |
| `POST` | `/api/auth/forgot-password` | No | `{ email }` | PS |
| `POST` | `/api/auth/reset-password` | No | `{ token, password }` | PS |

Never return `password_hash`.

## K. Validation

**Login:** username/email required; password required.  
**Register:**

| Field | Rules |
|---|---|
| first_name, last_name | Required, 1–80 |
| email | Required, valid, unique |
| phone | Optional, max 30, basic pattern |
| home_city, home_country | Optional, max 120 |
| additional_info | Optional, max 2000 |
| username | Optional/unique if provided; else derive from email local-part if free |
| password | Required, min 8 (PS) |

Backend Zod authoritative.

## L. State Management

Local form state; session via cookie + `/api/auth/me`. No global store beyond thin AuthProvider.

## M. Data Flow

```text
LoginForm/RegisterForm → API → JWT cookie → /discover
```

## N. Error / Loading / Empty States

| State | UX |
|---|---|
| Loading | Disable button + Spinner |
| Error | Alert on card |
| Success | Toast + redirect Discover |

## O. Security

bcrypt, httpOnly JWT cookie, generic login errors, no role from client, normalize email lowercase.

## P. Testing Plan

### Unit

Zod schemas for Design 2 fields; login identifier resolution (username vs email).

### API

Signup with full mockup payload; duplicate email/username; login by username; `/me` shape.

### Integration

Register → land on Discover with AppHeader showing Log Out.

### Edge cases

Missing last name, long additional_info, username collision.

## Q. Implementation Order

**Phase 0** with DB `002`. Unlocks all private mockup screens.

## R. Dependency Mapping

```text
Depends On:
- Database (users + 002 columns)

Used By:
- Discover, Trips, Schedule, Community, Profile, Share copy
```

## S. Definition of Done

- [ ] Design 1 login card (username + password)
- [ ] Design 2 register fields persisted
- [ ] Password + forgot-password (PS)
- [ ] Redirect to Discover
- [ ] AppHeader Sign In / Log Out
- [ ] Loading / error / success
- [ ] Authz cookie works on private routes
- [ ] Tests for signup/login identifier rules
