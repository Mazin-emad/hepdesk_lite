"use client";

import React from "react";
import { TicketFilterState, TicketStatus, TicketPriority, TicketCategory, UserRole } from "@/lib/types";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";
import { Search, RotateCcw } from "lucide-react";

interface TicketFilterBarProps {
  filter: TicketFilterState;
  onChange: (updated: Partial<TicketFilterState>) => void;
  userRole: UserRole;
  ticketCounts?: {
    all: number;
    assignedToMe: number;
    unassigned: number;
    myTickets: number;
  };
}

export function TicketFilterBar({
  filter,
  onChange,
  userRole,
  ticketCounts,
}: TicketFilterBarProps) {
  const isEmployee = userRole === "employee";

  const handleReset = () => {
    onChange({
      search: "",
      status: "All",
      priority: "All",
      category: "All",
    });
  };

  const hasActiveFilters =
    filter.search !== "" ||
    filter.status !== "All" ||
    filter.priority !== "All" ||
    filter.category !== "All";

  return (
    <div className="space-y-3.5">
      {/* View Tabs */}
      {!isEmployee && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
          <Button
            variant={filter.viewTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange({ viewTab: "all" })}
            className="text-xs h-8 rounded-xs font-medium"
          >
            <span>All Work Orders</span>
            {ticketCounts && (
              <span className="ml-1.5 font-mono text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-xs bg-black/10 dark:bg-white/10">
                {ticketCounts.all}
              </span>
            )}
          </Button>

          <Button
            variant={filter.viewTab === "assigned_to_me" ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange({ viewTab: "assigned_to_me" })}
            className="text-xs h-8 rounded-xs font-medium"
          >
            <span>Assigned to Me</span>
            {ticketCounts && (
              <span className="ml-1.5 font-mono text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-xs bg-black/10 dark:bg-white/10">
                {ticketCounts.assignedToMe}
              </span>
            )}
          </Button>

          <Button
            variant={filter.viewTab === "unassigned" ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange({ viewTab: "unassigned" })}
            className="text-xs h-8 rounded-xs font-medium"
          >
            <span>Unassigned Stubs</span>
            {ticketCounts && (
              <span className="ml-1.5 font-mono text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-xs bg-black/10 dark:bg-white/10">
                {ticketCounts.unassigned}
              </span>
            )}
          </Button>

          <Button
            variant={filter.viewTab === "my_tickets" ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange({ viewTab: "my_tickets" })}
            className="text-xs h-8 rounded-xs font-medium"
          >
            <span>My Submitted</span>
            {ticketCounts && (
              <span className="ml-1.5 font-mono text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-xs bg-black/10 dark:bg-white/10">
                {ticketCounts.myTickets}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter by ID (e.g. MHL-101), title, requester..."
            value={filter.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="pl-8 text-xs font-mono placeholder:font-sans h-8 rounded-xs bg-background"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={filter.status}
            onChange={(e) => onChange({ status: e.target.value as TicketStatus | "All" })}
            className="text-xs h-8 rounded-xs bg-background"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting on Requester">Waiting on Requester</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <Select
            value={filter.priority}
            onChange={(e) => onChange({ priority: e.target.value as TicketPriority | "All" })}
            className="text-xs h-8 rounded-xs bg-background"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Select
            value={filter.category}
            onChange={(e) => onChange({ category: e.target.value as TicketCategory | "All" })}
            className="text-xs h-8 rounded-xs bg-background"
          >
            <option value="All">All Categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Access">Access</option>
            <option value="Network">Network</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Reset all filters"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground rounded-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
