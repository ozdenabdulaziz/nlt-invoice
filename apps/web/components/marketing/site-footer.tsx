import Link from "next/link";

const footerLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-center text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>Simple invoicing for Canadian small businesses.</p>
        <nav aria-label="Footer" className="flex justify-center gap-4">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="font-mono text-xs uppercase tracking-[0.24em] opacity-70">
          NLT Invoice
        </p>
      </div>
    </footer>
  );
}
