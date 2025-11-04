import { cn } from "@/lib/utils";

export interface KeyValueListProps {
  items: { label: string; value: string }[];
  columns?: 1 | 2;
  className?: string;
}

export function KeyValueList({ items, columns = 2, className }: KeyValueListProps) {
  if (!items?.length) return null;

  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4 text-sm text-muted-foreground",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="font-medium text-foreground">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
