# HelpDesk Lite

A streamlined, modern internal IT &amp; Service Desk web application built with **Next.js 14+ (App Router)**, **Tailwind CSS**, **shadcn/ui**, **Clerk Authentication**, and **Firebase Firestore** as the single source of truth.

---

## 🎯 Architecture & Features (6 Epics Locked)

1. **Workflow States (Appendix A State Machine)**:
   - Fixed states: `New`, `Assigned`, `In Progress`, `Waiting on Requester`, `Resolved`, `Closed`.
   - Strictly enforced transitions: `New → Assigned`, `Assigned → In Progress`, `In Progress → Waiting on Requester | Resolved`, `Waiting on Requester → In Progress`, `Resolved → Closed | In Progress (Reopen)`.
   - Append-only `stateHistory` on each ticket recording actor, timestamp, and audit notes.

2. **Request Intake**:
   - Structured intake form with title, description, category, priority, and requester auto-filled from session.
   - Client and server-side length validation with character limits (Title: max 120, Description: max 2000).
   - Generates initial `New` ticket with confirmation and unique ID (`MHL-XXX`).

3. **Ticket Views & Search**:
   - Role-customized views: Employee ("My Tickets"), Staff (Queue, "Assigned to Me", "Unassigned", "All").
   - Filter by status, priority, category, and real-time search across ticket IDs, titles, descriptions, and users.

4. **In-App Notifications**:
   - Real-time in-app notification triggers on assignment, resolution, and status changes.
   - Bell icon with unread count badge and popover dropdown with mark-all-as-read and direct ticket links.

5. **Manager Visibility**:
   - Dedicated `/manager` dashboard route (guarded for `manager` role).
   - Summary metric cards across all queues.
   - Aging & SLA monitor computing duration in current status from `stateHistory` and flagging open tickets `> 3 days` as Overdue.
   - Staff workload distribution matrix (active, assigned, waiting, resolved, overdue per engineer).
   - User role administration panel (promote/demote `employee`, `staff`, `manager`).
   - One-click CSV export of all tickets and metrics.

6. **Access & Security Rules**:
   - Route guards and role protection components (`<RoleGuard>`).
   - `firestore.rules` defining data access boundaries for `employee`, `staff`, and `manager`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 24)
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and provide your Clerk and Firebase project credentials:
```bash
cp .env.example .env.local
```

For production, these keys are mandatory:
- `CLERK_WEBHOOK_SECRET` (used by [src/app/api/clerk-webhook/route.ts](D:/work/fun/helpdesk.worktrees/footer-global-visibility/src/app/api/clerk-webhook/route.ts))
- `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON` (used by [src/lib/firebase-admin.ts](D:/work/fun/helpdesk.worktrees/footer-global-visibility/src/lib/firebase-admin.ts))

Never commit the Firebase Admin service account JSON. The filename
`helpdesk-lite-e7ceb-firebase-adminsdk-fbsvc-4d2764960e.json` is already ignored in [.gitignore](D:/work/fun/helpdesk.worktrees/footer-global-visibility/.gitignore).

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Tests
```bash
npm test
```

### 6. Production Build
```bash
npm run build
```

---

## 🔒 Firestore Security Rules
Rules are defined in [firestore.rules](D:/work/fun/helpdesk.worktrees/footer-global-visibility/firestore.rules) and can be deployed using:
```bash
npx firebase deploy --only firestore:rules
```

## ✅ Production Readiness Checklist
- Deploy updated rules from [firestore.rules](D:/work/fun/helpdesk.worktrees/footer-global-visibility/firestore.rules).
- Configure Clerk webhook endpoint: `POST /api/clerk-webhook`.
- Verify webhook signature enforcement by sending a signed Clerk test event.
- Verify Firebase bridge token endpoint: `POST /api/firebase-token` returns a token only for authenticated Clerk sessions.
- Confirm role boundaries:
  - employee: own tickets + public comments + resolved close/reopen only
  - staff/manager: queue transitions, assignment, and notification creation
  - manager: role updates in `users` collection
