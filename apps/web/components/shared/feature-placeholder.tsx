import { Badge } from "@nlt-invoice/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nlt-invoice/ui";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  highlights: string[];
  badge?: string;
};

export function FeaturePlaceholder({
  title,
  description,
  highlights,
  badge = "Phase 1 skeleton",
}: FeaturePlaceholderProps) {
  return (
    <Card className="border-border/70 bg-card/85 shadow-[0_30px_80px_-48px_rgba(17,24,39,0.45)] backdrop-blur">
      <CardHeader className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          {badge}
        </Badge>
        <div className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 md:grid-cols-2">
          {highlights.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
