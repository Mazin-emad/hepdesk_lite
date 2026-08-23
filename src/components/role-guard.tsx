"use client";

import React from "react";
import { useAuth } from "./providers";
import { UserRole } from "@/lib/types";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallbackTitle = "Access Restricted",
  fallbackMessage,
}: RoleGuardProps) {
  const { currentUser } = useAuth();
  const router = useRouter();

  const isAllowed = allowedRoles.includes(currentUser.role);

  if (isAllowed) {
    return <>{children}</>;
  }

  const defaultMsg = `This page requires ${allowedRoles
    .map((r) => r.toUpperCase())
    .join(" or ")} privileges. Your current role is "${currentUser.role}".`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full rounded-xl border border-destructive/20 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {fallbackTitle}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {fallbackMessage || defaultMsg}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
