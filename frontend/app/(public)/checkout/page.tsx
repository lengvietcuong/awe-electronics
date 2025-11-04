import { redirect } from "next/navigation";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";

import { CheckoutFlow, type CheckoutSubmissionPayload } from "@/components/checkout/checkout-flow";
import { clearCart, fetchCart } from "@/lib/api/cart";
import { fetchProducts } from "@/lib/api/products";
import { submitCheckout } from "@/lib/api/checkout";
import { getCurrentUserServer } from "@/lib/api/auth.server";
import { ApiError } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Checkout | AWE Electronics",
  description: "Complete your order with secure payment and delivery options tailored for Australian customers.",
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

export default async function CheckoutPage() {
  const cart = await loadCart();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  let currentUser = null;
  try {
    currentUser = await getCurrentUserServer();
    console.log("[Checkout] Current user loaded:", currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "null");
  } catch (error) {
    // User is not logged in or session expired
    console.log("[Checkout] Failed to load user:", error instanceof ApiError ? `${error.status} ${error.statusText}` : error);
    if (!(error instanceof ApiError && error.status === 401)) {
      console.error("Error fetching current user:", error);
    }
  }

  const [productResults] = await Promise.all([
    fetchProducts({ pageSize: 3 }).catch(() => ({ products: [] })),
  ]);

  const upsell = productResults.products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    href: `/products/${product.id}`,
  }));

  const cartMessages = [
    "Orders over $200 qualify for complimentary express shipping across Australia.",
    "Need tailored installation? Add a consultation at checkout to bundle professional services.",
  ];

  const supportMessages = [
    {
      title: "Need installation help?",
      description: "Add professional setup and calibration in the next step.",
      href: "/consultations",
    },
    {
      title: "GST invoice required?",
      description: "We issue ABN-compliant invoices instantly after payment.",
    },
  ];

  const shippingOptions = [
    {
      id: "EXPRESS",
      label: "Express courier",
      description: "Insured overnight delivery from Melbourne warehouse",
      eta: "Arrives in 1-2 business days",
      price: 0,
      recommended: true,
    },
    {
      id: "STANDARD",
      label: "Standard shipping",
      description: "2-4 business days via Australia Post",
      eta: "Arrives in 3-4 business days",
      price: 15,
    },
  ] as const;

  const paymentMethods = [
    {
      id: "CREDIT_CARD" as const,
      label: "Credit or debit card",
      hint: "Visa, Mastercard, and Amex accepted",
    },
    {
      id: "PAYPAL" as const,
      label: "PayPal",
      hint: "Checkout with your PayPal account",
    },
    {
      id: "BANK_TRANSFER" as const,
      label: "Bank transfer",
      hint: "EFT with 48-hour reservation",
    },
  ];

  async function placeOrder(payload: CheckoutSubmissionPayload) {
    "use server";

    if (!payload.contact.firstName || !payload.contact.lastName || !payload.contact.email) {
      return {
        success: false,
        message: "Please provide your name and email so we can confirm your order.",
      };
    }

    if (!payload.address.streetAddress || !payload.address.suburb || !payload.address.state || !payload.address.postcode) {
      return {
        success: false,
        message: "A complete delivery address is required to finalise your order.",
      };
    }

    if (payload.paymentMethod === "CREDIT_CARD") {
      if (!payload.cardDetails.cardNumber || !payload.cardDetails.cardExpiry || !payload.cardDetails.cardCvv) {
        return {
          success: false,
          message: "Please add your card number, expiry, and security code to continue.",
        };
      }
    }

    if (payload.paymentMethod === "PAYPAL" && !payload.cardDetails.paypalEmail) {
      return {
        success: false,
        message: "Enter your PayPal email so we can redirect you to complete payment.",
      };
    }

    try {
      const response = await submitCheckout({
        shipping_method: payload.shippingMethod === "EXPRESS" ? "EXPRESS" : "STANDARD",
        payment_method: payload.paymentMethod,
        guest_email: payload.contact.email,
        guest_first_name: payload.contact.firstName,
        guest_last_name: payload.contact.lastName,
        guest_phone: payload.contact.phone || undefined,
        delivery_address: {
          street_address: payload.address.streetAddress,
          suburb: payload.address.suburb,
          state: payload.address.state,
          postcode: payload.address.postcode,
          country: payload.address.country || "Australia",
          is_default: false,
        },
        card_number: payload.paymentMethod === "CREDIT_CARD" ? payload.cardDetails.cardNumber : undefined,
        card_expiry: payload.paymentMethod === "CREDIT_CARD" ? payload.cardDetails.cardExpiry : undefined,
        card_cvv: payload.paymentMethod === "CREDIT_CARD" ? payload.cardDetails.cardCvv : undefined,
        paypal_email: payload.paymentMethod === "PAYPAL" ? payload.cardDetails.paypalEmail : undefined,
      });

      try {
        await clearCart();
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 404)) {
          console.error("Failed to clear cart after checkout:", error);
        }
      }

      revalidatePath("/orders");
      revalidatePath("/", "layout");

      return {
        success: true,
        orderNumber: response.order_number,
        message: `Order ${response.order_number} placed successfully.`,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        const payloadDetail =
          typeof error.payload === "object" && error.payload !== null && "detail" in error.payload
            ? String((error.payload as { detail: unknown }).detail)
            : undefined;

        return {
          success: false,
          message: payloadDetail ?? "Checkout failed. Please review your details and try again.",
        };
      }

      throw error;
    }
  }

  return (
    <CheckoutFlow
      cartSummary={{
        subtotal: cart.subtotal,
        estimatedShipping: cart.estimated_shipping,
        estimatedTax: cart.estimated_tax,
        estimatedTotal: cart.estimated_total,
      }}
      cartMessages={cartMessages}
      upsell={upsell}
      supportMessages={supportMessages}
      shippingOptions={shippingOptions.map((option) => ({ ...option }))}
      paymentMethods={paymentMethods}
      onSubmit={placeOrder}
      currentUser={currentUser}
    />
  );
}
