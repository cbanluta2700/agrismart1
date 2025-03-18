"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { Button } from "@saasfly/ui/button";
import { toast } from "sonner";
import { useProductStore } from "./store/product-store";

interface ProductCartButtonProps {
  product: any; // Using any for now to avoid type conflicts
  initialQuantity?: number;
  variant?: "default" | "sm" | "icon";
}

export function ProductCartButton({ 
  product, 
  initialQuantity = 1,
  variant = "default" 
}: ProductCartButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, cart } = useProductStore();
  
  // Check if the product is already in the cart
  const existingItem = cart.find(item => item.id === product.id);
  
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate API call or processing delay
    setTimeout(() => {
      addToCart(product, quantity);
      
      toast.success("Added to cart", {
        description: `${product.name} (${quantity} ${quantity > 1 ? "items" : "item"}) has been added to your cart.`,
        action: {
          label: "View Cart",
          onClick: () => window.location.href = "/dashboard/marketplace/cart",
        },
      });
      
      setIsAdding(false);
      
      // Reset quantity to 1 after adding to cart
      if (variant !== "sm") {
        setQuantity(1);
      }
    }, 600);
  };
  
  if (variant === "icon") {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full"
        onClick={() => {
          addToCart(product, 1);
          toast.success("Added to cart");
        }}
        disabled={isAdding || product.stock <= 0}
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="sr-only">Add to cart</span>
      </Button>
    );
  }
  
  if (variant === "sm") {
    return (
      <Button
        size="sm"
        className="flex items-center gap-1"
        onClick={handleAddToCart}
        disabled={isAdding || product.stock <= 0}
      >
        {isAdding ? (
          <Check className="mr-1 h-3 w-3 animate-pulse" />
        ) : (
          <ShoppingCart className="mr-1 h-3 w-3" />
        )}
        Add to Cart
      </Button>
    );
  }
  
  return (
    <div className="flex w-full flex-col gap-2">
      {!existingItem && (
        <div className="flex items-center">
          <span className="mr-4">Quantity:</span>
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isAdding}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="w-12 text-center">{quantity}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= (product.stock || 99) || isAdding}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      
      <Button 
        className={existingItem ? "bg-green-600 hover:bg-green-700" : ""}
        onClick={handleAddToCart}
        disabled={isAdding || product.stock <= 0}
      >
        {isAdding ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Adding...
          </>
        ) : existingItem ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Update Cart ({existingItem.quantity + quantity})
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
      
      {product.stock <= 0 && (
        <p className="text-sm text-destructive">
          This product is currently out of stock.
        </p>
      )}
    </div>
  );
}
