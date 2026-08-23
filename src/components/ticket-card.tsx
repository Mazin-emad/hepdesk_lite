import React from "react";
import Link from "next/link";
import { Ticket } from "@/lib/types";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketPriorityBadge } from "./ticket-priority-badge";
import { Badge } from "./ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { isTicketOverdue, getStatusDuration } from "@/lib/workflow";
import {
  Clock,
  User,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  Tag,
} from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const overdue = isTicketOverdue(ticket);
  const { formatted: durationFormatted } = getStatusDuration(ticket);

  return (
    <Link href={`/tickets/${ticket.id}`} className="block group select-none">
      <div className="relative rounded-md border border-border bg-card shadow-2xs hover:border-primary/60 transition-all duration-150 overflow-hidden flex flex-col md:flex-row">
        
        {/* =========================================
            CLAIM STUB (Left ~20% of card)
           ========================================= */}
        <div className="relative md:w-44 shrink-0 bg-muted/35 p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-border">
          
          {/* Top and Bottom Circular Cutout Notches along the perforation line */}
          <div className="hidden md:block absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-background border border-border z-10" />
          <div className="hidden md:block absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-background border border-border z-10" />
          
          {/* Top: Rotated Physical Stamp Ticket ID */}
          <div className="flex items-center justify-between md:flex-col md:items-start gap-2">
            <div className="dispatch-stamp text-xs font-mono font-bold tracking-wider tabular-nums shadow-2xs">
              {ticket.id}
            </div>
            
            <Badge variant="outline" className="text-[10px] font-mono tracking-tight text-muted-foreground uppercase">
              <Tag className="mr-1 h-2.5 w-2.5 opacity-70" />
              {ticket.category}
            </Badge>
          </div>

          {/* Bottom of Stub: Timestamp & Aging */}
          <div className="mt-3 md:mt-4 pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
            <div className="flex items-center space-x-1" title={ticket.createdAt}>
              <Clock className="h-3 w-3 opacity-60" />
              <span>{formatRelativeDate(ticket.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* =========================================
            TICKET BODY (Right main section)
           ========================================= */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between space-y-3">
          
          {/* Top Row: Status pill & Priority badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
              
              {overdue && (
                <span className="inline-flex items-center rounded-xs border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[11px] font-mono font-bold text-secondary tracking-tight uppercase">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Overdue ({durationFormatted})
                </span>
              )}
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden md:block" />
          </div>

          {/* Ticket Title & Description */}
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {ticket.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
              {ticket.description}
            </p>
          </div>

          {/* Bottom Dispatch Footer: Requester & Assignee */}
          <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground font-sans">
            <div className="flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 opacity-60" />
              <span>Requester:</span>
              <span className="font-medium text-foreground">{ticket.requesterName}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <UserCheck className="h-3.5 w-3.5 opacity-60" />
              <span>Assignee:</span>
              <span
                className={`font-medium ${
                  ticket.ownerName
                    ? "text-foreground"
                    : "text-secondary font-mono italic text-[11px]"
                }`}
              >
                {ticket.ownerName || "Unassigned"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
