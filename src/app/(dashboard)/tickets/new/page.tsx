"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { createTicket } from "@/lib/firestore-service";
import { TicketCategory, TicketPriority, Ticket } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TicketStatusBadge } from "@/components/ticket-status-badge";
import {
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  User,
  Mail,
  Ticket as TicketIcon,
} from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Hardware");
  const [priority, setPriority] = useState<TicketPriority>("Medium");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const TITLE_MAX = 120;
  const DESC_MAX = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!title.trim()) {
      setError("Please provide a concise title for your request.");
      return;
    }
    if (title.trim().length > TITLE_MAX) {
      setError(`Title must not exceed ${TITLE_MAX} characters.`);
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description of the issue or requirement.");
      return;
    }
    if (description.trim().length > DESC_MAX) {
      setError(`Description must not exceed ${DESC_MAX} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        requesterId: currentUser.uid,
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
      });

      setCreatedTicket(ticket);
    } catch (err: unknown) {
      console.error("Error creating ticket:", err);
      setError(err instanceof Error ? err.message : "Failed to create work order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation View upon successful submission
  if (createdTicket) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <Card className="border-border bg-card text-center p-6 shadow-md animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xs bg-[#E4EDE6] dark:bg-[#1D2D21] text-[#3D6448] dark:text-[#96C4A2] mb-3">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground font-display">
            Work Order Logged &amp; Stamped
          </CardTitle>
          <CardDescription className="text-xs mt-1 font-sans">
            Your claim stub has been queued on the dispatch board.
          </CardDescription>

          <div className="my-5 rounded-xs border border-dashed border-border bg-muted/30 p-4 text-left space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase text-[11px]">Claim Stub ID:</span>
              <div className="dispatch-stamp text-xs font-bold tabular-nums">
                {createdTicket.id}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase text-[11px]">Initial Status:</span>
              <TicketStatusBadge status={createdTicket.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase text-[11px]">Category:</span>
              <span className="font-semibold text-foreground">
                {createdTicket.category}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase text-[11px]">Priority:</span>
              <span className="font-semibold text-foreground">
                {createdTicket.priority}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              onClick={() => router.push(`/tickets/${createdTicket.id}`)}
              className="w-full sm:w-auto flex items-center space-x-1.5 h-8 text-xs font-semibold shadow-2xs"
            >
              <span>Inspect Claim Stub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedTicket(null);
                setTitle("");
                setDescription("");
              }}
              className="w-full sm:w-auto h-8 text-xs font-medium"
            >
              Submit Another Work Order
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back Link */}
      <Link
        href="/tickets"
        className="inline-flex items-center text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Work-Order Queue
      </Link>

      <Card className="shadow-2xs">
        <CardHeader className="p-5 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <TicketIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Work-Order Intake Form</CardTitle>
              <CardDescription>
                Submit a new job ticket to the IT &amp; Operations service desk counter.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-5 space-y-4 font-sans">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Validation Notice</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Requester Profile Strip */}
            <div className="rounded-xs border border-border bg-muted/40 p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground uppercase text-[10px]">Requester:</span>
                <span className="font-semibold text-foreground">
                  {currentUser.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 opacity-60" />
                <span className="text-muted-foreground">{currentUser.email}</span>
              </div>
            </div>

            {/* Ticket Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <label className="font-semibold text-foreground">
                  Work-Order Summary <span className="text-secondary font-mono">*</span>
                </label>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {title.length} / {TITLE_MAX}
                </span>
              </div>
              <Input
                placeholder="e.g. MacBook Pro display flickering when connected to external monitor"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-xs h-9 bg-background"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground font-sans">
                  Category <span className="text-secondary font-mono">*</span>
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="text-xs h-9 bg-background rounded-xs"
                >
                  <option value="Hardware">Hardware (Laptops, Monitors, Equipment)</option>
                  <option value="Software">Software (Apps, Licensing, OS)</option>
                  <option value="Access">Access (IAM, Credentials, SSO)</option>
                  <option value="Network">Network (VPN, Wi-Fi, DNS)</option>
                  <option value="General">General Inquiry</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground font-sans">
                  Priority Clearance <span className="text-secondary font-mono">*</span>
                </label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="text-xs h-9 bg-background rounded-xs"
                >
                  <option value="Low">Low (General question / Minor)</option>
                  <option value="Medium">Medium (Standard operational request)</option>
                  <option value="High">High (Impacting daily operations)</option>
                  <option value="Urgent">Urgent (Outage / Critical blocker)</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <label className="font-semibold text-foreground">
                  Detailed Operational Notes <span className="text-secondary font-mono">*</span>
                </label>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {description.length} / {DESC_MAX}
                </span>
              </div>
              <Textarea
                placeholder="Describe the issue in detail, error codes observed, affected hardware/hostnames, or required clearance..."
                value={description}
                maxLength={DESC_MAX}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="text-xs bg-background"
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border p-4 bg-muted/20">
            <Link href="/tickets">
              <Button type="button" variant="ghost" size="sm" className="h-8 text-xs font-mono">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="flex items-center space-x-1.5 h-8 text-xs font-semibold shadow-2xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{submitting ? "Stamping..." : "Submit Work Order"}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
