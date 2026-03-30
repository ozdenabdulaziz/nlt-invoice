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
    <header className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/85 px-5 py-5 shadow-[0_26px_70px_-50px_rgba(15,23,42,0.48)] backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          App shell
        </p>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {companyName || "Complete your company profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Signed in as {userName}. Dashboard routes are protected and company-scoped.
          </p>
        </div>
      </div>
      <Badge
        variant={hasCompletedOnboarding ? "secondary" : "destructive"}
        className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.18em]"
      >
        {hasCompletedOnboarding ? "Company ready" : "Setup required"}
      </Badge>
    </header>
  );
}
