import * as React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {icon ? <span className="text-primary">{icon}</span> : null}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
