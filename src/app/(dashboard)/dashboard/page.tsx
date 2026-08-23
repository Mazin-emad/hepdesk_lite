"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Ticket } from "@/lib/types";
import { getTickets } from "@/lib/firestore-service";
import { TicketCard } from "@/components/ticket-card";
import { MetricsCards } from "@/components/manager/metrics-cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getTickets(
          undefined,
          currentUser
            ? { uid: currentUser.uid, role: currentUser.role }
            : undefined
        );
        setTickets(data);
      } catch (err) {
        console.error("Failed to load dashboard tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser?.uid, currentUser?.role]);

  const isEmployee = currentUser.role === "employee";
  const isStaff = currentUser.role === "staff";
  const isManager = currentUser.role === "manager";

  // Employee-specific tickets
  const mySubmittedTickets = tickets.filter(
    (t) => t.requesterId === currentUser.uid
  );
  const myActiveTickets = mySubmittedTickets.filter(
    (t) => t.status !== "Resolved" && t.status !== "Closed"
  );
  const myResolvedTickets = mySubmittedTickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed"
  );

  // Staff-specific tickets
  const assignedToMe = tickets.filter((t) => t.ownerId === currentUser.uid);
  const unassigned = tickets.filter(
    (t) => !t.ownerId && t.status !== "Closed" && t.status !== "Resolved"
  );

  return (
    <div className="space-y-6">
      {/* Dispatch Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-border bg-card p-5 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Station Terminal
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="font-mono text-xs uppercase font-bold text-primary">
              {currentUser.role} Clearance
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display mt-0.5">
            Dispatch Counter &mdash; {currentUser.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link href="/tickets/new">
            <Button size="sm" className="flex items-center space-x-1.5 shadow-2xs font-semibold">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Submit Work Order</span>
            </Button>
          </Link>

          {isManager && (
            <Link href="/manager">
              <Button size="sm" variant="outline" className="flex items-center space-x-1.5 font-semibold">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Manager Ledger</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
        </div>
      ) : isManager ? (
        <MetricsCards tickets={tickets} />
      ) : isStaff ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>Assigned to Me</span>
              <Inbox className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-foreground">
              {assignedToMe.length}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>Unassigned Stubs</span>
              <AlertCircle className="h-3.5 w-3.5 text-secondary" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-secondary">
              {unassigned.length}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>In Progress</span>
              <Clock className="h-3.5 w-3.5 text-[#946800] dark:text-[#F5BF38]" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-[#946800] dark:text-[#F5BF38]">
              {assignedToMe.filter((t) => t.status === "In Progress").length}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>Resolved by Me</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3D6448] dark:text-[#96C4A2]" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-[#3D6448] dark:text-[#96C4A2]">
              {assignedToMe.filter((t) => t.status === "Resolved" || t.status === "Closed").length}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>My Total Work Orders</span>
              <Layers className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-foreground">
              {mySubmittedTickets.length}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>Active in Progress</span>
              <Clock className="h-3.5 w-3.5 text-[#946800] dark:text-[#F5BF38]" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-[#946800] dark:text-[#F5BF38]">
              {myActiveTickets.length}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
              <span>Resolved Stubs</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3D6448] dark:text-[#96C4A2]" />
            </div>
            <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-[#3D6448] dark:text-[#96C4A2]">
              {myResolvedTickets.length}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Lists Section */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground font-display">
              {isEmployee
                ? "My Active Work Orders"
                : isStaff
                ? "Assigned Work-Order Queue"
                : "Active Dispatch Stubs"}
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              {isEmployee
                ? "Track claim stubs logged under your employee ID"
                : "Review and process active work orders requiring immediate assignment or status transition"}
            </p>
          </div>

          <Link
            href="/tickets"
            className="text-xs font-mono font-semibold text-primary hover:underline flex items-center"
          >
            <span>Inspect Full Queue</span>
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center bg-card/40">
            <p className="text-xs font-mono text-muted-foreground">
              {isEmployee
                ? "No work orders on your ticket stub list. Submit a new request at the dispatch counter."
                : "No tickets waiting on you. The active work-order queue is clear."}
            </p>
            {isEmployee && (
              <div className="mt-3">
                <Link href="/tickets/new">
                  <Button size="sm" className="h-8 text-xs font-semibold">
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                    Submit Work Order
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {tickets.slice(0, 5).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
