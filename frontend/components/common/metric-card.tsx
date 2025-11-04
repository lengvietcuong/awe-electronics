interface MetricCardProps {
  value: string;
  label: string;
  helper?: string;
}

export function MetricCard({ value, label, helper }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-card p-6 shadow-sm">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {helper ? (
        <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
