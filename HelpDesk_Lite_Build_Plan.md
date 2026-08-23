# HelpDesk Lite — Build Plan for AI Coding Agent

**Source of truth:** Day 1 Engineering Action Plan Pack + Day 2 Jira Delivery Workspace ("Mazin HelpDesk Lite").
**Goal of this document:** give an AI coding agent (Cursor/Claude Code/Copilot/etc.) everything it needs to start building HelpDesk Lite correctly, without re-deciding scope that is already closed.

Do not re-litigate scope. The 6 epics below are locked. Anything not listed under "In Scope" is a non-goal for v1, exactly as decided in Stage 0.

---

## 1. Tech Stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Deployed on Vercel, no separate backend server |
| Styling | Tailwind CSS + shadcn/ui | Use shadcn primitives, don't hand-roll basic components |
| Auth | Clerk | Handles sign-up/sign-in/session; roles synced into Firestore |
| Database | Firebase Firestore | Single source of truth for tickets, users, notifications |
| File storage | Firebase Storage | Only if attachments are added (see §6, optional) |
| Hosting | Vercel | Next.js app + API routes (serverless functions) — this is NOT a separate backend, it's part of the Next.js deploy |
| Data access | Firestore client SDK from the browser, guarded by Firestore Security Rules based on custom claims/role field | Avoid building a REST API layer just to proxy Firestore — use rules as the authorization boundary |
| Notifications | In-app only for v1 (Firestore `notifications` collection). Email is an explicit v2/stretch item — do not build it unless asked. |

**Why this stack satisfies "no backend hosting":** Vercel serverless functions (Next.js API routes / Server Actions) are used only for things Clerk↔Firestore sync requires (e.g., a webhook that fires on user creation/role change). Everything else talks to Firestore directly from the client. There is no Express server, no separate host, no long-running process to manage.

---

## 2. Roles & Auth Strategy

Three roles, exactly as scoped: `employee`, `staff` (support/ops), `manager`.

- Clerk manages identity. On first sign-in, default role = `employee`.
- Role is stored as a field on a Firestore `users/{uid}` doc (not just a Clerk metadata field), because Firestore Security Rules need to read it to authorize reads/writes.
- Use a Clerk webhook → Next.js API route (`/api/clerk-webhook`) to create/update the `users/{uid}` doc when a user is created. This is the one legitimate serverless function in the app.
- Role changes (e.g., promoting someone to `staff`) should be an admin-only action for now — hardcode a simple "manager can change roles" screen, or seed roles manually in Firestore console for the MVP. Don't over-build an admin panel beyond what Epic F/H need.
- Firestore Security Rules enforce: employees can read/write only their own tickets (create + read own); staff can read/write all tickets; managers can read all tickets + read the `users` collection for workload views.

---

## 3. Data Model (Firestore)

```
users/{uid}
  - name, email
  - role: "employee" | "staff" | "manager"
  - createdAt

tickets/{ticketId}
  - title, description, category, priority
  - requesterId (uid), requesterName
  - ownerId (uid | null), ownerName
  - status: "New" | "Assigned" | "In Progress" | "Waiting on Requester" | "Resolved" | "Closed"
  - createdAt, updatedAt
  - stateHistory: [{ status, changedBy, changedAt }]   // append-only, drives aging + audit trail

notifications/{notificationId}
  - userId (recipient)
  - ticketId
  - type: "assigned" | "resolved" | "status_changed"
  - read: boolean
  - createdAt
```

This is a direct implementation of Appendix A (candidate ticket states) and the Day 1 assumptions (single owner, no department restriction, no self-service in v1).

---

## 4. Epic → Feature Breakdown

Each epic below matches a Jira epic in the Day 2 workspace. Build in this order — it mirrors the dependency chain from the Day 1 execution plan (data model + states unblock everything else).

### Epic: Workflow States (build first — everything depends on it)
- Ticket status is a fixed enum (Appendix A states). No custom workflow builder.
- Enforce legal transitions in code (not just UI): e.g., `New → Assigned`, `Assigned → In Progress`, `In Progress → Waiting on Requester`, `In Progress → Resolved`, `Waiting on Requester → In Progress`, `Resolved → Closed`, `Resolved → In Progress` (reopen). Reject illegal transitions server-side via a Firestore rule or a transaction function, not just by hiding buttons.
- Every transition appends to `stateHistory` with a timestamp — this is what powers aging/manager visibility later.

### Epic: Request Intake
- Structured intake form: title, description, category, priority, requester (auto-filled from Clerk session).
- Field validation: title + description required, max lengths enforced client- and rule-side.
- On submit: create one `tickets` doc, status = `New`, show a confirmation with the ticket ID.
- No auto-ticket-creation from email/chat (explicit non-goal) — this is a manual form only.

