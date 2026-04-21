import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      style={{
        background: "#0C0E1A",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "1.5rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "-0.01em",
        }}
      >
        NLT Invoice
      </div>

      <div style={{ display: "flex", gap: "1.75rem" }}>
        {[
          { href: "/features", label: "Features" },
          { href: "/pricing", label: "Pricing" },
          { href: "/support", label: "Support" },
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.15s",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        © 2026 NLT Invoice. All rights reserved.
      </div>
    </footer>
  );
}

