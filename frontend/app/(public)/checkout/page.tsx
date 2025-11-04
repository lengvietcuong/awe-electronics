import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { CheckoutContactSection } from "@/components/checkout/checkout-contact";
import { CheckoutAddressSelector } from "@/components/checkout/checkout-address";
import { CheckoutShippingOptions } from "@/components/checkout/checkout-shipping";
import { CheckoutPaymentSection } from "@/components/checkout/checkout-payment";
import { CheckoutSupport } from "@/components/checkout/checkout-support";
import { CartSummaryPanel } from "@/components/cart/cart-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockCart, mockCheckout } from "@/lib/data/mock";

export const metadata: Metadata = {
  title: "Checkout | AWE Electronics",
  description: "Complete your order with secure payment and delivery options tailored for Australian customers.",
};

export default function CheckoutPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-3 text-sm text-muted-foreground">
        <Link href="/cart" className="inline-flex items-center gap-2 font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Return to cart
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Secure checkout</h1>
          <Badge variant="secondary" className="gap-2">
            <Lock className="h-3.5 w-3.5" /> AES-256 encrypted
          </Badge>
        </div>
        <p>Review your details, choose delivery, and confirm payment to finalise your order.</p>
        <CheckoutStepper currentStep={2} />
      </div>

      <div className="grid gap-10 xl:grid-cols-[1.5fr_0.5fr]">
        <div className="space-y-8">
          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">1. Contact details</CardTitle>
              <p className="text-sm text-muted-foreground">We&apos;ll keep you updated on delivery milestones and installation scheduling.</p>
            </CardHeader>
            <CardContent>
              <CheckoutContactSection contact={mockCheckout.contact} />
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">2. Delivery address</CardTitle>
              <p className="text-sm text-muted-foreground">Select where you&apos;d like us to ship or collect your order.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <CheckoutAddressSelector addresses={mockCheckout.addresses} />

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Shipping options</h3>
                <CheckoutShippingOptions options={mockCheckout.shippingOptions} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">3. Payment method</CardTitle>
              <p className="text-sm text-muted-foreground">Choose a payment method. You can save cards securely for future purchases.</p>
            </CardHeader>
            <CardContent>
              <CheckoutPaymentSection methods={mockCheckout.paymentMethods} />
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">4. Review &amp; confirm</CardTitle>
              <p className="text-sm text-muted-foreground">Select “Place order” to finalise. You&apos;ll receive an email confirmation instantly.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Order preferences</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Installation consult requested</li>
                  <li>Include calibration report and personalised onboarding</li>
                </ul>
              </div>
              <Button size="lg" className="w-full">
                Place order now
              </Button>
              <p className="text-xs text-muted-foreground">
                By placing this order, you agree to our terms of sale and privacy policy. We&apos;ll never charge you until you confirm.
              </p>
            </CardContent>
          </Card>

          <CheckoutSupport messages={mockCheckout.support} />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <CartSummaryPanel summary={mockCheckout.summary} messages={mockCart.messages} upsell={mockCart.upsell} />

          <Card className="border-border/80 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4" />
                Local support every step
              </div>
              <p>
                Need adjustments before we ship? Our Melbourne-based team can tweak builds, add peripherals, and coordinate onsite setup.
              </p>
              <Button variant="outline" asChild className="w-fit">
                <Link href="/support">Contact support</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Separator />

      <section className="rounded-2xl border border-border/80 bg-card p-6">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Questions about finance or bulk orders?</p>
            <p>
              Schedule a call with an AWE business consultant to access corporate pricing, net terms, and deployment services.
            </p>
          </div>
          <Button asChild>
            <Link href="/consultations">Talk to sales</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
