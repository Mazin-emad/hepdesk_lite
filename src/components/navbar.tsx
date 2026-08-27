"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useAuth } from "./providers";
import { NotificationBell } from "./notification-bell";
import { Button } from "./ui/button";
import logo from "@/assets/images/helpdesk_lite_logo.svg";
import {
  PlusCircle,
  LayoutDashboard,
  Inbox,
  Shield,
  Moon,
  Sun,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, theme, toggleTheme, signOut } = useAuth();

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
            className="group flex min-w-0 select-none items-center"
            aria-label="HelpDesk Lite home"
          >
            <Image
              src={logo}
              alt="HelpDesk Lite"
              priority
              width={220}
              height={56}
              className="h-8 w-auto object-contain sm:h-9"
            />
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

          {/* Active User Profile */}
          <div className="hidden min-[370px]:flex items-center border-l border-border pl-2">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "shadow-xl border border-border",
                },
              }}
            >
              <UserButton.Action
                label="Sign out"
                labelIcon={<span aria-hidden="true">↩</span>}
                onClick={async () => {
                  await signOut();
                }}
              />
            </UserButton>
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
