# 14 — Admin / Analytics Plan *(Optional)*

**Phase:** Phase 6 (Optional)  
**Problem statement:** Required Screens §13 — Admin / Analytics **(Optional)**  
**Official mockup:** Design 12 charts are **personal trip stats** → implement in [`10_BUDGET_PLAN.md`](./10_BUDGET_PLAN.md). This doc is **platform admin only**.  
**Master plan:** [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

---

## A. Purpose

- Optional admin monitoring: users, trips created, top cities/activities, engagement.
- Do not confuse with Design 12 traveler stats.

## B. User Flow

Admin (`role=ADMIN`) → `/admin` → charts/tables → optional user tools.

## C. Routes

`/admin`, optional `/admin/users`.

## D–E. Components / shadcn

`AdminAnalyticsPage`, `Chart`, `Table`, `Card`, `Tabs`, `Badge`, `Skeleton`, `Alert`.

## F–J. DB / API

Aggregations over existing tables; `GET /api/admin/stats` ADMIN-only.

## K–S. Validation / Security / Tests / DoD

403 for non-admin; no password hashes; skippable without blocking MVP.
