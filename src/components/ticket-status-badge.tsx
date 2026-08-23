import React from "react";
import { TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  // Status pills are the ONLY component with rounded-full per design rules
  const getStatusStyles = () => {
    switch (status) {
      case "New":
        // Neutral gray
        return "bg-[#E2E4E6] text-[#474B4E] border-[#D3D6DA] dark:bg-[#2B2E31] dark:text-[#C4C8CC] dark:border-[#3B4044]";
      case "Assigned":
        // Dispatch Ochre
        return "bg-[#F5E8D3] text-[#8A520E] border-[#E5CBA2] dark:bg-[#382814] dark:text-[#E3A23C] dark:border-[#5C401D]";
      case "In Progress":
        // Gold / Amber
        return "bg-[#FCF0C8] text-[#946800] border-[#EDDA91] dark:bg-[#3D2E0B] dark:text-[#F5BF38] dark:border-[#634B12]";
      case "Waiting on Requester":
        // Muted Plum (#7A5C74)
        return "bg-[#EFE6EC] text-[#6E4967] border-[#D6C2D1] dark:bg-[#352131] dark:text-[#D1AECB] dark:border-[#52364D]";
      case "Resolved":
        // Sage Green (#5E8C6A)
        return "bg-[#E4EDE6] text-[#3D6448] border-[#BED4C3] dark:bg-[#1D2D21] dark:text-[#96C4A2] dark:border-[#334F3A]";
      case "Closed":
        // Slate Gray
        return "bg-[#E1E2DD] text-[#5C5E60] border-[#CFCFCA] dark:bg-[#2B2824] dark:text-[#9E9A93] dark:border-[#3E3A35]";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wide uppercase tabular-nums select-none",
        getStatusStyles(),
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
}
