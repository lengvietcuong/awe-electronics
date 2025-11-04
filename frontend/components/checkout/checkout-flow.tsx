"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

import { CartSummaryPanel, type CartSummaryData, type UpsellProduct } from "@/components/cart/cart-summary";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { CheckoutAddressSelector, type CheckoutAddressForm } from "@/components/checkout/checkout-address";
import { CheckoutContactSection, type CheckoutContactForm } from "@/components/checkout/checkout-contact";
import { CheckoutPaymentSection, type CardDetails, type PaymentMethodId, type PaymentMethodOption } from "@/components/checkout/checkout-payment";
import { CheckoutShippingOptions, type ShippingOption } from "@/components/checkout/checkout-shipping";
import { CheckoutSupport, type CheckoutSupportMessage } from "@/components/checkout/checkout-support";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export interface CheckoutSubmissionPayload {
  contact: CheckoutContactForm;
  address: CheckoutAddressForm;
  shippingMethod: ShippingOption["id"];
  paymentMethod: PaymentMethodId;
  cardDetails: CardDetails;
  notes?: string;
}

export interface CheckoutFlowProps {
  cartSummary: CartSummaryData;
  cartMessages: string[];
  upsell: UpsellProduct[];
  supportMessages: CheckoutSupportMessage[];
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethodOption[];
  onSubmit: (payload: CheckoutSubmissionPayload) => Promise<{ success: boolean; orderNumber?: string; message?: string }>;
}

const EMPTY_CONTACT: CheckoutContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  marketingOptIn: false,
};

const EMPTY_ADDRESS: CheckoutAddressForm = {
  streetAddress: "",
  suburb: "",
  state: "",
  postcode: "",
  country: "Australia",
  instructions: "",
};

const EMPTY_CARD: CardDetails = {
  cardHolder: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  paypalEmail: "",
};

export function CheckoutFlow({
  cartSummary,
  cartMessages,
  upsell,
  supportMessages,
  shippingOptions,
  paymentMethods,
  onSubmit,
}: CheckoutFlowProps) {
  const [contact, setContact] = React.useState<CheckoutContactForm>(EMPTY_CONTACT);
  const [address, setAddress] = React.useState<CheckoutAddressForm>(EMPTY_ADDRESS);
  const [shippingMethod, setShippingMethod] = React.useState<ShippingOption["id"]>(shippingOptions[0]?.id ?? "STANDARD");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodId>(paymentMethods[0]?.id ?? "CREDIT_CARD");
  const [cardDetails, setCardDetails] = React.useState<CardDetails>(EMPTY_CARD);
  const [orderNotes, setOrderNotes] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = () => {
    setError(null);
    setFeedback(null);

    const payload: CheckoutSubmissionPayload = {
      contact,
      address,
      shippingMethod,
      paymentMethod,
      cardDetails,
      notes: orderNotes || undefined,
    };

    startTransition(async () => {
      try {
        const result = await onSubmit(payload);
        if (result.success) {
          setFeedback({ success: true, message: result.message ?? "Order placed successfully." });
        } else {
          setError(result.message ?? "We couldn’t complete your checkout. Please try again.");
        }
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Unexpected error placing order.";
        setError(message);
      }
    });
  };

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
              <CheckoutContactSection value={contact} onChange={setContact} />
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">2. Delivery address</CardTitle>
              <p className="text-sm text-muted-foreground">Select where you&apos;d like us to ship or collect your order.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <CheckoutAddressSelector value={address} onChange={setAddress} />

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Shipping options</h3>
                <CheckoutShippingOptions options={shippingOptions} value={shippingMethod} onChange={setShippingMethod} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">3. Payment method</CardTitle>
              <p className="text-sm text-muted-foreground">Choose a payment method. You can save cards securely for future purchases.</p>
            </CardHeader>
            <CardContent>
              <CheckoutPaymentSection
                methods={paymentMethods}
                value={paymentMethod}
                onChange={setPaymentMethod}
                cardDetails={cardDetails}
                onCardDetailsChange={setCardDetails}
              />
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">4. Review &amp; confirm</CardTitle>
              <p className="text-sm text-muted-foreground">Select “Place order” to finalise. You&apos;ll receive an email confirmation instantly.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="order-notes" className="text-sm font-medium text-foreground">
                  Order notes (optional)
                </label>
                <Input
                  id="order-notes"
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder="Leave instructions for our fulfilment team"
                />
              </div>
              <Button size="lg" className="w-full" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Placing order…" : "Place order now"}
              </Button>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {feedback ? <p className="text-sm text-emerald-600">{feedback.message}</p> : null}
              <p className="text-xs text-muted-foreground">
                By placing this order, you agree to our terms of sale and privacy policy. We&apos;ll never charge you until you confirm.
              </p>
            </CardContent>
          </Card>

          <CheckoutSupport messages={supportMessages} />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <CartSummaryPanel summary={cartSummary} messages={cartMessages} upsell={upsell} />

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
            <p>Schedule a call with an AWE business consultant to access corporate pricing, net terms, and deployment services.</p>
          </div>
          <Button asChild>
            <Link href="/consultations">Talk to sales</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
