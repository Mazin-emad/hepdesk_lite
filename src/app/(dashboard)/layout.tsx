import React from "react";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground bg-card/40">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HelpDesk Lite &bull; Appendix A Workflow &bull; Next.js 14 + Firestore</span>
          <span>Role-Based Access: Employee / Staff / Manager</span>
        </div>
      </footer>
    </div>
  );
}
