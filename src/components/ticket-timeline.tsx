import React from "react";
import { StateTransition } from "@/lib/types";
import { TicketStatusBadge } from "./ticket-status-badge";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { Clock, User, MessageSquare } from "lucide-react";

interface TicketTimelineProps {
  history: StateTransition[];
}

export function TicketTimeline({ history }: TicketTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-xs font-mono text-muted-foreground py-6 text-center">
        No transition log recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
      {history.map((step, idx) => (
        <div key={idx} className="relative flex items-start space-x-2.5 group">
          {/* Dispatch Pin Dot */}
          <div className="absolute -left-5 mt-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card shadow-2xs">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>

          <div className="flex-1 rounded-md border border-border bg-card p-3 shadow-2xs transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <TicketStatusBadge status={step.status} />
                <span className="text-xs font-semibold text-foreground flex items-center font-sans">
                  <User className="mr-1 h-3 w-3 opacity-60" />
                  {step.changedByName || step.changedBy}
                </span>
              </div>
              <span
                className="text-[11px] font-mono text-muted-foreground flex items-center"
                title={formatDate(step.changedAt)}
              >
                <Clock className="mr-1 h-3 w-3 opacity-60" />
                {formatRelativeDate(step.changedAt)}
              </span>
            </div>

            {step.note && (
              <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded-xs p-2 border border-border/50 flex items-start space-x-1.5 font-sans">
                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <span>{step.note}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
