import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Ticket,
  UserProfile,
  AppNotification,
  UserRole,
  TicketStatus,
  TicketFilterState,
  TicketComment,
} from "./types";
import {
  MOCK_TICKETS,
  MOCK_USERS,
  MOCK_NOTIFICATIONS,
} from "./mock-data";
import { createStateHistoryEntry, isValidTransition } from "./workflow";

const isDemo = () => {
  if (typeof window !== "undefined") {
    const demoSetting = localStorage.getItem("helpdesk_demo_mode");
    if (demoSetting !== null) return demoSetting === "true";
  }
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === "helpdesk-lite-dev"
  );
};

// Local storage keys for demo persistence
const DEMO_TICKETS_KEY = "helpdesk_demo_tickets";
const DEMO_USERS_KEY = "helpdesk_demo_users";
const DEMO_NOTIFS_KEY = "helpdesk_demo_notifications";

function getLocalDemoData<T>(key: string, defaultData: T[]): T[] {
  if (typeof window === "undefined") return defaultData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultData;
  }
}

function setLocalDemoData<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ----------------------------------------------------
// USER SERVICES
// ----------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isDemo()) {
    const users = getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
    return users.find((u) => u.uid === uid) || null;
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn("Firestore getUserProfile fallback to mock:", err);
    const users = getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
    return users.find((u) => u.uid === uid) || null;
  }
}

export async function syncUserProfile(
  user: { uid: string; name: string; email: string; role?: UserRole }
): Promise<UserProfile> {
  const defaultRole: UserRole = user.role || "employee";

  if (isDemo()) {
    const users = getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
    const existingIndex = users.findIndex((u) => u.uid === user.uid);
    let profile: UserProfile;
    if (existingIndex >= 0) {
      profile = {
        ...users[existingIndex],
        name: user.name || users[existingIndex].name,
        email: user.email || users[existingIndex].email,
        role: user.role || users[existingIndex].role,
      };
      users[existingIndex] = profile;
    } else {
      profile = {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: defaultRole,
        createdAt: new Date().toISOString(),
      };
      users.push(profile);
    }
    setLocalDemoData(DEMO_USERS_KEY, users);
    return profile;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      const updated: UserProfile = {
        ...existing,
        name: user.name || existing.name,
        email: user.email || existing.email,
        role: user.role || existing.role,
      };
      await setDoc(userDocRef, updated, { merge: true });
      return updated;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: defaultRole,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn("Firestore syncUserProfile error, fallback:", err);
    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: defaultRole,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  if (isDemo()) {
    const users = getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
    const updated = users.map((u) => (u.uid === uid ? { ...u, role } : u));
    setLocalDemoData(DEMO_USERS_KEY, updated);
    return;
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { role });
  } catch (err) {
    console.warn("Firestore updateUserRole error, updating demo data:", err);
    const users = getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
    const updated = users.map((u) => (u.uid === uid ? { ...u, role } : u));
    setLocalDemoData(DEMO_USERS_KEY, updated);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (isDemo()) {
    return getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
  }

  try {
    const usersCol = collection(db, "users");
    const snap = await getDocs(usersCol);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as UserProfile);
    }
    return MOCK_USERS;
  } catch (err) {
    console.warn("Firestore getAllUsers error, fallback:", err);
    return getLocalDemoData<UserProfile>(DEMO_USERS_KEY, MOCK_USERS);
  }
}

// ----------------------------------------------------
// TICKET SERVICES
// ----------------------------------------------------

export async function createTicket(data: {
  title: string;
  description: string;
  category: Ticket["category"];
  priority: Ticket["priority"];
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
}): Promise<Ticket> {
  const now = new Date().toISOString();
  const ticketId = `MHL-${Math.floor(100 + Math.random() * 900)}`;

  const initialTransition = createStateHistoryEntry(
    "New",
    data.requesterId,
    data.requesterName,
    "Ticket created"
  );

  const newTicket: Ticket = {
    id: ticketId,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    priority: data.priority,
    requesterId: data.requesterId,
    requesterName: data.requesterName,
    requesterEmail: data.requesterEmail,
    ownerId: null,
    ownerName: null,
    status: "New",
    createdAt: now,
    updatedAt: now,
    stateHistory: [initialTransition],
    comments: [],
  };

  if (isDemo()) {
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    tickets.unshift(newTicket);
    setLocalDemoData(DEMO_TICKETS_KEY, tickets);
    return newTicket;
  }

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await setDoc(ticketDocRef, newTicket);
    return newTicket;
  } catch (err) {
    console.warn("Firestore createTicket error, fallback to demo store:", err);
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    tickets.unshift(newTicket);
    setLocalDemoData(DEMO_TICKETS_KEY, tickets);
    return newTicket;
  }
}

