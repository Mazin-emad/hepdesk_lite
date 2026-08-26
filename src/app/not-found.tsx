import Link from "next/link";
import { AlertTriangle, ArrowRight, Home } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <section className="w-full max-w-xl rounded-md border border-border bg-card p-6 text-center shadow-2xs sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xs bg-secondary/10 text-secondary">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Error 404
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/">
              <Button className="flex items-center space-x-1.5">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-1.5">
                <span>Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
