import React from "react";
import { Ticket, UserProfile } from "@/lib/types";
import { isTicketOverdue } from "@/lib/workflow";
import { Badge } from "../ui/badge";
import { Users, AlertCircle } from "lucide-react";

interface WorkloadTableProps {
  tickets: Ticket[];
  users: UserProfile[];
}

export function WorkloadTable({ tickets, users }: WorkloadTableProps) {
  const staffMembers = users.filter(
    (u) => u.role === "staff" || u.role === "manager"
  );

  const unassignedTickets = tickets.filter(
    (t) => !t.ownerId && t.status !== "Closed" && t.status !== "Resolved"
  );

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-bold text-sm text-foreground flex items-center">
          <Users className="mr-1.5 h-4 w-4 text-primary" />
          Staff Workload &amp; Allocation Ledger
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 font-sans">
          Active assignments and ticket completion distribution across service desk personnel.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground font-mono uppercase text-[11px]">
            <tr>
              <th className="p-3">Staff Officer</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-center">In Progress</th>
              <th className="p-3 text-center">Assigned</th>
              <th className="p-3 text-center">Waiting User</th>
              <th className="p-3 text-center">Overdue</th>
              <th className="p-3 text-center">Resolved</th>
              <th className="p-3 text-right">Total Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-sans">
            {staffMembers.map((staff) => {
              const staffTickets = tickets.filter((t) => t.ownerId === staff.uid);
              const inProgress = staffTickets.filter(
                (t) => t.status === "In Progress"
              ).length;
              const assigned = staffTickets.filter(
                (t) => t.status === "Assigned"
              ).length;
              const waiting = staffTickets.filter(
                (t) => t.status === "Waiting on Requester"
              ).length;
              const resolved = staffTickets.filter(
                (t) => t.status === "Resolved" || t.status === "Closed"
              ).length;
              const overdue = staffTickets.filter(
                (t) => isTicketOverdue(t)
              ).length;
              const totalActive = inProgress + assigned + waiting;

              return (
                <tr key={staff.uid} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {staff.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {staff.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={staff.role === "manager" ? "oxblood" : "ochre"} className="text-[10px] font-mono uppercase">
                      {staff.role}
                    </Badge>
                  </td>
                  <td className="p-3 text-center font-mono tabular-nums font-semibold">
                    {inProgress > 0 ? (
                      <span className="rounded-xs bg-[#FCF0C8] dark:bg-[#3D2E0B] px-1.5 py-0.2 text-[#946800] dark:text-[#F5BF38] border border-[#C1791E]/30">
                        {inProgress}
                      </span>
                    ) : (
                      <span className="text-muted-foreground opacity-40">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono tabular-nums font-semibold">
                    {assigned > 0 ? (
                      <span className="rounded-xs bg-primary/10 px-1.5 py-0.2 text-primary border border-primary/30">
                        {assigned}
                      </span>
                    ) : (
                      <span className="text-muted-foreground opacity-40">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono tabular-nums font-semibold">
                    {waiting > 0 ? (
                      <span className="rounded-xs bg-[#EFE6EC] dark:bg-[#352131] px-1.5 py-0.2 text-[#6E4967] dark:text-[#D1AECB] border border-[#7A5C74]/30">
                        {waiting}
                      </span>
                    ) : (
                      <span className="text-muted-foreground opacity-40">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono tabular-nums font-semibold">
                    {overdue > 0 ? (
                      <span className="rounded-xs bg-secondary/10 px-1.5 py-0.2 text-secondary border border-secondary/30">
                        {overdue}
                      </span>
                    ) : (
                      <span className="text-muted-foreground opacity-40">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono tabular-nums font-medium text-[#3D6448] dark:text-[#96C4A2]">
                    {resolved}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums font-bold text-foreground">
                    {totalActive}
                  </td>
                </tr>
              );
            })}

            {/* Unassigned row */}
            <tr className="bg-muted/30 font-medium">
              <td className="p-3 text-secondary italic flex items-center font-mono text-xs">
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
                Unassigned Stubs
              </td>
              <td className="p-3 text-muted-foreground font-mono">-</td>
              <td className="p-3 text-center text-muted-foreground font-mono">-</td>
              <td className="p-3 text-center font-mono font-bold text-secondary">
                {unassignedTickets.length}
              </td>
              <td className="p-3 text-center text-muted-foreground font-mono">-</td>
              <td className="p-3 text-center text-muted-foreground font-mono">-</td>
              <td className="p-3 text-center text-muted-foreground font-mono">-</td>
              <td className="p-3 text-right font-mono font-bold text-secondary">
                {unassignedTickets.length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
