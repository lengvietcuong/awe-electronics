import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Package, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/common/product-card";
import { KeyValueList } from "@/components/product/key-value-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchProductById, fetchProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { formatStockStatus } from "@/lib/formatters";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

const priceFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function loadProduct(productId: number) {
  try {
    return await fetchProductById(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return {
      title: "Product not found | AWE Electronics",
    };
  }

  try {
    const product = await fetchProductById(productId);
    return {
      title: `${product.name} | AWE Electronics`,
      description: product.description ?? `Explore ${product.name} from AWE Electronics.`,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        title: "Product not found | AWE Electronics",
      };
    }

    throw error;
  }
}

function parseSpecifications(specifications: string | null) {
  if (!specifications) return [];

  return specifications
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    notFound();
  }

  const product = await loadProduct(productId);
  const statusLabel = formatStockStatus(product.is_available, product.is_low_stock);
  const specs = parseSpecifications(product.specifications);

  const detailItems = [
    { label: "Brand", value: product.brand ?? "—" },
    { label: "Model", value: product.model_number ?? "—" },
    { label: "Category", value: product.category },
    { label: "Available units", value: `${product.available_quantity}` },
    { label: "Total stock", value: `${product.stock_quantity}` },
  ];

  const relatedResponse = await fetchProducts({
    category: product.category,
    pageSize: 4,
  });

  const relatedProducts = relatedResponse.products
    .filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description ?? undefined,
      stockStatus: formatStockStatus(item.is_available, item.is_low_stock),
      imageUrl: item.image_url,
      href: `/products/${item.id}`,
    }));

  return (
    <div className="space-y-12">
      <div className="space-y-2 text-sm text-muted-foreground">
        <Link href="/products" className="inline-flex items-center gap-2 font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
        <Badge variant="secondary" className="w-fit">
          {product.category}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
        {product.description ? <p className="max-w-2xl text-base">{product.description}</p> : null}
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/80">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 540px, 100vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Image coming soon
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">
                  {priceFormatter.format(product.price)}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{statusLabel}</span>
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-4 w-4" /> Ships from Melbourne warehouse
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4" /> Local warranty included
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <AddToCartButton productId={product.id} size="lg" className="w-full" />
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/checkout">Buy now</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Need help before buying? Call our specialists on{" "}
                  <a href="tel:+61355501234" className="text-primary">
                    (03) 5550 1234
                  </a>{" "}
                  or book a consultation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-primary/5">
            <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4" /> Delivery promise
              </div>
              <p>
                We dispatch within 24 hours on business days. Express courier upgrades and installation services are
                available at checkout.
              </p>
              <div className="inline-flex items-center gap-2 text-primary">
                <Package className="h-4 w-4" /> Free click &amp; collect available
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Key details</CardTitle>
          </CardHeader>
          <CardContent>
            <KeyValueList items={detailItems} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            {specs.length ? (
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {specs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Detailed specifications will be added shortly.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {relatedProducts.length ? (
        <>
          <Separator />
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">You might also like</h2>
                <p className="text-sm text-muted-foreground">
                  More {product.category.toLowerCase()} picks curated for Australian homes and offices.
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} {...related} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
