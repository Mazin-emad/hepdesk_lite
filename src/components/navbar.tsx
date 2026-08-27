"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./providers";
import { NotificationBell } from "./notification-bell";
import { Button } from "./ui/button";
import {
  Ticket as TicketIcon,
  PlusCircle,
  LayoutDashboard,
  Inbox,
  Shield,
  Moon,
  Sun,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, theme, toggleTheme } = useAuth();

  const isManager = currentUser.role === "manager";

  const navLinks = [
    {
      label: "Dispatch Board",
      mobileLabel: "Dispatch",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Work-Order Queue",
      mobileLabel: "Queue",
      href: "/tickets",
      icon: Inbox,
      active: pathname.startsWith("/tickets") && pathname !== "/tickets/new",
    },
    ...(isManager
      ? [
          {
            label: "Manager SLA & Aging",
            mobileLabel: "Manager",
            href: "/manager",
            icon: Shield,
            active: pathname === "/manager",
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-xs">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center space-x-3 sm:space-x-6">
          
          {/* Logo & Counter Sign */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 group select-none min-w-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary text-primary-foreground shadow-2xs">
              <TicketIcon className="h-4 w-4" />
            </div>
            <div className="hidden min-[420px]:flex flex-col">
              <span className="font-display font-bold text-sm lg:text-base tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                HelpDesk Lite
              </span>
              <span className="text-[9px] lg:text-[10px] font-mono tracking-wide uppercase text-muted-foreground -mt-0.5">
                Dispatch Counter
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 rounded-xs px-2.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-medium transition-colors ${
                    link.active
                      ? "bg-muted text-foreground font-semibold border border-border"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          <Link href="/tickets/new">
            <Button size="sm" className="hidden sm:flex items-center space-x-1.5 h-8 text-xs font-semibold shadow-2xs">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Ticket</span>
            </Button>
          </Link>

          {/* Real-time In-App Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 rounded-xs text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Active User Stamp Avatar */}
          <div className="hidden min-[370px]:flex items-center space-x-2 pl-2 border-l border-border">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 text-primary font-mono font-bold text-xs border border-primary/30"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.name
                ? currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "U"}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-border py-1.5 px-2 bg-card">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-0 max-w-[78px] flex-col items-center space-y-0.5 text-[10px] font-medium py-1 px-1.5 rounded-xs ${
                link.active
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{link.mobileLabel}</span>
            </Link>
          );
        })}
        <Link
          href="/tickets/new"
          className="flex min-w-0 max-w-[78px] flex-col items-center space-y-0.5 text-[10px] font-medium py-1 px-1.5 text-primary"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="truncate">New</span>
        </Link>
      </div>
    </header>
  );
}
