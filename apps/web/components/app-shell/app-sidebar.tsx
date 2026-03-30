import { Badge } from "@nlt-invoice/ui";
import { Separator } from "@nlt-invoice/ui";
import { BrandMark } from "@/components/shared/brand-mark";
import { NavLink } from "@/components/app-shell/nav-link";
import { SignOutButton } from "@/components/app-shell/sign-out-button";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/estimates", label: "Estimates" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/settings/billing", label: "Billing" },
];

type AppSidebarProps = {
  plan: string;
};

export function AppSidebar({ plan }: AppSidebarProps) {
  return (
    <aside className="w-full max-w-xs rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_32px_90px_-54px_rgba(15,23,42,0.5)] backdrop-blur lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <div className="space-y-6">
        <div className="space-y-4">
          <BrandMark className="w-full justify-start" />
          <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Plan
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-lg font-semibold text-foreground">{plan}</span>
              <Badge variant="secondary">MVP</Badge>
            </div>
          </div>
        </div>
        <Separator />
        <nav className="grid gap-2">
          {navigationItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <Separator />
        <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
          Free plan usage is enforced from server-side billing rules. Stripe checkout stays placeholder-only in this phase.
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
