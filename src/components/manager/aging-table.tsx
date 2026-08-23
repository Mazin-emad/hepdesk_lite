import React from "react";
import Link from "next/link";
import { Ticket } from "@/lib/types";
import { TicketStatusBadge } from "../ticket-status-badge";
import { TicketPriorityBadge } from "../ticket-priority-badge";
import { getStatusDuration, isTicketOverdue } from "@/lib/workflow";
import { AlertTriangle, Clock, ExternalLink } from "lucide-react";

interface AgingTableProps {
  tickets: Ticket[];
}

export function AgingTable({ tickets }: AgingTableProps) {
  // Only show active (non-closed, non-resolved) tickets for aging monitoring
  const activeTickets = tickets.filter(
    (t) => t.status !== "Closed" && t.status !== "Resolved"
  );

  // Sort by aging duration descending (most overdue first)
  const sortedTickets = [...activeTickets].sort((a, b) => {
    const durA = getStatusDuration(a).hours;
    const durB = getStatusDuration(b).hours;
    return durB - durA;
  });

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-foreground flex items-center">
            <Clock className="mr-1.5 h-4 w-4 text-primary" />
            Work-Order Aging &amp; SLA Monitor
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            Active tickets tracked by duration in current state. Flagged as overdue when &gt; 3 days.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground font-mono uppercase text-[11px]">
            <tr>
              <th className="p-3">Ticket ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Assignee</th>
              <th className="p-3">Time in State</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-sans">
            {sortedTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs font-mono text-muted-foreground">
                  All queues clear. No work orders currently aging on the board.
                </td>
              </tr>
            ) : (
              sortedTickets.map((ticket) => {
                const { formatted: durationStr } = getStatusDuration(ticket);
                const overdue = isTicketOverdue(ticket);

                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      overdue ? "bg-secondary/5" : ""
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-foreground tracking-wider whitespace-nowrap">
                      {ticket.id}
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-xs truncate">
                      {ticket.title}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {ticket.ownerName || (
                        <span className="text-secondary font-mono italic text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono tabular-nums">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-foreground">
                          {durationStr}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center rounded-xs border border-secondary/40 bg-secondary/10 px-1.5 py-0.2 text-[10px] font-mono font-bold text-secondary tracking-tight uppercase">
                            <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="inline-flex items-center text-xs font-mono font-semibold text-primary hover:underline"
                      >
                        Inspect
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
