import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Gift, ShieldCheck } from "lucide-react";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummaryPanel } from "@/components/cart/cart-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchCart } from "@/lib/api/cart";
import { fetchProductById, fetchProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { formatStockStatus } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Shopping Cart | AWE Electronics",
  description: "Review your selected products before heading to checkout.",
};

async function loadCart() {
  try {
    return await fetchCart();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export default async function CartPage() {
  const cart = await loadCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/products" className="inline-flex items-center gap-2 font-medium text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to catalogue
          </Link>
        </div>
        <Card className="border-border/80">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
            <Gift className="h-10 w-10 text-primary" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Your cart is empty</h1>
              <p className="text-sm">
                Browse the latest arrivals and add items to see them here.
              </p>
            </div>
            <Button asChild>
              <Link href="/products">Shop products</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const productDetails = await Promise.all(
    items.map(async (item) => {
      try {
        const product = await fetchProductById(item.product_id);
        return product;
      } catch {
        return null;
      }
    }),
  );

  const productMap = new Map<number, typeof productDetails[number]>();
  productDetails.forEach((product) => {
    if (product) {
      productMap.set(product.id, product);
    }
  });

  const cartItems = items.map((item) => {
    const product = productMap.get(item.product_id);
    return {
      id: item.id,
      productId: item.product_id,
      name: product?.name ?? item.product_name,
      unitPrice: item.product_price,
      quantity: item.quantity,
      category: product?.category,
      imageUrl: product?.image_url,
      stockStatus: product ? formatStockStatus(product.is_available, product.is_low_stock) : undefined,
      availabilityMessage: product?.is_available
        ? "Dispatches within 24 hours"
        : "Currently unavailable",
      href: `/products/${item.product_id}`,
    };
  });

  const [highlightProducts] = await Promise.all([
    fetchProducts({ pageSize: 3 }).catch(() => ({ products: [] })),
  ]);

  const upsell = highlightProducts.products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    href: `/products/${product.id}`,
  }));

  const helpfulMessages = [
    "Orders over $200 qualify for complimentary express shipping across Australia.",
    "Need tailored installation? Add a consultation at checkout to bundle professional services.",
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2 text-sm text-muted-foreground">
        <Link href="/products" className="inline-flex items-center gap-2 font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your cart</h1>
        <p>Review your selection, adjust quantities, and proceed to checkout.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Items ({cartItems.length})</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                Secure checkout with bank-level protection
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {cartItems.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4" />
                Trusted by thousands of Australian households and businesses
              </div>
              <p>
                Checkout now to lock in pricing and availability. Our specialists can add installation services during the next step.
              </p>
              <Button variant="outline" asChild className="w-fit">
                <Link href="/consultations">Book installation consult</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <aside className="lg:sticky lg:top-28">
          <CartSummaryPanel
            summary={{
              subtotal: cart?.subtotal ?? 0,
              estimatedShipping: cart?.estimated_shipping ?? 0,
              estimatedTax: cart?.estimated_tax ?? 0,
              estimatedTotal: cart?.estimated_total ?? 0,
            }}
            messages={helpfulMessages}
            upsell={upsell}
          />
        </aside>
      </div>

      <Separator />

      <section className="rounded-2xl border border-border/80 bg-card p-6">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Need help finishing your order?</p>
            <p>Call our Melbourne team on <a href="tel:+61355501234" className="text-primary">(03) 5550 1234</a> or chat live with a product specialist.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/support">Contact support</Link>
            </Button>
            <Button asChild>
              <Link href="/checkout">Go to checkout</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