export async function getTickets(
  filter?: Partial<TicketFilterState>,
  user?: { uid: string; role: UserRole }
): Promise<Ticket[]> {
  let tickets: Ticket[] = [];

  if (isDemo()) {
    tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
  } else {
    try {
      const ticketsCol = collection(db, "tickets");
      let q = query(ticketsCol, orderBy("createdAt", "desc"));

      if (user?.role === "employee") {
        q = query(ticketsCol, where("requesterId", "==", user.uid), orderBy("createdAt", "desc"));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        tickets = snap.docs.map((d) => d.data() as Ticket);
      } else {
        tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
      }
    } catch (err) {
      console.warn("Firestore getTickets error, fallback to demo store:", err);
      tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    }
  }

  // Role filtering boundary
  if (user?.role === "employee") {
    tickets = tickets.filter((t) => t.requesterId === user.uid);
  }

  // Tab view filtering
  if (filter?.viewTab === "assigned_to_me" && user) {
    tickets = tickets.filter((t) => t.ownerId === user.uid);
  } else if (filter?.viewTab === "unassigned") {
    tickets = tickets.filter((t) => !t.ownerId);
  } else if (filter?.viewTab === "my_tickets" && user) {
    tickets = tickets.filter((t) => t.requesterId === user.uid);
  }

  // Status filtering
  if (filter?.status && filter.status !== "All") {
    tickets = tickets.filter((t) => t.status === filter.status);
  }

  // Priority filtering
  if (filter?.priority && filter.priority !== "All") {
    tickets = tickets.filter((t) => t.priority === filter.priority);
  }

  // Category filtering
  if (filter?.category && filter.category !== "All") {
    tickets = tickets.filter((t) => t.category === filter.category);
  }

  // Search keyword filtering
  if (filter?.search && filter.search.trim() !== "") {
    const s = filter.search.toLowerCase().trim();
    tickets = tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s) ||
        t.requesterName.toLowerCase().includes(s) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(s))
    );
  }

  return tickets;
}

export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  if (isDemo()) {
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    return tickets.find((t) => t.id === ticketId) || null;
  }

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    const snap = await getDoc(ticketDocRef);
    if (snap.exists()) {
      return snap.data() as Ticket;
    }
    return null;
  } catch (err) {
    console.warn("Firestore getTicketById error, fallback to demo store:", err);
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    return tickets.find((t) => t.id === ticketId) || null;
  }
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  user: { uid: string; name: string; role: UserRole },
  note?: string
): Promise<Ticket> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  if (!isValidTransition(ticket.status, newStatus)) {
    throw new Error(`Invalid transition from '${ticket.status}' to '${newStatus}'`);
  }

  const now = new Date().toISOString();
  const transition = createStateHistoryEntry(newStatus, user.uid, user.name, note);

  const updatedTicket: Ticket = {
    ...ticket,
    status: newStatus,
    updatedAt: now,
    stateHistory: [...(ticket.stateHistory || []), transition],
  };

  if (isDemo()) {
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index >= 0) tickets[index] = updatedTicket;
    setLocalDemoData(DEMO_TICKETS_KEY, tickets);
  } else {
    try {
      const ticketDocRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketDocRef, {
        status: newStatus,
        updatedAt: now,
        stateHistory: arrayUnion(transition),
      });
    } catch (err) {
      console.warn("Firestore updateTicketStatus error, fallback:", err);
      const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
      const index = tickets.findIndex((t) => t.id === ticketId);
      if (index >= 0) tickets[index] = updatedTicket;
      setLocalDemoData(DEMO_TICKETS_KEY, tickets);
    }
  }

  // Trigger Notifications:
  // 1. If resolved -> notify requester
  if (newStatus === "Resolved" && ticket.requesterId !== user.uid) {
    await createNotification({
      userId: ticket.requesterId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      type: "resolved",
      message: `Your ticket ${ticket.id} has been marked as Resolved by ${user.name}.`,
    });
  } else if (ticket.requesterId !== user.uid) {
    // 2. If status changed -> notify requester
    await createNotification({
      userId: ticket.requesterId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      type: "status_changed",
      message: `Ticket ${ticket.id} status was changed to "${newStatus}" by ${user.name}.`,
    });
  }

  return updatedTicket;
}

