import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "sage"
    | "oxblood";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            // Dispatch Ochre Primary
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:translate-y-px font-semibold":
              variant === "default",
            
            // Oxblood Destructive
            "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xs active:translate-y-px font-semibold":
              variant === "destructive" || variant === "oxblood",
            
            // Technical Outline
            "border border-border bg-card hover:bg-muted text-foreground hover:border-border/80 active:translate-y-px":
              variant === "outline",
            
            // Muted secondary
            "bg-muted text-foreground hover:bg-muted/80 active:translate-y-px":
              variant === "secondary",
            
            // Ghost
            "hover:bg-muted hover:text-foreground":
              variant === "ghost",
            
            // Link
            "text-primary underline-offset-4 hover:underline":
              variant === "link",
            
            // Sage Green
            "bg-[#5E8C6A] text-white hover:bg-[#4E7758] shadow-xs active:translate-y-px":
              variant === "sage",
            
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-6 text-base font-semibold": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
