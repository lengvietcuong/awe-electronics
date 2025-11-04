"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

export interface ProductCardProps {
  id: number | string;
  name: string;
  category: string;
  price: number;
  description?: string;
  badge?: string;
  href?: string;
  stockStatus?: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string | null;
}

export function ProductCard({
  id,
  name,
  category,
  price,
  description,
  badge,
  stockStatus,
  rating,
  reviews,
  imageUrl,
  href = `/products/${id}`,
}: ProductCardProps) {
  const router = useRouter();
  const stockTone = stockStatus
    ? stockStatus.toLowerCase().includes("low")
      ? "text-amber-600"
      : stockStatus.toLowerCase().includes("pre")
        ? "text-blue-600"
        : "text-emerald-600"
    : "text-muted-foreground";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the Add to Cart button
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    router.push(href);
  };

  return (
    <Card 
      className="flex h-full flex-col border-border/80 cursor-pointer transition-shadow hover:shadow-md" 
      onClick={handleCardClick}
    >
      {imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg border-b border-border/80 bg-muted">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      ) : null}
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {category}
          </p>
          <CardTitle>{name}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {typeof rating === "number" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
              {typeof reviews === "number" ? (
                <span>({reviews.toLocaleString()} reviews)</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">${price.toLocaleString()}</span>
            {stockStatus ? (
              <span className={`text-sm font-medium ${stockTone}`}>{stockStatus}</span>
            ) : null}
          </div>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3">
        <AddToCartButton productId={Number(id)} variant="default" />
      </CardContent>
    </Card>
  );
}
