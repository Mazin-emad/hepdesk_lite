import { Fragment } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ClipboardList,
  PlusCircle,
  Search,
  ShieldCheck,
  Timer,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

const WORKFLOW_STATES: { label: string; cls: string }[] = [
  {
    label: "New",
    cls: "bg-status-new-bg text-status-new-text dark:bg-status-new-darkBg dark:text-status-new-darkText",
  },
  {
    label: "Assigned",
    cls: "bg-status-assigned-bg text-status-assigned-text dark:bg-status-assigned-darkBg dark:text-status-assigned-darkText",
  },
  {
    label: "In Progress",
    cls: "bg-status-progress-bg text-status-progress-text dark:bg-status-progress-darkBg dark:text-status-progress-darkText",
  },
  {
    label: "Waiting on Requester",
    cls: "bg-status-waiting-bg text-status-waiting-text dark:bg-status-waiting-darkBg dark:text-status-waiting-darkText",
  },
  {
    label: "Resolved",
    cls: "bg-status-resolved-bg text-status-resolved-text dark:bg-status-resolved-darkBg dark:text-status-resolved-darkText",
  },
  {
    label: "Closed",
    cls: "bg-status-closed-bg text-status-closed-text dark:bg-status-closed-darkBg dark:text-status-closed-darkText",
  },
];

const BARCODE_WIDTHS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 1, 4, 2, 1, 1, 3];

const ROLE_ROWS = [
  { tag: "Employee", tone: "bg-muted text-muted-foreground", power: "Submit & track own stubs" },
  { tag: "Staff", tone: "bg-primary/10 text-primary", power: "Triage, assign & resolve the queue" },
  { tag: "Manager", tone: "bg-secondary/10 text-secondary", power: "Workload, roles & CSV export" },
];

const LOAD_BARS = [
  { name: "David Kim", pct: 78, danger: false },
  { name: "Elena Rostova", pct: 46, danger: false },
  { name: "Unassigned pool", pct: 18, danger: true },
];

