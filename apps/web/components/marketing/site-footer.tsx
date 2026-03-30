export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>NLT Invoice is building a focused invoicing workflow for Canadian small businesses.</p>
        <p className="font-mono text-xs uppercase tracking-[0.24em]">
          English-first • CAD default • Public invoice links
        </p>
      </div>
    </footer>
  );
}
