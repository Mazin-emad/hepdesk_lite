"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Ticket, TicketFilterState } from "@/lib/types";
import { getTickets } from "@/lib/firestore-service";
import { TicketCard } from "@/components/ticket-card";
import { TicketFilterBar } from "@/components/ticket-filter-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, RefreshCw } from "lucide-react";

export default function TicketsQueuePage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTicketsRaw, setAllTicketsRaw] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const isEmployee = currentUser.role === "employee";

  const [filter, setFilter] = useState<TicketFilterState>({
    search: "",
    status: "All",
    priority: "All",
    category: "All",
    viewTab: isEmployee ? "my_tickets" : "all",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const raw = await getTickets(
        undefined,
        currentUser ? { uid: currentUser.uid, role: currentUser.role } : undefined
      );
      setAllTicketsRaw(raw);

      const data = await getTickets(
        filter,
        currentUser ? { uid: currentUser.uid, role: currentUser.role } : undefined
      );
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    currentUser?.uid,
    currentUser?.role,
    filter.viewTab,
    filter.status,
    filter.priority,
    filter.category,
    filter.search,
  ]);

  const handleFilterChange = (updated: Partial<TicketFilterState>) => {
    setFilter((prev) => ({ ...prev, ...updated }));
  };

  const ticketCounts = {
    all: allTicketsRaw.length,
    assignedToMe: allTicketsRaw.filter((t) => t.ownerId === currentUser.uid).length,
    unassigned: allTicketsRaw.filter(
      (t) => !t.ownerId && t.status !== "Closed" && t.status !== "Resolved"
    ).length,
    myTickets: allTicketsRaw.filter((t) => t.requesterId === currentUser.uid).length,
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            {isEmployee ? "My Work-Order Stubs" : "Work-Order Queue &amp; Registry"}
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            {isEmployee
              ? "All service requests and claim stubs issued under your employee clearance"
              : "Search, filter, assign, and transition active work orders across departments"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            title="Refresh queue"
            className="h-8 w-8 p-0 rounded-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Link href="/tickets/new">
            <Button size="sm" className="flex items-center space-x-1.5 h-8 text-xs font-semibold shadow-2xs">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Ticket</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
        <TicketFilterBar
          filter={filter}
          onChange={handleFilterChange}
          userRole={currentUser.role}
          ticketCounts={ticketCounts}
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center bg-card/40">
            <p className="text-xs font-mono text-muted-foreground">
              No claim stubs match the active query or filter criteria. Dispatch board is clear.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
