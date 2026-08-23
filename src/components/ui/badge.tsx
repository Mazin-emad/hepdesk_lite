import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ochre"
    | "oxblood"
    | "sage"
    | "gold"
    | "plum"
    | "slate";
  rounded?: "sm" | "md" | "full";
}

function Badge({
  className,
  variant = "default",
  rounded = "sm",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-ring select-none",
        {
          "rounded-xs": rounded === "sm",
          "rounded-md": rounded === "md",
          "rounded-full": rounded === "full",
        },
        {
          // Default: Dispatch Ochre
          "border-primary/20 bg-primary/10 text-primary": variant === "default" || variant === "ochre",
          
          // Oxblood: Priority / Stamp / Destructive
          "border-secondary/30 bg-secondary/10 text-secondary": variant === "secondary" || variant === "oxblood" || variant === "destructive",
          
          // Outline: Technical border
          "border-border bg-card/60 text-foreground": variant === "outline",
          
          // Sage Green: Resolved
          "border-[#5E8C6A]/30 bg-[#E4EDE6] text-[#3D6448] dark:bg-[#1D2D21] dark:text-[#96C4A2] dark:border-[#5E8C6A]/40": variant === "sage",
          
          // Gold / Amber: In Progress
          "border-[#C1791E]/30 bg-[#FCF0C8] text-[#946800] dark:bg-[#3D2E0B] dark:text-[#F5BF38] dark:border-[#C1791E]/40": variant === "gold",
          
          // Muted Plum: Waiting on Requester
          "border-[#7A5C74]/30 bg-[#EFE6EC] text-[#6E4967] dark:bg-[#352131] dark:text-[#D1AECB] dark:border-[#7A5C74]/40": variant === "plum",
          
          // Slate: Neutral New or Closed
          "border-border bg-muted/60 text-muted-foreground": variant === "slate",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
