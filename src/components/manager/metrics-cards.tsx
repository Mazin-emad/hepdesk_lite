import React from "react";
import { Ticket } from "@/lib/types";
import { isTicketOverdue } from "@/lib/workflow";
import { Card, CardContent } from "../ui/card";
import {
  Inbox,
  PlayCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

interface MetricsCardsProps {
  tickets: Ticket[];
}

export function MetricsCards({ tickets }: MetricsCardsProps) {
  const total = tickets.length;
  const newOrAssigned = tickets.filter(
    (t) => t.status === "New" || t.status === "Assigned"
  ).length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const waiting = tickets.filter(
    (t) => t.status === "Waiting on Requester"
  ).length;
  const resolvedOrClosed = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed"
  ).length;
  const overdue = tickets.filter((t) => isTicketOverdue(t)).length;

  const metrics = [
    {
      title: "Total Work Orders",
      value: total,
      icon: Layers,
      color: "text-foreground",
      border: "border-border",
      bg: "bg-card",
    },
    {
      title: "Queued / Assigned",
      value: newOrAssigned,
      icon: Inbox,
      color: "text-primary",
      border: "border-primary/30",
      bg: "bg-primary/5",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: PlayCircle,
      color: "text-[#946800] dark:text-[#F5BF38]",
      border: "border-[#C1791E]/30",
      bg: "bg-[#FCF0C8]/40 dark:bg-[#3D2E0B]/30",
    },
    {
      title: "Waiting on Requester",
      value: waiting,
      icon: Clock,
      color: "text-[#6E4967] dark:text-[#D1AECB]",
      border: "border-[#7A5C74]/30",
      bg: "bg-[#EFE6EC]/40 dark:bg-[#352131]/30",
    },
    {
      title: "Resolved & Closed",
      value: resolvedOrClosed,
      icon: CheckCircle2,
      color: "text-[#3D6448] dark:text-[#96C4A2]",
      border: "border-[#5E8C6A]/30",
      bg: "bg-[#E4EDE6]/40 dark:bg-[#1D2D21]/30",
    },
    {
      title: "Overdue (>3 days)",
      value: overdue,
      icon: AlertTriangle,
      color: "text-secondary",
      border: "border-secondary/40",
      bg: "bg-secondary/10",
      highlight: overdue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`rounded-md border p-3.5 flex flex-col justify-between shadow-2xs transition-colors ${m.border} ${m.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-tight text-muted-foreground line-clamp-1">
                {m.title}
              </span>
              <Icon className={`h-3.5 w-3.5 opacity-70 ${m.color}`} />
            </div>
            
            <div className="mt-2 flex items-baseline">
              <span
                className={`font-mono text-2xl font-bold tabular-nums tracking-tight ${
                  m.highlight ? "text-secondary" : m.color
                }`}
              >
                {m.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
