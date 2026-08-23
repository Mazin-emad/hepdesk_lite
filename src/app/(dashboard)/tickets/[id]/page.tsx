"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Ticket, TicketStatus, UserProfile } from "@/lib/types";
import {
  getTicketById,
  updateTicketStatus,
  assignTicket,
  getAllUsers,
} from "@/lib/firestore-service";
import {
  getAvailableTransitions,
  getStatusDuration,
  isTicketOverdue,
} from "@/lib/workflow";
import { TicketStatusBadge } from "@/components/ticket-status-badge";
import { TicketPriorityBadge } from "@/components/ticket-priority-badge";
import { TicketTimeline } from "@/components/ticket-timeline";
import { TicketComments } from "@/components/ticket-comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  User,
  UserCheck,
  Tag,
  AlertTriangle,
  Send,
  History,
  MessageSquare,
} from "lucide-react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { currentUser } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [transitionNote, setTransitionNote] = useState("");
  const [selectedNextStatus, setSelectedNextStatus] = useState<TicketStatus | null>(null);

  const loadTicketData = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const [ticketData, allUsers] = await Promise.all([
        getTicketById(ticketId),
        getAllUsers(),
      ]);
      setTicket(ticketData);
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to load ticket details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <Skeleton className="h-5 w-32 rounded-xs" />
        <Skeleton className="h-44 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-80 rounded-md lg:col-span-2" />
          <Skeleton className="h-80 rounded-md" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto text-center py-14">
        <p className="text-xs font-mono text-muted-foreground">
          Claim stub <span className="font-bold text-foreground">{ticketId}</span> not found on the dispatch board.
        </p>
        <div className="mt-5">
          <Link href="/tickets">
            <Button variant="outline" size="sm" className="h-8 text-xs font-mono">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Return to Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isRequester = ticket.requesterId === currentUser.uid;
  const isStaffOrManager =
    currentUser.role === "staff" || currentUser.role === "manager";
  const overdue = isTicketOverdue(ticket);
  const { formatted: durationStr } = getStatusDuration(ticket);

  const availableTransitions = getAvailableTransitions(
    ticket.status,
    currentUser.role,
    isRequester
  );

  const staffList = users.filter(
    (u) => u.role === "staff" || u.role === "manager"
  );

  const handleTransitionSubmit = async (statusToSet: TicketStatus) => {
    setActionLoading(true);
    try {
      const updated = await updateTicketStatus(
        ticket.id,
        statusToSet,
        {
          uid: currentUser.uid,
          name: currentUser.name,
          role: currentUser.role,
        },
        transitionNote.trim() || undefined
      );
      setTicket(updated);
      setSelectedNextStatus(null);
      setTransitionNote("");
    } catch (err: unknown) {
      console.error("Transition failed:", err);
      alert(err instanceof Error ? err.message : "Failed to update ticket status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignOwner = async (newOwnerId: string) => {
    setActionLoading(true);
    try {
      const assignedUser = staffList.find((u) => u.uid === newOwnerId);
      const updated = await assignTicket(
        ticket.id,
        newOwnerId || null,
        assignedUser ? assignedUser.name : null,
        {
          uid: currentUser.uid,
          name: currentUser.name,
          role: currentUser.role,
        }
      );
      setTicket(updated);
    } catch (err: unknown) {
      console.error("Assignment failed:", err);
      alert(err instanceof Error ? err.message : "Failed to assign ticket");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/tickets"
          className="inline-flex items-center text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Work-Order Queue
        </Link>
        <span className="text-[11px] font-mono text-muted-foreground">
          Opened {formatRelativeDate(ticket.createdAt)} &bull; Updated {formatRelativeDate(ticket.updatedAt)}
        </span>
      </div>

      {/* Main Ticket Banner Card */}
      <div className="rounded-md border border-border bg-card shadow-2xs">
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Stamped Ticket ID */}
                <span className="dispatch-stamp text-xs font-bold tabular-nums shadow-2xs">
                  {ticket.id}
                </span>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
                <Badge variant="outline" className="text-[10px] font-mono uppercase">
                  <Tag className="mr-1 h-2.5 w-2.5" />
                  {ticket.category}
                </Badge>
                {overdue && (
                  <span className="inline-flex items-center rounded-xs border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[11px] font-mono font-bold text-secondary uppercase">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Overdue ({durationStr} in &quot;{ticket.status}&quot;)
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-display">
                {ticket.title}
              </h1>
            </div>

            {/* Time in Current State */}
            <div className="rounded-xs border border-border bg-muted/30 p-3 text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Time in State:
              </span>
              <span className="text-sm font-mono font-bold text-foreground flex items-center justify-end mt-0.5 tabular-nums">
                <Clock className="mr-1 h-3.5 w-3.5 text-primary" />
                {durationStr}
              </span>
            </div>
          </div>

          {/* Requester & Assignee Footer Strip */}
          <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center font-mono text-[11px] uppercase">
                <User className="mr-1 h-3 w-3" /> Requester
              </span>
              <p className="font-semibold text-foreground">{ticket.requesterName}</p>
              <p className="text-muted-foreground font-mono text-[11px]">{ticket.requesterEmail}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center font-mono text-[11px] uppercase">
                <UserCheck className="mr-1 h-3 w-3" /> Assigned Officer
              </span>
              {isStaffOrManager ? (
                <Select
                  value={ticket.ownerId || ""}
                  disabled={actionLoading}
                  onChange={(e) => handleAssignOwner(e.target.value)}
                  className="h-7 text-xs font-mono bg-background rounded-xs mt-0.5"
                >
                  <option value="">— Unassigned —</option>
                  {staffList.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="font-semibold text-foreground">
                  {ticket.ownerName || (
                    <span className="italic text-secondary font-mono text-[11px]">Unassigned</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center font-mono text-[11px] uppercase">
                <Clock className="mr-1 h-3 w-3" /> Filed Date
              </span>
              <p className="font-mono text-[11px] text-foreground">{formatDate(ticket.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* State Transitions Action Bar */}
      {availableTransitions.length > 0 && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                Dispatch Action
              </h3>
              <p className="text-xs text-muted-foreground font-sans">
                Available state transitions from &quot;{ticket.status}&quot;
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {availableTransitions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  variant={action.variant || "default"}
                  disabled={actionLoading}
                  onClick={() => {
                    if (selectedNextStatus === action.status) {
                      handleTransitionSubmit(action.status);
                    } else {
                      setSelectedNextStatus(action.status);
                    }
                  }}
                  className="text-xs h-8 font-semibold shadow-2xs"
                >
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Optional note for transition */}
          {selectedNextStatus && (
            <div className="mt-3 pt-3 border-t border-primary/20 space-y-2 animate-in fade-in-50">
              <label className="text-xs font-mono text-foreground">
                Log note for transition to &quot;{selectedNextStatus}&quot; (optional):
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="e.g., Diagnostics complete, awaiting parts delivery..."
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  className="text-xs h-8 bg-background rounded-xs"
                />
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleTransitionSubmit(selectedNextStatus)}
                  className="h-8 text-xs font-semibold shrink-0 shadow-2xs"
                >
                  <Send className="mr-1 h-3 w-3" />
                  Stamp &amp; Commit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedNextStatus(null);
                    setTransitionNote("");
                  }}
                  className="h-8 text-xs shrink-0 font-mono"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Grid: Description + Comments vs. Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Description & Comments */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="shadow-2xs">
            <CardHeader className="p-4 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-display font-bold text-foreground">
                Work-Order Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-foreground flex items-center">
                  <MessageSquare className="mr-1.5 h-4 w-4 text-primary" />
                  Activity &amp; Field Notes
                </CardTitle>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {(ticket.comments || []).length} entries
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <TicketComments
                ticketId={ticket.id}
                comments={ticket.comments || []}
                currentUser={currentUser}
                onCommentAdded={(newComment) => {
                  setTicket((prev) =>
                    prev
                      ? {
                          ...prev,
                          comments: [...(prev.comments || []), newComment],
                        }
                      : null
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: State History Audit */}
        <div className="space-y-5">
          <Card className="shadow-2xs">
            <CardHeader className="p-4 border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-display font-bold text-foreground flex items-center">
                <History className="mr-1.5 h-4 w-4 text-primary" />
                Dispatch Transition Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TicketTimeline history={ticket.stateHistory || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
