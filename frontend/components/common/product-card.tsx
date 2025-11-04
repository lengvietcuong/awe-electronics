"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  href = `/products/${id}`,
}: ProductCardProps) {
  const stockTone = stockStatus
    ? stockStatus.toLowerCase().includes("low")
      ? "text-amber-600"
      : stockStatus.toLowerCase().includes("pre")
        ? "text-blue-600"
        : "text-emerald-600"
    : "text-muted-foreground";

  return (
    <Card className="flex h-full flex-col border-border/80">
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
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">${price.toLocaleString()}</span>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3">
        {stockStatus ? (
          <span className={`text-sm font-medium ${stockTone}`}>{stockStatus}</span>
        ) : null}
        <Button asChild>
          <Link href={href}>
            View details <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <AddToCartButton productId={Number(id)} variant="outline" />
      </CardContent>
    </Card>
  );
}
