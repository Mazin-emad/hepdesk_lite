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
  AppNotification,
  Ticket,
  TicketComment,
  TicketFilterState,
  TicketStatus,
  UserProfile,
  UserRole,
} from "./types";
import { createStateHistoryEntry, isValidTransition } from "./workflow";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    console.warn("Firestore getUserProfile failed:", error);
    return null;
  }
}

export async function syncUserProfile(
  user: { uid: string; name: string; email: string; role?: UserRole }
): Promise<UserProfile> {
  const role = user.role || "employee";
  const profile: UserProfile = {
    uid: user.uid,
    name: user.name || "User",
    email: user.email || "",
    role,
    createdAt: new Date().toISOString(),
  };

  try {
    const userDocRef = doc(db, "users", user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      const merged: UserProfile = {
        ...existing,
        uid: user.uid,
        name: user.name || existing.name,
        email: user.email || existing.email,
        role: user.role || existing.role,
      };
      await setDoc(userDocRef, merged, { merge: true });
      return merged;
    }

    await setDoc(userDocRef, profile);
    return profile;
  } catch (error) {
    console.warn("Firestore syncUserProfile failed:", error);
    return profile;
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { role });
  } catch (error) {
    console.warn("Firestore updateUserRole failed:", error);
    throw error;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, "users");
    const snap = await getDocs(usersCol);
    return snap.docs.map((docSnap) => docSnap.data() as UserProfile);
  } catch (error) {
    console.warn("Firestore getAllUsers failed:", error);
    return [];
  }
}

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

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await setDoc(ticketDocRef, newTicket);
    return newTicket;
  } catch (error) {
    console.warn("Firestore createTicket failed:", error);
    throw error;
  }
}

export async function getTickets(
  filter?: Partial<TicketFilterState>,
  user?: { uid: string; role: UserRole }
): Promise<Ticket[]> {
  try {
    const ticketsCol = collection(db, "tickets");
    let q = query(ticketsCol, orderBy("createdAt", "desc"));

    if (user?.role === "employee") {
      q = query(ticketsCol, where("requesterId", "==", user.uid), orderBy("createdAt", "desc"));
    }

    const snap = await getDocs(q);
    let tickets = snap.docs.map((docSnap) => ({ ...(docSnap.data() as Ticket), id: docSnap.id }));

    if (user?.role === "employee") {
      tickets = tickets.filter((ticket) => ticket.requesterId === user.uid);
    }

    if (filter?.viewTab === "assigned_to_me" && user) {
      tickets = tickets.filter((ticket) => ticket.ownerId === user.uid);
    } else if (filter?.viewTab === "unassigned") {
      tickets = tickets.filter((ticket) => !ticket.ownerId);
    } else if (filter?.viewTab === "my_tickets" && user) {
      tickets = tickets.filter((ticket) => ticket.requesterId === user.uid);
    }

    if (filter?.status && filter.status !== "All") {
      tickets = tickets.filter((ticket) => ticket.status === filter.status);
    }

    if (filter?.priority && filter.priority !== "All") {
      tickets = tickets.filter((ticket) => ticket.priority === filter.priority);
    }

    if (filter?.category && filter.category !== "All") {
      tickets = tickets.filter((ticket) => ticket.category === filter.category);
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.toLowerCase().trim();
      tickets = tickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.id.toLowerCase().includes(search) ||
          ticket.requesterName.toLowerCase().includes(search) ||
          (ticket.ownerName && ticket.ownerName.toLowerCase().includes(search))
      );
    }

    return tickets;
  } catch (error) {
    console.warn("Firestore getTickets failed:", error);
    return [];
  }
}

export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    const snap = await getDoc(ticketDocRef);
    return snap.exists() ? ({ ...(snap.data() as Ticket), id: snap.id } as Ticket) : null;
  } catch (error) {
    console.warn("Firestore getTicketById failed:", error);
    return null;
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

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketDocRef, {
      status: newStatus,
      updatedAt: now,
      stateHistory: arrayUnion(transition),
    });
  } catch (error) {
    console.warn("Firestore updateTicketStatus failed:", error);
    throw error;
  }

  if (newStatus === "Resolved" && ticket.requesterId !== user.uid) {
    await createNotification({
      userId: ticket.requesterId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      type: "resolved",
      message: `Your ticket ${ticket.id} has been marked as Resolved by ${user.name}.`,
    });
  } else if (ticket.requesterId !== user.uid) {
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

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketDocRef, {
      ownerId,
      ownerName,
      status: nextStatus,
      updatedAt: now,
      stateHistory: arrayUnion(transition),
    });
  } catch (error) {
    console.warn("Firestore assignTicket failed:", error);
    throw error;
  }

  if (ownerId && ownerId !== user.uid) {
    await createNotification({
      userId: ownerId,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      type: "assigned",
      message: `Ticket ${ticket.id} (${ticket.title}) was assigned to you by ${user.name}.`,
    });
  }

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

  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketDocRef, {
      comments: arrayUnion(comment),
      updatedAt: new Date().toISOString(),
    });
    return comment;
  } catch (error) {
    console.warn("Firestore addTicketComment failed:", error);
    throw error;
  }
}

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

  try {
    const notifDocRef = doc(db, "notifications", notifId);
    await setDoc(notifDocRef, notification);
    return notification;
  } catch (error) {
    console.warn("Firestore createNotification failed:", error);
    throw error;
  }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const notificationsCol = collection(db, "notifications");
    const q = query(notificationsCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => docSnap.data() as AppNotification);
  } catch (error) {
    console.warn("Firestore getNotifications failed:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notifDocRef = doc(db, "notifications", notificationId);
    await updateDoc(notifDocRef, { read: true });
  } catch (error) {
    console.warn("Firestore markNotificationAsRead failed:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const userNotifications = await getNotifications(userId);
    for (const notification of userNotifications) {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }
    }
  } catch (error) {
    console.warn("Firestore markAllNotificationsAsRead failed:", error);
    throw error;
  }
}

export function resetDemoDataToDefaults(): void {
  return;
}
