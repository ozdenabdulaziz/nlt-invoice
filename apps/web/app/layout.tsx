import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NLT Invoice",
    template: "%s | NLT Invoice",
  },
  description:
    "English-first invoicing software for Canadian small businesses. Manage customers, estimates, invoices, onboarding, and public document links in one clean workflow.",
  metadataBase: new URL("http://localhost:3000"),
};

const appBackground =
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[26rem] before:bg-[radial-gradient(circle_at_top,_rgba(13,63,84,0.18),_transparent_60%),linear-gradient(180deg,_rgba(237,229,214,0.85),_rgba(248,244,237,0))]";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`relative min-h-full bg-background font-sans text-foreground antialiased ${appBackground}`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
