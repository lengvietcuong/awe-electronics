import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export interface CartSummaryData {
  subtotal: number;
  estimatedShipping: number;
  estimatedTax: number;
  estimatedTotal: number;
  savings?: number;
}

export interface UpsellProduct {
  id: number | string;
  name: string;
  description?: string;
  href?: string;
}

export interface CartSummaryProps {
  summary: CartSummaryData;
  messages?: string[];
  upsell?: UpsellProduct[];
}

export function CartSummaryPanel({ summary, messages, upsell }: CartSummaryProps) {
  const shippingDisplay = summary.estimatedShipping === 0 ? "Free" : formatter.format(summary.estimatedShipping);

  return (
    <div className="space-y-6">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between text-foreground">
              <span>Subtotal</span>
              <span>{formatter.format(summary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{shippingDisplay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>GST</span>
              <span>{formatter.format(summary.estimatedTax)}</span>
            </div>
            {summary.savings ? (
              <div className="flex items-center justify-between text-emerald-600">
                <span>Savings</span>
                <span>-{formatter.format(summary.savings)}</span>
              </div>
            ) : null}
          </div>
          <Separator />
          <div className="flex items-center justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatter.format(summary.estimatedTotal)}</span>
          </div>
          <Button size="lg" className="w-full" asChild>
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>

      {messages && messages.length ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
            {messages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {upsell && upsell.length ? (
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Enhance your setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {upsell.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  {product.description ? <p>{product.description}</p> : null}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={product.href ?? "/products"}>View</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
