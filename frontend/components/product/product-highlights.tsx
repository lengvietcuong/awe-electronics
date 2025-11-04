import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ProductHighlight } from "@/lib/data/mock";

export interface ProductHighlightsProps {
  items: ProductHighlight[];
}

export function ProductHighlights({ items }: ProductHighlightsProps) {
  if (!items?.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((highlight) => (
        <Card key={highlight.title} className="h-full border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{highlight.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{highlight.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
