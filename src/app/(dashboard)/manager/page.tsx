"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";
import { RoleGuard } from "@/components/role-guard";
import { Ticket, UserProfile } from "@/lib/types";
import { getTickets, getAllUsers } from "@/lib/firestore-service";
import { getStatusDuration, isTicketOverdue } from "@/lib/workflow";
import { MetricsCards } from "@/components/manager/metrics-cards";
import { AgingTable } from "@/components/manager/aging-table";
import { WorkloadTable } from "@/components/manager/workload-table";
import { UserRolesTable } from "@/components/manager/user-roles-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Download,
  RefreshCw,
  Clock,
  Users,
  Layers,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsData, usersData] = await Promise.all([
        getTickets(undefined, { uid: currentUser.uid, role: "manager" }),
        getAllUsers(),
      ]);
      setTickets(ticketsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to load manager dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  // CSV Export utility
  const handleExportCSV = () => {
    if (tickets.length === 0) return;

    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Requester Name",
      "Requester Email",
      "Assigned Owner",
      "Created At",
      "Updated At",
      "Time In Status",
      "Is Overdue",
    ];

    const rows = tickets.map((t) => {
      const { formatted: durationStr } = getStatusDuration(t);
      const overdue = isTicketOverdue(t) ? "YES" : "NO";
      return [
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${t.requesterName.replace(/"/g, '""')}"`,
        `"${t.requesterEmail}"`,
        `"${(t.ownerName || "Unassigned").replace(/"/g, '""')}"`,
        `"${t.createdAt}"`,
        `"${t.updatedAt}"`,
        `"${durationStr}"`,
        `"${overdue}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `helpdesk_tickets_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RoleGuard
      allowedRoles={["manager"]}
      fallbackTitle="Manager Dashboard Restricted"
      fallbackMessage="The manager operations portal is exclusively accessible to users with the 'manager' role."
    >
      <div className="space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Manager Operations &amp; Visibility
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time SLA tracking, queue metrics, staff workload allocation, and user roles.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="flex items-center space-x-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExportCSV}
              disabled={tickets.length === 0}
              className="flex items-center space-x-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* 1. Metrics Cards Overview */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <MetricsCards tickets={tickets} />
        )}

        {/* 2. Aging & SLA Monitor Table */}
        {loading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <AgingTable tickets={tickets} />
        )}

        {/* 3. Staff Workload Distribution */}
        {loading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <WorkloadTable tickets={tickets} users={users} />
        )}

        {/* 4. User Roles & Permission Management */}
        {loading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <UserRolesTable users={users} onRoleChanged={loadData} />
        )}
      </div>
    </RoleGuard>
  );
}
