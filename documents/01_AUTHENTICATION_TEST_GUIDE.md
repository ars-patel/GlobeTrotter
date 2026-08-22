# Authentication — Test Guide (Phase 0 / Topic 01)

**Plan:** [`01_AUTHENTICATION_PLAN.md`](./01_AUTHENTICATION_PLAN.md)  
**Hackathon PS:** [`PROBLEM_STATEMENT.md`](./PROBLEM_STATEMENT.md) §1 Login/Signup + Must-haves  
**App:** http://localhost:3000 (run `npm run dev`)

---

## A. Hackathon compliance checklist

### Problem statement §1 — Login / Signup

| Requirement | Status | How we meet it |
|---|---|---|
| Entry point to create/access account | ✅ | `/` → `/login`; `/signup` for new users |
| Authenticate for personal travel plans | ✅ | JWT httpOnly cookie `gt_session`; private routes gated |
| Email & password fields | ✅ | Signup requires email + password; login accepts **username or email** + password (PS email + mockup username) |
| Login button | ✅ | “Login” on `/login` |
| Signup link | ✅ | “Register now” → `/signup` |
| Forgot Password | ✅ | `/forgot-password` → `/reset-password` |
| Basic validation | ✅ | Client Zod + server Zod (authoritative) |

### Hackathon Must-haves (relevant to auth)

| Rule | Status | Notes |
|---|---|---|
| Dynamic data (not static JSON catalogs) | ✅ | Users live in PostgreSQL; no hardcoded user list |
| Input validation | ✅ | Required fields, email format, password min 8 |
| Responsive UI | ✅ | Login card + two-column register (stacks on mobile) |
| Intuitive navigation | ✅ | AppHeader Sign In / Log Out after auth |

### Official mockup (Design 1–2) — beyond PS wording

| Mockup | Status |
|---|---|
| Design 1: Username + Password card | ✅ |
| Design 2: First/Last name, Email, Phone, City, Country, Additional info | ✅ |
| Redirect to Discover after auth | ✅ `/discover` |

**Verdict:** Phase 1 auth is aligned with the hackathon problem statement for screen §1. Discover content (PS §2) is a later topic; the post-login shell is enough for this phase.

---

## B. Preconditions

1. Migrations + seed already applied (`npm run db:apply` done; SQL in `archived/`).
2. `.env` has working `DATABASE_URL` and `JWT_SECRET`.
3. Dev server running:

```bash
npm run dev
```

4. Demo accounts (from seed):

| Role | Email | Username | Password |
|---|---|---|---|
| **ADMIN** | `demo@globetrotter.app` | `demo` | `password123` |
| **USER** | `traveler@globetrotter.app` | `traveler` | `password123` |

Admin unlocks `/admin` and owns different trips/bookings than the traveler account.

5. Browser: use a **private/incognito** window for clean cookie tests (or clear site cookies for `localhost:3000`).

---

## C. Manual UI test script

### 1. Entry & redirects

| # | Steps | Expected |
|---|---|---|
| 1.1 | Open http://localhost:3000 while logged out | Redirect to `/login` |
| 1.2 | Open `/discover` while logged out | Redirect to `/login?next=/discover` |
| 1.3 | Open `/trips` while logged out | Redirect to `/login` |

### 2. Login screen (Design 1 / PS §1)

| # | Steps | Expected |
|---|---|---|
| 2.1 | View `/login` | Logo/brand, **Username**, **Password**, Login, link to register, Forgot password? |
| 2.2 | Submit empty form | Validation error (identifier/password required) |
| 2.3 | Login `demo` / `password123` | Redirect to `/discover`; header shows Log Out; Admin link visible |
| 2.4 | Login `demo@globetrotter.app` / `password123` | Same success (email as identifier) |
| 2.4b | Logout, then login `traveler` / `password123` | USER session; no Admin nav; different My Trips / bookings |
| 2.5 | Login `demo` / `wrong` | Error: invalid credentials (no user dump) |
| 2.6 | While logged in, open `/login` | Redirect to `/discover` |

### 3. Signup screen (Design 2 / PS §1)