### Epic: Request Intake → Ticket Views & Search (Day 1 Work Area D, folded into this epic in Jira)
- Staff view: filterable list — "assigned to me" / "unassigned" / "by status."
- Employee view: "my tickets" with current status, read-only.
- Basic search/filter by status, owner, category. No advanced saved views for v1.

### Epic: Notifications
- On assignment → notify the requester and the new owner (Firestore `notifications` doc + a bell icon with unread count in the nav).
- On resolution → notify the requester.
- De-dupe: one notification per state-change event, not per re-render.
- Mark-as-read on click. No email/SMS in v1.

### Epic: Manager Visibility
- Dashboard route (`/manager`) visible only to `manager` role.
- Counts by status (open / in progress / overdue).
- Simple workload view: ticket count per staff member.
- Aging: compute "time in current status" from `stateHistory`, flag anything open > a configurable threshold (e.g., 3 days) as overdue. This is a client-side computation off existing data — no separate reporting service needed.

### Epic: Access & Roles
- Route guards: `/manager/*` → manager only; staff queue views → staff + manager; intake + "my tickets" → all authenticated users.
- Enforce the same rules in Firestore Security Rules, not just in the UI — the UI guard is a convenience, the rules are the real boundary.
- One role per user, no multi-role for v1 (matches Day 1 assumption).

### Epic: Discovery & Requirement Decisions
- This epic is the Stage 0 planning work itself (already closed in Jira: OQ1–OQ6 answered, sign-off done). Nothing to build here — it's the reason the epics above have no more open questions blocking them. Do not create app features for this epic.

---

## 5. Suggested Additions (not required, but worth considering — flag these to the human before building, don't silently add scope)

- **Comments/activity feed on a ticket** — lightweight, reuses `stateHistory` pattern, high value for staff collaboration.
- **CSV export for managers** — trivial with data already in Firestore, no backend needed.
- **Dark mode** — shadcn + Tailwind support this almost for free; nice polish for a demo.
- **Optimistic UI updates** on status changes so the app feels instant even on Firestore's write latency.
- **Empty/loading/error states** for every list view — often skipped, cheap to add, big perceived-quality win.

Do **not** add: attachments, email notifications, SLA automation, multi-department routing, or a self-service KB unless the human explicitly asks — these are the exact items frozen as non-goals in Day 1/Day 2.

---

## 6. How the AI Agent Should Work (per the Day 3 assignment's controlled workflow)

For every task (a Jira ticket like MHL-15, MHL-19, etc.), the agent should follow this loop rather than jumping straight to code:

1. **Frame** — restate the ticket's acceptance criteria in its own words before touching code. If the ticket is ambiguous, check this plan and the epic section above before guessing.
2. **Plan** — name the files/components/Firestore rules that will change, and why. Keep the plan scoped to that one ticket.
3. **Review plan** — surface the plan to the human before large or structural changes (new collections, new routes, auth changes). Small, contained changes (a form field, a style tweak) can proceed straight to implementation.
4. **Implement** — write the code per the plan.
5. **Inspect** — re-read the diff. Does it match the plan? Did it touch anything outside the ticket's scope?
6. **Verify** — for logic changes: run/write a test or manually exercise the flow (e.g., actually submit the intake form and confirm one ticket doc is created). For Firestore rules: test both an allowed and a denied case.
7. **Decide** — state clearly whether the ticket's acceptance criteria are met, partially met, or blocked, and why. Don't mark something "done" on the basis that it compiles.

This applies per-ticket, not per-epic — keep each PR/change mapped to one Jira ticket where possible so review stays traceable.

---

## 7. Build Sequence (mirrors Day 1 Stage 1 → Stage 3, Stage 0 already done)

1. **Scaffold**: Next.js + Tailwind + shadcn + Clerk auth wired up, Firebase project connected, `users/{uid}` sync webhook working.
2. **Core flow**: Workflow States model + Request Intake + basic ticket list (staff + employee views). Exit criterion: a ticket can be submitted, appears in a queue, gets assigned, and moves through all states end to end.
3. **Visibility layer**: Notifications + Manager dashboard.
4. **Access & Roles hardening**: route guards + Firestore rules reviewed together, not bolted on at the end.
5. **Polish pass**: empty/loading/error states, optional additions from §5 if the human wants them.

---

## 8. Deployment

- Push to GitHub → import into Vercel → set environment variables (Clerk keys, Firebase config) in Vercel dashboard.
- Firebase: Firestore in production mode with the security rules from §2/§4 deployed via `firebase deploy --only firestore:rules`.
- No servers to provision — Vercel + Firebase is the entire hosting footprint.