export async function assignTicket(
  ticketId: string,
  ownerId: string | null,
  ownerName: string | null,
  user: { uid: string; name: string; role: UserRole }
): Promise<Ticket> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  const now = new Date().toISOString();
  let nextStatus = ticket.status;

  // If newly created and unassigned, auto-advance to "Assigned" on first assignment
  if (ticket.status === "New" && ownerId) {
    nextStatus = "Assigned";
  }

  const assignNote = ownerName
    ? `Assigned to ${ownerName} by ${user.name}`
    : `Unassigned by ${user.name}`;

  const transition = createStateHistoryEntry(nextStatus, user.uid, user.name, assignNote);

  const updatedTicket: Ticket = {
    ...ticket,
    ownerId,
    ownerName,
    status: nextStatus,
    updatedAt: now,
    stateHistory: [...(ticket.stateHistory || []), transition],
  };

  if (isDemo()) {
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index >= 0) tickets[index] = updatedTicket;
    setLocalDemoData(DEMO_TICKETS_KEY, tickets);
  } else {
    try {
      const ticketDocRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketDocRef, {
        ownerId,
        ownerName,
        status: nextStatus,
        updatedAt: now,
        stateHistory: arrayUnion(transition),
      });
    } catch (err) {
      console.warn("Firestore assignTicket error, fallback:", err);
      const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
      const index = tickets.findIndex((t) => t.id === ticketId);
      if (index >= 0) tickets[index] = updatedTicket;
      setLocalDemoData(DEMO_TICKETS_KEY, tickets);
    }
  }

  // Trigger Notifications:
  // 1. Notify assigned owner (if not the one who assigned)
  if (ownerId && ownerId !== user.uid) {
    await createNotification({
      userId: ownerId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      type: "assigned",
      message: `Ticket ${ticket.id} (${ticket.title}) was assigned to you by ${user.name}.`,
    });
  }

  // 2. Notify requester of assignment
  if (ticket.requesterId !== user.uid) {
    await createNotification({
      userId: ticket.requesterId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      type: "assigned",
      message: ownerName
        ? `Your ticket ${ticket.id} has been assigned to ${ownerName}.`
        : `Your ticket ${ticket.id} has been unassigned.`,
    });
  }

  return updatedTicket;
}

export async function addTicketComment(
  ticketId: string,
  author: { uid: string; name: string; role: UserRole },
  text: string,
  isInternal: boolean = false
): Promise<TicketComment> {
  const comment: TicketComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    authorId: author.uid,
    authorName: author.name,
    authorRole: author.role,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    isInternal,
  };

  if (isDemo()) {
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index >= 0) {
      tickets[index].comments = [...(tickets[index].comments || []), comment];
      tickets[index].updatedAt = new Date().toISOString();
      setLocalDemoData(DEMO_TICKETS_KEY, tickets);
    }
    return comment;
  }

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketDocRef, {
      comments: arrayUnion(comment),
      updatedAt: new Date().toISOString(),
    });
    return comment;
  } catch (err) {
    console.warn("Firestore addTicketComment error, fallback:", err);
    const tickets = getLocalDemoData<Ticket>(DEMO_TICKETS_KEY, MOCK_TICKETS);
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index >= 0) {
      tickets[index].comments = [...(tickets[index].comments || []), comment];
      tickets[index].updatedAt = new Date().toISOString();
      setLocalDemoData(DEMO_TICKETS_KEY, tickets);
    }
    return comment;
  }
}

// ----------------------------------------------------
// NOTIFICATION SERVICES
// ----------------------------------------------------

export async function createNotification(
  data: Omit<AppNotification, "id" | "createdAt" | "read">
): Promise<AppNotification> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const notification: AppNotification = {
    ...data,
    id: notifId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (isDemo()) {
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    notifs.unshift(notification);
    setLocalDemoData(DEMO_NOTIFS_KEY, notifs);
    return notification;
  }

  try {
    const notifDocRef = doc(db, "notifications", notifId);
    await setDoc(notifDocRef, notification);
    return notification;
  } catch (err) {
    console.warn("Firestore createNotification error, fallback:", err);
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    notifs.unshift(notification);
    setLocalDemoData(DEMO_NOTIFS_KEY, notifs);
    return notification;
  }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  if (isDemo()) {
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    return notifs.filter((n) => n.userId === userId);
  }

  try {
    const notifsCol = collection(db, "notifications");
    const q = query(notifsCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as AppNotification);
    }
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    return notifs.filter((n) => n.userId === userId);
  } catch (err) {
    console.warn("Firestore getNotifications error, fallback:", err);
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    return notifs.filter((n) => n.userId === userId);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  if (isDemo()) {
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    setLocalDemoData(DEMO_NOTIFS_KEY, updated);
    return;
  }

  try {
    const notifDocRef = doc(db, "notifications", notificationId);
    await updateDoc(notifDocRef, { read: true });
  } catch (err) {
    console.warn("Firestore markNotificationAsRead error, fallback:", err);
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    setLocalDemoData(DEMO_NOTIFS_KEY, updated);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (isDemo()) {
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    setLocalDemoData(DEMO_NOTIFS_KEY, updated);
    return;
  }

  try {
    const userNotifs = await getNotifications(userId);
    for (const n of userNotifs) {
      if (!n.read) {
        const notifDocRef = doc(db, "notifications", n.id);
        await updateDoc(notifDocRef, { read: true });
      }
    }
  } catch (err) {
    console.warn("Firestore markAllNotificationsAsRead error, fallback:", err);
    const notifs = getLocalDemoData<AppNotification>(DEMO_NOTIFS_KEY, MOCK_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    setLocalDemoData(DEMO_NOTIFS_KEY, updated);
  }
}

export function resetDemoDataToDefaults(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_TICKETS_KEY, JSON.stringify(MOCK_TICKETS));
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(MOCK_USERS));
  localStorage.setItem(DEMO_NOTIFS_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
}
