"use client";

import React, { useState } from "react";
import { UserProfile, UserRole } from "@/lib/types";
import { updateUserRole } from "@/lib/firestore-service";
import { Badge } from "../ui/badge";
import { Select } from "../ui/select";
import { formatDate } from "@/lib/utils";
import { Shield, Check } from "lucide-react";

interface UserRolesTableProps {
  users: UserProfile[];
  onRoleChanged?: () => void;
}

export function UserRolesTable({ users, onRoleChanged }: UserRolesTableProps) {
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [successUid, setSuccessUid] = useState<string | null>(null);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingUid(uid);
    try {
      await updateUserRole(uid, newRole);
      setSuccessUid(uid);
      setTimeout(() => setSuccessUid(null), 2500);
      if (onRoleChanged) {
        onRoleChanged();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-bold text-sm text-foreground flex items-center">
          <Shield className="mr-1.5 h-4 w-4 text-primary" />
          User Permissions &amp; Clearance Registry
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-sans">
          Configure personnel access levels (Employee / Staff / Manager) across the organization.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground font-mono uppercase text-[11px]">
            <tr>
              <th className="p-3">Personnel</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Current Clearance</th>
              <th className="p-3">Registered Date</th>
              <th className="p-3 text-right">Assign Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-sans">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-6 w-6 rounded-xs bg-primary/10 text-primary border border-primary/30 flex items-center justify-center font-mono font-bold text-[10px]">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-[11px] text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <Badge
                    variant={
                      user.role === "manager"
                        ? "oxblood"
                        : user.role === "staff"
                        ? "ochre"
                        : "outline"
                    }
                    className="text-[10px] font-mono uppercase font-bold"
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="p-3 font-mono text-[11px] text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center space-x-2">
                    {successUid === user.uid && (
                      <span className="text-[10px] font-mono text-[#3D6448] dark:text-[#96C4A2] font-semibold flex items-center animate-in fade-in">
                        <Check className="mr-0.5 h-3 w-3" />
                        Saved
                      </span>
                    )}
                    <Select
                      value={user.role}
                      disabled={updatingUid === user.uid}
                      onChange={(e) =>
                        handleRoleChange(user.uid, e.target.value as UserRole)
                      }
                      className="h-7 w-32 text-xs font-mono bg-background rounded-xs"
                    >
                      <option value="employee">Employee</option>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
