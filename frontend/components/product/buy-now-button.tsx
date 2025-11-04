"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";

interface BuyNowButtonProps {
  productId: number;
}

export function BuyNowButton({ productId }: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleBuyNow() {
    setIsLoading(true);
    
    const result = await addToCart(productId, 1);
    
    if (result.success) {
      // Redirect to checkout page after adding to cart
      router.push("/checkout");
    } else {
      setIsLoading(false);
      // Show error message
      console.error(result.error);
      alert(result.error || "Failed to add item to cart");
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={handleBuyNow}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Buy now"}
    </Button>
  );
}