| # | Steps | Expected |
|---|---|---|
| 3.1 | Open `/signup` | Two-column fields: First/Last name, Email, Phone, City, Country, Additional info, Username optional, Password + Confirm |
| 3.2 | Submit with short password (`abc`) | Error: min 8 characters |
| 3.3 | Mismatched confirm password | “Passwords do not match” |
| 3.4 | Register new unique email (fill required names + email + password) | 201 path → `/discover`; session cookie set |
| 3.5 | Register same email again | 409 / “account … already exists” |
| 3.6 | Click Login link | Goes to `/login` |

### 4. Forgot / reset password (PS)

| # | Steps | Expected |
|---|---|---|
| 4.1 | `/forgot-password` with unknown email | Generic success message (do **not** say “email not found”) |
| 4.2 | Submit a real account email with SMTP configured | Generic success; **check inbox** for Nodemailer reset email |
| 4.3 | Open link from email → set new password (≥8) | Success → `/login` |
| 4.4 | Login with **new** password | Works |
| 4.5 | Open `/reset-password` with no `?token=` | Error about missing token |
| 4.6 | Reuse the same reset link | Invalid/expired (410) |

*(After testing reset, you can set demo password back via another reset or re-seed user in SQL.)*

### 5. Session / logout / `/api/auth/me`

| # | Steps | Expected |
|---|---|---|
| 5.1 | Logged in → DevTools → Application → Cookies | `gt_session` present, **HttpOnly** |
| 5.2 | Open `/api/auth/me` in browser or Network tab | JSON `{ user: { … } }` **without** `password_hash` |
| 5.3 | Click **Log Out** in header | Cookie cleared; redirect `/login` |
| 5.4 | Call `/api/auth/me` logged out | `401` |

### 6. Responsive smoke

| # | Steps | Expected |
|---|---|---|
| 6.1 | Mobile width (~375px) on `/login` | Single centered card, usable |
| 6.2 | Mobile on `/signup` | Fields stack; still submittable |
| 6.3 | Logged in, mobile header | Nav links available (mobile row under header) |

---

## D. API quick checks (optional)

Use browser Network tab or curl (PowerShell examples).

```powershell
# Health
Invoke-RestMethod http://localhost:3000/api/health

# Signup
Invoke-RestMethod -Method POST http://localhost:3000/api/auth/signup `
  -ContentType "application/json" `
  -Body '{"first_name":"Test","last_name":"User","email":"test.user@example.com","password":"password123"}' `
  -SessionVariable s

# Me (reuse cookie session)
Invoke-RestMethod http://localhost:3000/api/auth/me -WebSession $s

# Login
Invoke-RestMethod -Method POST http://localhost:3000/api/auth/login `
  -ContentType "application/json" `
  -Body '{"identifier":"demo","password":"password123"}' `
  -SessionVariable s2
```

| Endpoint | Expect |
|---|---|
| `POST /api/auth/signup` | `201` + user; Set-Cookie |
| `POST /api/auth/login` | `200` + user; Set-Cookie |
| `GET /api/auth/me` | `200` with cookie; `401` without |
| `POST /api/auth/logout` | `200`; cookie cleared |
| `POST /api/auth/forgot-password` | Always generic `200` message |
| `POST /api/auth/reset-password` | `200` or `410` if bad token |

---

## E. Security checks (must pass for hackathon quality)

| # | Check | Pass? |
|---|---|---|
| E1 | `password_hash` never appears in any JSON response | |
| E2 | Wrong password does not reveal whether username exists | |
| E3 | Forgot-password does not reveal whether email exists | |
| E4 | Private pages require cookie | |
| E5 | Client cannot set `role: ADMIN` on signup (ignored / not accepted) | |

---

## F. Pass / fail for “Phase 01 done”

Mark **PASS** only if all are true:

- [ ] PS §1 components present (login, signup link, forgot password, validation)
- [ ] New user can register and land on `/discover`
- [ ] Existing user can login (username **or** email)
- [ ] Logout ends session
- [ ] Unauthenticated users cannot open `/discover` / `/trips` / `/profile`
- [ ] No `password_hash` leaked
- [ ] Works on desktop and a phone-width viewport

If any fail, fix before starting Create Trip / Discover data topics.

---

## G. Out of scope for this phase (do not fail auth on these)

- Full Discover banner / top destinations / featured trips (PS §2 / Design 3 content) — next topics  
- Trip CRUD, budget, community feed  
- Production email delivery for reset — **Nodemailer + SMTP_*** env vars (configure in `.env`)
