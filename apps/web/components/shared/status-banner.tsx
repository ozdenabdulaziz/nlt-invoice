import { cn } from "@/lib/utils";

type StatusBannerProps = {
  message?: string;
  tone?: "error" | "success";
};

export function StatusBanner({
  message,
  tone = "error",
}: StatusBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-destructive/20 bg-destructive/8 text-destructive"
          : "border-primary/20 bg-primary/6 text-primary",
      )}
    >
      {message}
    </div>
  );
}
