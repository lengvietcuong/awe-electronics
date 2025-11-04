"use client";

import * as React from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ProductCard, ProductCardProps } from "@/components/common/product-card";

type CatalogueProduct = ProductCardProps;

type FilterOption = { label: string; value: string };

type CatalogueFilterConfig = {
  categories: FilterOption[];
  priceRanges: FilterOption[];
  sort: FilterOption[];
};

function priceMatches(range: string, price: number) {
  switch (range) {
    case "under-500":
      return price < 500;
    case "500-1500":
      return price >= 500 && price <= 1500;
    case "1500-3000":
      return price > 1500 && price <= 3000;
    case "above-3000":
      return price > 3000;
    default:
      return true;
  }
}

function sortProducts(products: CatalogueProduct[], sort: string) {
  const next = [...products];
  switch (sort) {
    case "price-asc":
      return next.sort((a, b) => a.price - b.price);
    case "price-desc":
      return next.sort((a, b) => b.price - a.price);
    case "rating":
      return next.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "newest":
      return next.sort((a, b) => Number(b.id) - Number(a.id));
    default:
      return next;
  }
}

interface CatalogueViewProps {
  products: CatalogueProduct[];
  filters: CatalogueFilterConfig;
}

export function CatalogueView({ products, filters }: CatalogueViewProps) {
  const [category, setCategory] = React.useState(filters.categories[0]?.value ?? "all");
  const [priceRange, setPriceRange] = React.useState<string>("");
  const [sort, setSort] = React.useState(filters.sort[0]?.value ?? "recommended");

  const filteredProducts = React.useMemo(() => {
    const categoryFiltered = products.filter((product) => {
      if (category === "all") return true;
      return product.category === category;
    });

    const priceFiltered = categoryFiltered.filter((product) =>
      priceMatches(priceRange, product.price),
    );

    return sortProducts(priceFiltered, sort);
  }, [category, priceRange, sort, products]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/80 bg-card p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit">
              <Filter className="mr-1.5 h-4 w-4" /> Shop by category
            </Badge>
            <h1 className="text-3xl font-semibold text-foreground">Product catalogue</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Browse curated gear for workspaces, studios, and smart homes. Filter by category, price, and popularity to
              build the perfect shortlist.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground md:items-end">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Personalised recommendations launch soon
            </div>
            <p>Log in to save carts and sync with your consultant.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.categories.map((option) => (
            <Button
              key={option.value}
              variant={category === option.value ? "default" : "outline"}
              onClick={() => setCategory(option.value)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of {products.length} products
        </p>
        <div className="flex flex-wrap gap-3">
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="w-48"
            aria-label="Sort products"
          >
            {filters.sort.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
            className="w-48"
            aria-label="Filter by price range"
          >
            <option value="">Any price</option>
            {filters.priceRanges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <SlidersHorizontal className="h-8 w-8" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">No matches just yet</h2>
              <p className="text-sm">
                Try adjusting your filters or exploring another category to discover more gear.
              </p>
            </div>
            <Button variant="outline" onClick={() => setPriceRange("")}>Clear price filter</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
