import { TicketStatus, UserRole, StateTransition, Ticket } from "./types";

/**
 * Valid workflow state transitions for HelpDesk Lite.
 * Source of truth: HelpDesk_Lite_Build_Plan.md (Epic: Workflow States)
 */
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  New: ["Assigned"],
  Assigned: ["In Progress"],
  "In Progress": ["Waiting on Requester", "Resolved"],
  "Waiting on Requester": ["In Progress"],
  Resolved: ["Closed", "In Progress"], // Reopen or Close
  Closed: [], // Terminal state
};

/**
 * Check if a state transition is valid according to the state machine
 */
export function isValidTransition(
  fromStatus: TicketStatus,
  toStatus: TicketStatus
): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Returns available next actions for a given status and user role
 */
export function getAvailableTransitions(
  currentStatus: TicketStatus,
  userRole: UserRole,
  isRequester: boolean
): { status: TicketStatus; label: string; variant?: "default" | "secondary" | "destructive" | "outline" }[] {
  const actions: { status: TicketStatus; label: string; variant?: "default" | "secondary" | "destructive" | "outline" }[] = [];

  if (currentStatus === "Closed") {
    return actions; // No further transitions for closed tickets
  }

  // Employees can only confirm resolution (Close) or Reopen resolved tickets
  if (userRole === "employee") {
    if (isRequester && currentStatus === "Resolved") {
      actions.push({ status: "Closed", label: "Confirm & Close Ticket", variant: "default" });
      actions.push({ status: "In Progress", label: "Reopen Ticket", variant: "destructive" });
    }
    return actions;
  }

  // Staff and Managers can execute standard workflow transitions
  switch (currentStatus) {
    case "New":
      actions.push({ status: "Assigned", label: "Assign Ticket", variant: "default" });
      break;
    case "Assigned":
      actions.push({ status: "In Progress", label: "Start Working (In Progress)", variant: "default" });
      break;
    case "In Progress":
      actions.push({ status: "Waiting on Requester", label: "Wait on Requester", variant: "outline" });
      actions.push({ status: "Resolved", label: "Mark as Resolved", variant: "default" });
      break;
    case "Waiting on Requester":
      actions.push({ status: "In Progress", label: "Resume (In Progress)", variant: "default" });
      break;
    case "Resolved":
      actions.push({ status: "Closed", label: "Close Ticket", variant: "secondary" });
      actions.push({ status: "In Progress", label: "Reopen Ticket", variant: "destructive" });
      break;
  }

  return actions;
}

/**
 * Creates an append-only StateTransition object
 */
export function createStateHistoryEntry(
  status: TicketStatus,
  changedBy: string,
  changedByName: string,
  note?: string
): StateTransition {
  return {
    status,
    changedBy,
    changedByName,
    changedAt: new Date().toISOString(),
    note,
  };
}

/**
 * Calculates time spent in current status (in hours and days)
 */
export function getStatusDuration(ticket: Ticket): {
  hours: number;
  days: number;
  formatted: string;
} {
  const history = ticket.stateHistory || [];
  const lastTransition = history.length > 0 ? history[history.length - 1] : null;
  const startTime = lastTransition ? new Date(lastTransition.changedAt).getTime() : new Date(ticket.createdAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - startTime);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  let formatted = `${hours}h`;
  if (days >= 1) {
    const remainingHours = hours % 24;
    formatted = remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  return { hours, days, formatted };
}

/**
 * Checks if a ticket is overdue (> 3 days in current non-resolved/non-closed status)
 */
export const OVERDUE_THRESHOLD_DAYS = 3;

export function isTicketOverdue(ticket: Ticket, thresholdDays: number = OVERDUE_THRESHOLD_DAYS): boolean {
  if (ticket.status === "Resolved" || ticket.status === "Closed") {
    return false;
  }
  const { days } = getStatusDuration(ticket);
  return days >= thresholdDays;
}
