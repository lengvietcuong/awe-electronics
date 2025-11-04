"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";

interface AddToCartButtonProps {
  productId: number;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({ 
  productId, 
  variant = "default",
  size = "default",
  className,
  showIcon = true,
  children = "Add to cart"
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAddToCart() {
    setIsLoading(true);
    
    const result = await addToCart(productId, 1);
    
    setIsLoading(false);
    
    if (result.success) {
      // Optionally show a success message
      router.refresh();
    } else {
      // Optionally show an error message
      console.error(result.error);
      alert(result.error || "Failed to add item to cart");
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
      {isLoading ? "Adding..." : children}
    </Button>
  );
}
