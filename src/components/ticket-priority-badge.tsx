import React from "react";
import { TicketPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
  showIcon?: boolean;
}

export function TicketPriorityBadge({
  priority,
  className,
  showIcon = true,
}: TicketPriorityBadgeProps) {
  const getPriorityStyles = () => {
    switch (priority) {
      case "Urgent":
        // Oxblood - Priority flag
        return "border-secondary/40 bg-secondary/10 text-secondary font-bold";
      case "High":
        // Dispatch Ochre
        return "border-primary/40 bg-primary/10 text-primary font-semibold";
      case "Medium":
        // Neutral Slate
        return "border-border bg-muted/60 text-foreground font-medium";
      case "Low":
        // Subdued border
        return "border-border/60 bg-card text-muted-foreground";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (priority) {
      case "Urgent":
        return <AlertCircle className="mr-1 h-3 w-3 text-secondary" />;
      case "High":
        return <AlertTriangle className="mr-1 h-3 w-3 text-primary" />;
      case "Medium":
        return <ArrowUp className="mr-1 h-3 w-3 text-muted-foreground" />;
      case "Low":
        return <ArrowDown className="mr-1 h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-2 py-0.5 text-[11px] font-mono tracking-tight uppercase select-none",
        getPriorityStyles(),
        className
      )}
    >
      {showIcon && getIcon()}
      {priority}
    </span>
  );
}
