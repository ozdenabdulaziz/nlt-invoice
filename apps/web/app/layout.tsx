import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

import { getAppUrl } from "@/lib/app-url";

export const metadata: Metadata = {
  title: {
    default: "NLT Invoice",
    template: "%s | NLT Invoice",
  },
  description:
    "English-first invoicing software for Canadian small businesses. Manage customers, estimates, invoices, onboarding, and public document links in one clean workflow.",
  metadataBase: new URL(getAppUrl()),
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`relative min-h-full bg-background font-sans text-foreground antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
