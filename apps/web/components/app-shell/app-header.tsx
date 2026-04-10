import { Badge } from "@nlt-invoice/ui";

type AppHeaderProps = {
  companyName?: string | null;
  userName: string;
  hasCompletedOnboarding: boolean;
};

export function AppHeader({
  companyName,
  userName,
  hasCompletedOnboarding,
}: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-white/90 px-5 py-5 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.55)] md:flex-row md:items-center md:justify-between md:px-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Welcome back
        </p>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {companyName || "Finish setting up your business"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Signed in as {userName}. Keep invoices, customers, and payments in sync.
          </p>
        </div>
      </div>
      <Badge
        variant={hasCompletedOnboarding ? "secondary" : "destructive"}
        className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.12em]"
      >
        {hasCompletedOnboarding ? "Ready to invoice" : "Setup required"}
      </Badge>
    </header>
  );
}
