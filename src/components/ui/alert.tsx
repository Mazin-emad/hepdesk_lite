import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "warning" | "success";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-md border p-3.5 [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-3.5 [&>svg+div]:translate-y-[-2px] [&:has(svg)]:pl-10 text-xs",
      {
        "bg-card text-foreground border-border": variant === "default",
        
        // Oxblood destructive
        "border-secondary/40 text-secondary bg-secondary/10 [&>svg]:text-secondary":
          variant === "destructive",
        
        // Dispatch Ochre warning
        "border-primary/40 text-[#8A520E] dark:text-[#E3A23C] bg-primary/10 [&>svg]:text-primary":
          variant === "warning",
        
        // Sage green success
        "border-[#5E8C6A]/40 text-[#3D6448] dark:text-[#96C4A2] bg-[#E4EDE6] dark:bg-[#1D2D21] [&>svg]:text-[#5E8C6A]":
          variant === "success",
      },
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight font-display text-sm", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs leading-relaxed opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
