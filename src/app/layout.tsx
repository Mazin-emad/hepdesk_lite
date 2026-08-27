import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { AppFooter } from "@/components/app-footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HelpDesk Lite | Dispatch & Work-Order Service Desk",
  description:
    "Fast, focused internal service desk and work-order ticketing system with strict state machine and manager visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
        <ClerkProvider>
          <AppProviders>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <AppFooter />
            </div>
          </AppProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