function FeatureCard({
  index,
  icon: Icon,
  title,
  desc,
  accent = "ochre",
  className = "",
  children,
}: {
  index: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  accent?: "ochre" | "oxblood";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`group relative flex flex-col rounded-md border bg-card p-5 shadow-2xs transition-colors ${
        accent === "oxblood"
          ? "border-border hover:border-secondary/50"
          : "border-border hover:border-primary/50"
      } ${className}`}
    >
      <span className="absolute right-4 top-4 font-mono text-[10px] font-semibold tracking-widest text-muted-foreground/50">
        {index}
      </span>

      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xs transition-colors ${
          accent === "oxblood"
            ? "bg-secondary/10 text-secondary group-hover:bg-secondary/20"
            : "bg-primary/10 text-primary group-hover:bg-primary/20"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <h3 className="font-display text-base font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 font-sans text-xs leading-relaxed text-muted-foreground">
        {desc}
      </p>

      {children && <div className="mt-auto pt-4">{children}</div>}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Dispatch Station Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
          <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />

          <div className="relative container mx-auto px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-xs border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <span>Work-Order Intake &bull; Appendix A Workflow &bull; Firestore</span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Internal IT &amp; Service Desk{" "}
                <span className="block whitespace-nowrap sm:inline">
                  <span className="text-primary">Dispatch</span> Counter
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
                A structured work-order ticketing terminal with strict workflow transitions,
                real-time dispatch alerts, staff load balancing, and manager SLA aging tracking.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="lg" className="group flex items-center space-x-2 shadow-2xs">
                    <span>Open Dispatch Board</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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

            {/* Claim-stub centerpiece */}
            <div className="relative mx-auto mt-14 max-w-md select-none sm:mt-16">
              <div className="absolute -left-14 top-6 hidden rotate-[-6deg] items-center gap-1 rounded-xs border border-[#5E8C6A]/40 bg-[#E4EDE6] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#3D6448] shadow-2xs dark:border-[#96C4A2]/30 dark:bg-[#1D2D21] dark:text-[#96C4A2] sm:inline-flex">
                <CheckCircle2 className="h-3 w-3" />
                Resolved &middot; 4h
              </div>
              <div className="absolute -right-12 bottom-8 hidden rotate-[5deg] items-center gap-1 rounded-xs border border-secondary/40 bg-secondary/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-secondary shadow-2xs sm:inline-flex">
                <AlertTriangle className="h-3 w-3" />
                Overdue &middot; 3d
              </div>

              <div className="group relative flex rotate-[-1.5deg] rounded-md border border-border bg-card text-left shadow-2xs transition-transform duration-300 hover:rotate-0">
                <div className="flex-1 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Work Order
                    </span>
                    <span className="rounded-xs px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-tight bg-status-progress-bg text-status-progress-text dark:bg-status-progress-darkBg dark:text-status-progress-darkText">
                      In Progress
                    </span>
                  </div>

                  <div className="dispatch-stamp mt-3 text-sm">MHL-101</div>

                  <p className="mt-3 font-display text-sm font-bold leading-snug text-foreground">
                    MacBook Pro display flickering constantly
                  </p>

                  <div className="mt-4 flex h-6 items-stretch gap-[2px]" aria-hidden>
                    {BARCODE_WIDTHS.map((w, i) => (
                      <span key={i} className="bg-foreground/75" style={{ width: `${w * 2}px` }} />
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                    MHL-101 &middot; Hardware &middot; High priority
                  </p>
                </div>

                <div className="relative flex w-14 shrink-0 items-center justify-center border-l border-dashed border-border">
                  <div className="absolute -left-2 -top-2 z-10 h-3.5 w-3.5 rounded-full border border-border bg-background" />
                  <div className="absolute -bottom-2 -left-2 z-10 h-3.5 w-3.5 rounded-full border border-border bg-background" />
                  <span className="[writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    Dispatch &bull; Admit One
                  </span>
                </div>
              </div>

              <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Every request lands as a claim stub like this
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              System Specification &mdash; Six Epics
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Six systems behind every claim stub
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
              From intake to close-out, guarded by Clerk identity and enforced by Firestore
              security rules.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              index="01"
              icon={Workflow}
              title="Strict State Machine"
              desc="Appendix A legal transitions enforced in application code and Firestore rules. No skipped or reversed hops, ever."
              className="md:col-span-2 lg:col-span-2"
            >
              <div className="flex flex-wrap items-center gap-y-1.5">
                {WORKFLOW_STATES.map((s, i) => (
                  <Fragment key={s.label}>
                    {i > 0 && (
                      <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-muted-foreground/40" />
                    )}
                    <span
                      className={`whitespace-nowrap rounded-xs border border-border/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-tight ${s.cls}`}
                    >
                      {s.label}
                    </span>
                  </Fragment>
                ))}
              </div>
              <p className="mt-2.5 font-mono text-[11px] text-muted-foreground">
                Append-only audit trail records every hop.
              </p>
            </FeatureCard>

            <FeatureCard
              index="02"
              icon={ShieldCheck}
              accent="oxblood"
              title="Role-Based Authority"
              desc="Three clearances with hard boundaries between them."
            >
              <div className="space-y-2">
                {ROLE_ROWS.map((r) => (
                  <div key={r.tag} className="flex items-center gap-2 font-sans text-xs">
                    <span
                      className={`min-w-[68px] rounded-xs px-1.5 py-0.5 text-center font-mono text-[10px] font-bold uppercase tracking-tight ${r.tone}`}
                    >
                      {r.tag}
                    </span>
                    <span className="text-muted-foreground">{r.power}</span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              index="03"
              icon={ClipboardList}
              title="Structured Intake"
              desc="Validated work-order form with category, priority and auto-filled requester. Every submission issues a unique MHL claim stub."
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Title &le;120 chars &middot; Desc &le;2000 chars
              </p>
            </FeatureCard>

            <FeatureCard
              index="04"
              icon={Search}
              title="Queue Views & Search"
              desc="Role-customized boards — My Tickets, Assigned to Me, Unassigned — with instant search as you type."
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Scans ID &middot; Title &middot; Description &middot; People
              </p>
            </FeatureCard>

            <FeatureCard
              index="05"
              icon={BellRing}
              title="In-App Notifications"
              desc="Real-time alerts the moment a stub is assigned, resolved or changes state, with unread counts and direct links."
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Assigned &middot; Resolved &middot; Status changed
              </p>
            </FeatureCard>

            <FeatureCard
              index="06"
              icon={Timer}
              accent="oxblood"
              title="Manager SLA & Aging Monitor"
              desc="Time-in-status computed from the immutable audit trail, with the staff workload matrix and one-click CSV export."
              className="md:col-span-2 lg:col-span-3"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full max-w-md space-y-2.5">
                  {LOAD_BARS.map((b) => (
                    <div key={b.name} className="flex items-center gap-3">
                      <span className="w-28 truncate font-mono text-[10px] uppercase tracking-tight text-muted-foreground">
                        {b.name}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${b.danger ? "bg-secondary" : "bg-primary"}`}
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                      <span className="w-7 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                        {b.pct}%
                      </span>
                    </div>
                  ))}
                </div>

                <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-xs border border-secondary/40 bg-secondary/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-secondary lg:self-center">
                  <AlertTriangle className="h-3 w-3" />
                  Flags open tickets &gt; 3 days
                </span>
              </div>
            </FeatureCard>
          </div>
        </section>
      </main>
    </div>
  );
}
