import Link from "next/link";

/* ─── Reusable style tokens ─────────────────────────────────────── */
const S = {
  blue: "#1A49E8",
  blue2: "#0F35B8",
  blueLight: "#EEF2FF",
  teal: "#00B4A0",
  tealLight: "#E6F9F7",
  orange: "#FF6B2B",
  orangeLight: "#FFF0EA",
  yellow: "#FFD23F",
  ink: "#0C0E1A",
  ink2: "#3D4263",
  ink3: "#8B90A8",
  bg: "#F8F9FF",
  white: "#FFFFFF",
  border: "#E4E7F4",
  sans: "'Plus Jakarta Sans', sans-serif",
  serif: "'Fraunces', Georgia, serif",
};

/* ─── Feature cards data ────────────────────────────────────────── */
const features = [
  {
    color: "blue" as const,
    title: "Professional invoices",
    desc: "Create polished, branded invoices in seconds. HST/GST/PST built right in — no manual math required.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.blue} strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    color: "teal" as const,
    title: "Client management",
    desc: "All your clients, invoices, and payment history in one organized, searchable place.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.teal} strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    color: "orange" as const,
    title: "Secure share links",
    desc: "Mobile-friendly invoice pages clients can view and act on — no login needed on their end.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.orange} strokeWidth="2" strokeLinecap="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    color: "blue" as const,
    title: "Estimates too",
    desc: "Send estimates before you start. Convert to invoice with one click — all your data pre-filled.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.blue} strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <polyline points="8 21 12 17 16 21" />
      </svg>
    ),
  },
  {
    color: "teal" as const,
    title: "Payment tracking",
    desc: "See exactly what's paid, pending, or overdue. Get a clear picture of your cash flow at a glance.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.teal} strokeWidth="2" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    color: "orange" as const,
    title: "Built for Canada",
    desc: "CAD native. Supports HST, GST, PST by province. Invoice formats your clients and accountant recognize.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.orange} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

const iconBg = { blue: S.blueLight, teal: S.tealLight, orange: S.orangeLight };

/* ─── How it works steps ────────────────────────────────────────── */
const steps = [
  { n: "01", title: "Create your profile", desc: "Add your business name, logo, and payment info. Done in under a minute." },
  { n: "02", title: "Add your clients", desc: "Save client details once and reuse them on every invoice going forward." },
  { n: "03", title: "Send the link", desc: "Share a secure, beautiful invoice page directly to your client's inbox." },
  { n: "04", title: "Get paid", desc: "Track payment status in real time. Follow up with one click if needed." },
];

/* ─── Pricing features ──────────────────────────────────────────── */
const freeFeats = ["5 invoices per month", "Up to 3 clients", "Secure share links", "CAD + tax support"];
const proFeats = ["Unlimited invoices & clients", "Estimates + 1-click convert", "Payment reminders", "Priority support"];

/* ─── Page ──────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ fontFamily: S.sans, background: S.bg, color: S.ink, overflowX: "hidden" }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 560,
          borderBottom: `1px solid ${S.border}`,
        }}
      >
        {/* Hero Left */}
        <div
          style={{
            padding: "4rem 3rem 4rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRight: `1px solid ${S.border}`,
          }}
        >
          {/* Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: S.blueLight,
              color: S.blue,
              padding: "5px 12px 5px 8px",
              borderRadius: 100,
              fontSize: "0.75rem",
              fontWeight: 600,
              marginBottom: "1.75rem",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                background: S.blue,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 10 10" width="10" height="10" fill="#fff">
                <path d="M5 1L6.5 4H9L7 6L7.8 9L5 7.5L2.2 9L3 6L1 4H3.5Z" />
              </svg>
            </div>
            Made for Canadian freelancers
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: S.serif,
              fontSize: "3.4rem",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: S.ink,
              marginBottom: "1.25rem",
              fontWeight: 700,
            }}
          >
            Invoice with
            <br />
            <span style={{ color: S.blue, fontStyle: "italic", fontWeight: 300 }}>confidence,</span>
            <span style={{ display: "block" }}>get paid on time.</span>
          </h1>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.75,
              color: S.ink2,
              marginBottom: "2rem",
              fontWeight: 400,
              maxWidth: 420,
            }}
          >
            The simplest way to create professional invoices, manage clients, and track payments — built specifically for Canadian small businesses.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: "2.25rem" }}>
            <Link
              href="/register"
              style={{
                padding: "0 1.5rem",
                height: 48,
                border: "none",
                borderRadius: 10,
                background: S.blue,
                color: "#fff",
                fontFamily: S.sans,
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
            >
              Get started free →
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: "0 1.5rem",
                height: 48,
                border: `1.5px solid ${S.border}`,
                borderRadius: 10,
                background: "transparent",
                color: S.ink2,
                fontFamily: S.sans,
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s",
              }}
            >
              See pricing
            </Link>
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex" }}>
              {[
                { bg: S.blue, label: "AK" },
                { bg: S.teal, label: "SL" },
                { bg: S.orange, label: "MC" },
                { bg: "#8B5CF6", label: "JR" },
              ].map((av, i) => (
                <div
                  key={av.label}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: `2px solid ${S.white}`,
                    marginLeft: i === 0 ? 0 : -8,
                    background: av.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {av.label}
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: S.yellow, fontSize: "0.85rem", letterSpacing: -1 }}>★★★★★</div>
              <div style={{ fontSize: "0.8rem", color: S.ink3, fontWeight: 500 }}>
                <strong style={{ color: S.ink2 }}>4,200+</strong> Canadian businesses trust NLT
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right — Dashboard Mockup */}
        <div
          style={{
            background: S.white,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            justifyContent: "center",
          }}
        >
          {/* Dashboard header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: S.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Your dashboard
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", fontWeight: 600, color: S.teal }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: S.teal,
                  display: "inline-block",
                  animation: "blink 1.8s infinite",
                }}
              />
              Live
            </span>
          </div>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {/* Blue KPI */}
            <div style={{ background: S.blue, color: "#fff", borderRadius: 12, padding: "1rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, bottom: -8, width: 50, height: 50, borderRadius: "50%", opacity: 0.12, background: "#fff" }} />
              <div style={{ fontFamily: S.serif, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1, marginBottom: 3 }}>$9,240</div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>This month</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, marginTop: 6, opacity: 0.9 }}>↑ 18% vs last month</div>
            </div>
            {/* Teal KPI */}
            <div style={{ background: S.teal, color: "#fff", borderRadius: 12, padding: "1rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, bottom: -8, width: 50, height: 50, borderRadius: "50%", opacity: 0.12, background: "#fff" }} />
              <div style={{ fontFamily: S.serif, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1, marginBottom: 3 }}>12</div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>Invoices sent</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, marginTop: 6, opacity: 0.9 }}>↑ 3 new this week</div>
            </div>
            {/* Orange KPI */}
            <div style={{ background: S.orangeLight, color: S.orange, borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontFamily: S.serif, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1, marginBottom: 3 }}>$2,100</div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pending</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, marginTop: 6, color: S.orange }}>2 overdue</div>
            </div>
          </div>

          {/* Recent invoices card */}
          <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Card head */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: `1px solid ${S.border}`, background: S.white }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: S.ink, letterSpacing: "0.02em" }}>Recent invoices</span>
              <span style={{ fontSize: "0.72rem", color: S.blue, fontWeight: 600, cursor: "pointer" }}>View all →</span>
            </div>

            {/* Invoice rows */}
            {[
              { av: "RA", avBg: S.blueLight, avColor: S.blue, name: "Riverside Agency", date: "INV-0048 · Apr 14", amount: "$2,712", badge: "Paid", badgeBg: "#E6F9F0", badgeColor: "#0D9E5C" },
              { av: "NS", avBg: S.tealLight, avColor: S.teal, name: "Northwood Studio", date: "INV-0047 · Apr 8", amount: "$4,500", badge: "Pending", badgeBg: "#FFF5E0", badgeColor: "#C27800" },
              { av: "EC", avBg: S.orangeLight, avColor: S.orange, name: "Elm & Co.", date: "INV-0046 · Apr 2", amount: "$850", badge: "Draft", badgeBg: S.bg, badgeColor: S.ink3 },
            ].map((row) => (
              <div
                key={row.name}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 1rem", borderBottom: `1px solid ${S.border}`, background: S.white }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: row.avBg, color: row.avColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                    {row.av}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.83rem", fontWeight: 600, color: S.ink, lineHeight: 1.2 }}>{row.name}</div>
                    <div style={{ fontSize: "0.7rem", color: S.ink3 }}>{row.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: S.ink }}>{row.amount}</span>
                  <span style={{ padding: "3px 9px", borderRadius: 100, fontSize: "0.65rem", fontWeight: 700, background: row.badgeBg, color: row.badgeColor, border: row.badge === "Draft" ? `1px solid ${S.border}` : "none" }}>
                    {row.badge}
                  </span>
                </div>
              </div>
            ))}

            {/* Mini bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 52, padding: "0 1rem 0.75rem", background: S.white, borderTop: `1px solid ${S.border}` }}>
              {[30, 55, 40, 70, 50, 90, 35].map((h, i) => (
                <div
                  key={i}
                  style={{ flex: 1, height: `${h}%`, borderRadius: "4px 4px 0 0", background: i === 5 ? S.blue : S.blueLight }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 5, padding: "0 1rem", background: S.white }}>
              {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m) => (
                <span key={m} style={{ flex: 1, fontSize: "0.6rem", color: S.ink3, textAlign: "center", fontWeight: 500, paddingBottom: "0.5rem" }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 2.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: S.tealLight,
            color: S.teal,
            padding: "4px 12px",
            borderRadius: 100,
            fontSize: "0.73rem",
            fontWeight: 700,
            marginBottom: "1rem",
            letterSpacing: "0.04em",
          }}
        >
          Features
        </div>
        <h2
          style={{
            fontFamily: S.serif,
            fontSize: "2.4rem",
            color: S.ink,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: "0.6rem",
            letterSpacing: "-0.02em",
          }}
        >
          Everything you need to run
          <br />
          <em style={{ color: S.blue, fontStyle: "italic", fontWeight: 300 }}>your business billing.</em>
        </h2>
        <p style={{ fontSize: "0.95rem", color: S.ink2, lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 520 }}>
          Designed for Canadian solopreneurs who want professional results without the enterprise complexity.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: S.white,
                border: `1px solid ${S.border}`,
                borderRadius: 14,
                padding: "1.5rem",
                transition: "all 0.2s",
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: iconBg[f.color],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: S.ink, marginBottom: "0.4rem" }}>{f.title}</div>
              <div style={{ fontSize: "0.83rem", color: S.ink2, lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <div style={{ background: S.blue, padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: "0.73rem",
              fontWeight: 700,
              marginBottom: "1rem",
              letterSpacing: "0.04em",
            }}
          >
            How it works
          </div>
          <h2
            style={{
              fontFamily: S.serif,
              fontSize: "2.4rem",
              color: "#fff",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: "2.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Up and running in under 60 seconds.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 1,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {steps.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  padding: "1.75rem",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ fontFamily: S.serif, fontSize: "2.5rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", marginBottom: "0.75rem", lineHeight: 1 }}>
                  {step.n}
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>{step.title}</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 2.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: S.tealLight,
                color: S.teal,
                padding: "4px 12px",
                borderRadius: 100,
                fontSize: "0.73rem",
                fontWeight: 700,
                marginBottom: "1rem",
                letterSpacing: "0.04em",
              }}
            >
              Pricing
            </div>
            <h2
              style={{
                fontFamily: S.serif,
                fontSize: "2.4rem",
                color: S.ink,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Simple, transparent pricing.
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: S.ink2, maxWidth: 280, textAlign: "right", lineHeight: 1.7 }}>
            No per-invoice fees. No hidden charges. Flat rate, unlimited invoicing.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, maxWidth: 680 }}>
          {/* Free card */}
          <div
            style={{
              background: S.white,
              border: `1.5px solid ${S.border}`,
              borderRadius: 16,
              padding: "2rem",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.ink3, marginBottom: "1rem" }}>Free</div>
            <div style={{ fontFamily: S.serif, fontSize: "3.2rem", fontWeight: 700, color: S.ink, letterSpacing: "-0.03em", lineHeight: 1 }}>$0</div>
            <div style={{ fontSize: "0.82rem", color: S.ink3, marginTop: 4, fontWeight: 400 }}>forever, no card needed</div>
            <div style={{ height: 1, background: S.border, margin: "1.25rem 0" }} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9, marginBottom: "1.5rem" }}>
              {freeFeats.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: S.ink2 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: S.blueLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.6rem", color: S.blue, fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              style={{
                display: "block",
                width: "100%",
                height: 44,
                borderRadius: 9,
                fontFamily: S.sans,
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
                lineHeight: "44px",
                border: `1.5px solid ${S.border}`,
                background: "transparent",
                color: S.ink2,
                transition: "all 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              Get started free
            </Link>
          </div>

          {/* Pro card (featured) */}
          <div
            style={{
              background: S.blue,
              border: `1.5px solid ${S.blue}`,
              borderRadius: 16,
              padding: "2rem",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>Pro</div>
            <div style={{ fontFamily: S.serif, fontSize: "3.2rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>$12</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 400 }}>per month · cancel anytime</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "1.25rem 0" }} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9, marginBottom: "1.5rem" }}>
              {proFeats.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "rgba(255,255,255,0.8)" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.6rem", color: "#fff", fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              style={{
                display: "block",
                width: "100%",
                height: 44,
                borderRadius: 9,
                fontFamily: S.sans,
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
                lineHeight: "44px",
                border: "none",
                background: "#fff",
                color: S.blue,
                transition: "all 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              Start 14-day trial →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div style={{ background: S.ink, padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "3rem" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                padding: "4px 12px",
                borderRadius: 100,
                fontSize: "0.73rem",
                fontWeight: 600,
                marginBottom: "1rem",
                letterSpacing: "0.04em",
              }}
            >
              Join 4,200+ Canadian businesses
            </div>
            <h2
              style={{
                fontFamily: S.serif,
                fontSize: "2.8rem",
                color: "#fff",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Stop chasing.
              <br />
              Start <em style={{ color: S.yellow, fontStyle: "italic", fontWeight: 300 }}>getting paid.</em>
            </h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", marginTop: "0.75rem", lineHeight: 1.7, maxWidth: 400 }}>
              Spend less time on admin, more time on work that actually matters. NLT Invoice handles the paperwork.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
            <Link
              href="/register"
              style={{
                padding: "0 2rem",
                height: 50,
                border: "none",
                borderRadius: 11,
                background: S.blue,
                color: "#fff",
                fontFamily: S.sans,
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              Create your first invoice →
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: "0 2rem",
                height: 44,
                border: "1.5px solid rgba(255,255,255,0.15)",
                borderRadius: 11,
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontFamily: S.sans,
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Blink animation for live dot */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

