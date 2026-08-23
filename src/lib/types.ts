export type UserRole = "employee" | "staff" | "manager";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type TicketStatus =
  | "New"
  | "Assigned"
  | "In Progress"
  | "Waiting on Requester"
  | "Resolved"
  | "Closed";

export type TicketCategory =
  | "Hardware"
  | "Software"
  | "Access"
  | "Network"
  | "General"
  | "Other";

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface StateTransition {
  status: TicketStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string; // ISO String
  note?: string;
}

export interface TicketComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string; // ISO String
  isInternal?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  ownerId: string | null;
  ownerName: string | null;
  status: TicketStatus;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  stateHistory: StateTransition[];
  comments?: TicketComment[];
}

export type NotificationType = "assigned" | "resolved" | "status_changed";

export interface AppNotification {
  id: string;
  userId: string;
  ticketId: string;
  ticketTitle: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string; // ISO String
}

export interface TicketFilterState {
  search: string;
  status: TicketStatus | "All";
  priority: TicketPriority | "All";
  category: TicketCategory | "All";
  viewTab: "assigned_to_me" | "unassigned" | "my_tickets" | "all";
}
