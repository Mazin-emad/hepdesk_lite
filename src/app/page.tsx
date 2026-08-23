import Link from "next/link";
import {
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Ticket as TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Dispatch Station Hero */}
        <section className="py-14 sm:py-20 border-b border-border bg-card/40">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center space-x-2 rounded-xs border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono font-semibold text-primary uppercase tracking-wider mb-6">
              <TicketIcon className="h-3.5 w-3.5" />
              <span>Work-Order Intake &bull; Appendix A Workflow &bull; Firestore</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-display leading-tight">
              Internal IT &amp; Service Desk Dispatch Counter
            </h1>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-sans">
              A structured work-order ticketing terminal with strict workflow transitions, real-time dispatch alerts, staff load balancing, and manager SLA aging tracking.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="flex items-center space-x-2 shadow-2xs">
                  <span>Open Dispatch Board</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/tickets/new">
                <Button size="lg" variant="outline" className="flex items-center space-x-2 shadow-2xs">
                  <PlusCircle className="h-4 w-4 text-primary" />
                  <span>Submit Work Order</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-14 container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-foreground font-display">System Specification &bull; 6 Epics</h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
              Guarded by Firestore security rules &amp; Clerk identity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-md border border-border bg-card p-5 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-primary/10 text-primary mb-3">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">
                Strict State Machine
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">
                Appendix A legal transitions: New &rarr; Assigned &rarr; In Progress &rarr; Waiting on Requester &rarr; Resolved &rarr; Closed. Enforced in code and security rules.
              </p>
            </div>

            <div className="rounded-md border border-border bg-card p-5 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-primary/10 text-primary mb-3">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">
                SLA Aging &amp; Overdue Monitor
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">
                Computes time spent in current state from immutable audit trail. Flags tickets &gt; 3 days as overdue, with full workload matrix for managers.
              </p>
            </div>

            <div className="rounded-md border border-border bg-card p-5 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-secondary/10 text-secondary mb-3">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">
                Role-Based Authority
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">
                Distinct clearances for Employees (submit &amp; track own), Staff (queue &amp; triage), and Managers (workload, roles, and CSV export).
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
