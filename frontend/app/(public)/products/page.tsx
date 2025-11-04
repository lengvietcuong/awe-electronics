import { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { MetricCard } from "@/components/common/metric-card";
import { ProductCard } from "@/components/common/product-card";
import {
  catalogueFilters,
  catalogueProducts,
  featuredProducts,
} from "@/lib/data/mock";

export const metadata: Metadata = {
  title: "Product Catalogue | AWE Electronics",
  description:
    "Browse computing, audio, smart home, and gaming gear curated by AWE Electronics specialists.",
};

const catalogueMetrics = [
  {
    value: "24 hrs",
    label: "Average dispatch",
    helper: "Orders leave our Melbourne warehouse within a day.",
  },
  {
    value: "98%",
    label: "Stock accuracy",
    helper: "Real-time inventory synced every 15 minutes.",
  },
  {
    value: "1.9k",
    label: "Verified reviews",
    helper: "Powered by customers across Australia.",
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-14">
      <section>
        <CatalogueView products={catalogueProducts} filters={catalogueFilters} />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Why shop the AWE catalogue?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {catalogueMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Need inspiration? Start here</h2>
            <p className="text-sm text-muted-foreground">
              Top-rated picks across computing, entertainment, and smart home categories this week.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
