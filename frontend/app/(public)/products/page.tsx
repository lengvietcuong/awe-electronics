import { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { MetricCard } from "@/components/common/metric-card";
import { ProductCard } from "@/components/common/product-card";
import { fetchProductCategories, fetchProducts } from "@/lib/api/products";
import { formatStockStatus } from "@/lib/formatters";

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

const priceRangeFilters = [
  { label: "Under $500", value: "under-500" },
  { label: "$500 - $1500", value: "500-1500" },
  { label: "$1500 - $3000", value: "1500-3000" },
  { label: "Above $3000", value: "above-3000" },
];

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export default async function ProductsPage() {
  const [productList, categories] = await Promise.all([
    fetchProducts({ pageSize: 60 }),
    fetchProductCategories(),
  ]);

  const products = productList.products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description ?? undefined,
    stockStatus: formatStockStatus(product.is_available, product.is_low_stock),
    href: `/products/${product.id}`,
  }));

  const filters = {
    categories: [
      { label: "All", value: "all" },
      ...categories.map((category) => ({ label: category, value: category })),
    ],
    priceRanges: priceRangeFilters,
    sort: sortOptions,
  };

  const inspirationProducts = products.slice(0, 3);

  return (
    <div className="space-y-14">
      <section>
        <CatalogueView products={products} filters={filters} />
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
          {inspirationProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
