import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Gift, ShieldCheck } from "lucide-react";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummaryPanel } from "@/components/cart/cart-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockCart } from "@/lib/data/mock";

export const metadata: Metadata = {
  title: "Shopping Cart | AWE Electronics",
  description: "Review your selected products before heading to checkout.",
};

export default function CartPage() {
  const hasItems = mockCart.items.length > 0;

  if (!hasItems) {
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
              <CardTitle className="text-lg">Items ({mockCart.items.length})</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                Secured checkout with AES-256 encryption
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockCart.items.map((item) => (
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
            summary={mockCart.summary}
            messages={mockCart.messages}
            upsell={mockCart.upsell}
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
