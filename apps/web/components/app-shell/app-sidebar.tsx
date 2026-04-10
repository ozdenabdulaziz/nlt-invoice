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
  companyName?: string | null;
};

export function AppSidebar({ plan, companyName }: AppSidebarProps) {
  return (
    <aside className="w-full max-w-xs rounded-[1.75rem] border border-border/70 bg-white/90 p-5 shadow-[0_30px_84px_-58px_rgba(15,23,42,0.55)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <div className="flex h-full flex-col gap-6">
        <div className="space-y-5">
          <BrandMark className="w-full justify-start" />
          <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Company
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {companyName || "Your business"}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Current plan</span>
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.08em]"
              >
                {plan}
              </Badge>
            </div>
          </div>
        </div>
        <Separator />
        <nav className="grid gap-1.5">
          {navigationItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <Separator />
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            Stay on top of unpaid invoices by checking your invoice list and sending reminders regularly.
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
