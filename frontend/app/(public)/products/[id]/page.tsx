import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Package, ShieldCheck, Star, Truck } from "lucide-react";

import { ProductGallery } from "@/components/product/product-gallery";
import { KeyValueList } from "@/components/product/key-value-list";
import { ProductHighlights } from "@/components/product/product-highlights";
import { ProductCard } from "@/components/common/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import {
  DetailedProduct,
  detailedProducts,
} from "@/lib/data/mock";

interface ProductPageProps {
  params: {
    id: string;
  };
}

const quantityOptions = Array.from({ length: 5 }, (_, index) => index + 1);

const priceFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

function stockTone(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes("low")) return "text-amber-600";
  if (lower.includes("pre")) return "text-blue-600";
  if (lower.includes("out")) return "text-rose-600";
  return "text-emerald-600";
}

export function generateStaticParams() {
  return Object.keys(detailedProducts).map((id) => ({ id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = detailedProducts[params.id];

  if (!product) {
    return {
      title: "Product not found | AWE Electronics",
    };
  }

  return {
    title: `${product.name} | AWE Electronics`,
    description: product.summary,
  };
}

function ProductHero({ product }: { product: DetailedProduct }) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <ProductGallery images={product.gallery} name={product.name} />
      <div className="space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            {product.category}
          </Badge>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <span className={`text-2xl font-semibold sm:text-3xl`}>
              {priceFormatter.format(product.price)}
            </span>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">{product.summary}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {typeof product.rating === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
                {typeof product.reviews === "number" ? (
                  <span className="text-xs">({product.reviews.toLocaleString()} reviews)</span>
                ) : null}
              </span>
            ) : null}
            <span className={`font-medium ${stockTone(product.stockStatus)}`}>
              {product.stockStatus}
            </span>
          </div>
        </div>

        <Card className="border-border/80">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="quantity-select">
                Quantity
              </label>
              <Select id="quantity-select" className="w-32" defaultValue="1" aria-label="Select quantity">
                {quantityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1">Add to cart</Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/consultations">Book consultation</Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              {product.shipping.leadTime}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-primary/5">
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <BadgeCheck className="h-4 w-4" />
              Included 3-year premium onsite warranty
            </div>
            <p>{product.warranty}</p>
            <Link
              href="/support/warranty"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View warranty terms
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ProductDetails({ product }: { product: DetailedProduct }) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">Built for demanding workflows</h2>
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </div>
        <ProductHighlights items={product.highlights} />
      </div>
      <Card className="h-fit border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Technical specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueList items={product.specifications} />
        </CardContent>
      </Card>
    </section>
  );
}

function ProductExtras({ product }: { product: DetailedProduct }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">What&apos;s in the box</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {product.inTheBox.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Shipping &amp; services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{product.shipping.leadTime}</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {product.shipping.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
          {product.services?.length ? (
            <div className="space-y-3">
              <p className="font-medium text-foreground">Premium services</p>
              {product.services.map((service) => (
                <div key={service.title} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-sm font-medium text-foreground">{service.title}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = detailedProducts[params.id];

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-14">
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link href="/products" className="inline-flex items-center gap-2 font-medium text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to catalogue
          </Link>
        </div>
        <p>Home / Products / {product.name}</p>
      </div>

      <ProductHero product={product} />

      <Separator />

      <ProductDetails product={product} />

      <Separator />

      <ProductExtras product={product} />

      {product.relatedProducts?.length ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Recommended accessories</h2>
              <p className="text-sm text-muted-foreground">
                Pair your setup with gear curated by AWE specialists.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">View all products</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {product.relatedProducts.map((related) => (
              <ProductCard key={related.id} {...related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
