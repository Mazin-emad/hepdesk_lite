// HelpDesk Lite State Machine Automated Test Suite

const ALLOWED_TRANSITIONS = {
  New: ["Assigned"],
  Assigned: ["In Progress"],
  "In Progress": ["Waiting on Requester", "Resolved"],
  "Waiting on Requester": ["In Progress"],
  Resolved: ["Closed", "In Progress"],
  Closed: [],
};

function isValidTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function getAvailableTransitions(currentStatus, userRole, isRequester) {
  const actions = [];
  if (currentStatus === "Closed") return actions;

  if (userRole === "employee") {
    if (isRequester && currentStatus === "Resolved") {
      actions.push({ status: "Closed", label: "Confirm & Close Ticket" });
      actions.push({ status: "In Progress", label: "Reopen Ticket" });
    }
    return actions;
  }

  switch (currentStatus) {
    case "New":
      actions.push({ status: "Assigned", label: "Assign Ticket" });
      break;
    case "Assigned":
      actions.push({ status: "In Progress", label: "Start Working (In Progress)" });
      break;
    case "In Progress":
      actions.push({ status: "Waiting on Requester", label: "Wait on Requester" });
      actions.push({ status: "Resolved", label: "Mark as Resolved" });
      break;
    case "Waiting on Requester":
      actions.push({ status: "In Progress", label: "Resume (In Progress)" });
      break;
    case "Resolved":
      actions.push({ status: "Closed", label: "Close Ticket" });
      actions.push({ status: "In Progress", label: "Reopen Ticket" });
      break;
  }
  return actions;
}

function isTicketOverdue(ticket, thresholdDays = 3) {
  if (ticket.status === "Resolved" || ticket.status === "Closed") return false;
  const history = ticket.stateHistory || [];
  const lastTransition = history.length > 0 ? history[history.length - 1] : null;
  const startTime = lastTransition
    ? new Date(lastTransition.changedAt).getTime()
    : new Date(ticket.createdAt).getTime();
  const diffMs = Math.max(0, Date.now() - startTime);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days >= thresholdDays;
}

console.log("==================================================");
console.log("  HelpDesk Lite: Workflow State Machine Test Suite ");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log("\n1. Testing Valid State Transitions:");
assert(isValidTransition("New", "Assigned"), "New -> Assigned is ALLOWED");
assert(isValidTransition("Assigned", "In Progress"), "Assigned -> In Progress is ALLOWED");
assert(isValidTransition("In Progress", "Waiting on Requester"), "In Progress -> Waiting on Requester is ALLOWED");
assert(isValidTransition("In Progress", "Resolved"), "In Progress -> Resolved is ALLOWED");
assert(isValidTransition("Waiting on Requester", "In Progress"), "Waiting on Requester -> In Progress is ALLOWED");
assert(isValidTransition("Resolved", "Closed"), "Resolved -> Closed is ALLOWED");
assert(isValidTransition("Resolved", "In Progress"), "Resolved -> In Progress (Reopen) is ALLOWED");

console.log("\n2. Testing Illegal State Transitions (must be rejected):");
assert(!isValidTransition("New", "Resolved"), "New -> Resolved is REJECTED");
assert(!isValidTransition("New", "Closed"), "New -> Closed is REJECTED");
assert(!isValidTransition("Assigned", "Closed"), "Assigned -> Closed is REJECTED");
assert(!isValidTransition("Closed", "In Progress"), "Closed -> In Progress is REJECTED (Closed is terminal)");
assert(!isValidTransition("Waiting on Requester", "Resolved"), "Waiting on Requester -> Resolved is REJECTED");

console.log("\n3. Testing Role-Based Action Permissions:");
assert(getAvailableTransitions("New", "employee", true).length === 0, "Employee cannot transition New ticket directly");
const empResolved = getAvailableTransitions("Resolved", "employee", true);
assert(empResolved.some(a => a.status === "Closed"), "Employee can Close a resolved ticket");
assert(empResolved.some(a => a.status === "In Progress"), "Employee can Reopen a resolved ticket");

const staffNew = getAvailableTransitions("New", "staff", false);
assert(staffNew.some(a => a.status === "Assigned"), "Staff can transition New -> Assigned");
const staffProg = getAvailableTransitions("In Progress", "staff", false);
assert(staffProg.some(a => a.status === "Resolved"), "Staff can transition In Progress -> Resolved");
assert(staffProg.some(a => a.status === "Waiting on Requester"), "Staff can transition In Progress -> Waiting on Requester");

console.log("\n4. Testing Aging & Overdue SLA Calculation (> 3 days):");
const recentTicket = {
  id: "MHL-TEST-1",
  status: "In Progress",
  createdAt: new Date().toISOString(),
  stateHistory: [{ status: "In Progress", changedAt: new Date().toISOString() }],
};
assert(!isTicketOverdue(recentTicket), "Recent ticket (<3 days) is NOT overdue");

const overdueTicket = {
  id: "MHL-TEST-2",
  status: "In Progress",
  createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  stateHistory: [{ status: "In Progress", changedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() }],
};
assert(isTicketOverdue(overdueTicket), "Ticket open for 4 days is FLAGGED as overdue");

const resolvedOldTicket = {
  id: "MHL-TEST-3",
  status: "Resolved",
  createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  stateHistory: [{ status: "Resolved", changedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() }],
};
assert(!isTicketOverdue(resolvedOldTicket), "Resolved ticket is NEVER flagged as overdue");

console.log("\n--------------------------------------------------");
console.log(`Results: ${passed} passed, ${failed} failed.`);
console.log("--------------------------------------------------");

if (failed > 0) process.exit(1);
