"use client";

import Link from "next/link";

const marketingLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        height: "64px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E4E7F4",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#0C0E1A",
          letterSpacing: "-0.02em",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "#1A49E8",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="2" y="2" width="5" height="8" rx="1.5" fill="#fff" stroke="none" />
            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#fff" stroke="none" />
            <line x1="2" y1="13" x2="14" y2="13" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        NLT Invoice
      </Link>

      {/* Nav links */}
      <nav>
        <ul
          style={{
            display: "flex",
            gap: "2rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {marketingLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  color: "#3D4263",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#1A49E8")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "#3D4263")
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Link
          href="/login"
          style={{
            padding: "0 1rem",
            height: 36,
            border: "1.5px solid #E4E7F4",
            borderRadius: 8,
            background: "transparent",
            color: "#3D4263",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            transition: "all 0.15s",
          }}
        >
          Log in
        </Link>
        <Link
          href="/register"
          style={{
            padding: "0 1.1rem",
            height: 36,
            border: "none",
            borderRadius: 8,
            background: "#1A49E8",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Start free
        </Link>
      </div>
    </header>
  );
}

