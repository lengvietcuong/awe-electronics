import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  slug: string;
  name: string;
  description: string;
}

export function CategoryCard({ slug, name, description }: CategoryCardProps) {
  return (
    <Card className="group h-full border-border/80 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{description}</p>
        <Link
          href={`/products?category=${slug}`}
          className="inline-flex items-center text-sm font-medium text-primary"
        >
          Explore {name}
        </Link>
      </CardContent>
    </Card>
  );
}
