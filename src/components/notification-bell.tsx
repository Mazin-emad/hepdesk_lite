"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./providers";
import { AppNotification } from "@/lib/types";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/firestore-service";
import { formatRelativeDate } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    if (!currentUser?.uid) return;
    try {
      const data = await getNotifications(currentUser.uid);
      setNotifications(data);
    } catch (err) {
      console.warn("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);
    if (notif.ticketId) {
      router.push(`/tickets/${notif.ticketId}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.uid) return;
    await markAllNotificationsAsRead(currentUser.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "assigned":
        return <UserCheck className="h-3.5 w-3.5 text-primary" />;
      case "resolved":
        return <CheckCircle2 className="h-3.5 w-3.5 text-[#5E8C6A]" />;
      default:
        return <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-xs border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors select-none"
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-mono font-bold text-white shadow-2xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md border border-border bg-card p-0 shadow-md z-50 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-xs text-foreground uppercase tracking-wide">
                Dispatch Notices
              </span>
              {unreadCount > 0 && (
                <span className="rounded-xs bg-primary/10 px-1.5 py-0.2 text-[10px] font-mono font-bold text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-6 px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Clear unread
              </Button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-muted-foreground">
                No unread dispatches on your desk.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 flex items-start space-x-2.5 ${
                    !notif.read ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[11px] font-bold text-foreground truncate">
                        {notif.ticketTitle || notif.ticketId}
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">
                        {formatRelativeDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
