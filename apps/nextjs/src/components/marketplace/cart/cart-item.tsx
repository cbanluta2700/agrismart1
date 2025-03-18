"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import { useProductStore } from "~/components/marketplace/store/product-store";
import type { Product } from "~/components/marketplace/types/product";

interface CartItemProps {
  item: Product & { quantity: number };
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart } = useProductStore();

  // Get the primary image or a placeholder
  const primaryImage = item.images?.find((img) => img.isPrimary) || item.images?.[0];
  
  // Calculate the price
  const itemPrice = item.price.discountedPrice || item.price.amount;
  const totalPrice = itemPrice * item.quantity;
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: item.price.currency || "USD",
    }).format(price);
  };
  
  // Handle quantity changes
  const decrementQuantity = () => {
    if (item.quantity > 1) {
      updateCartItemQuantity(item.id, item.quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    updateCartItemQuantity(item.id, item.quantity + 1);
  };
  
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            No image
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/dashboard/marketplace/products/${item.id}`}
              className="text-sm font-medium hover:underline"
            >
              {item.name}
            </Link>
            
            {item.stock?.unit && (
              <p className="text-xs text-muted-foreground">
                Unit: {item.stock.unit}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => removeFromCart(item.id)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md"
              onClick={decrementQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            
            <div className="w-10 text-center text-sm">
              {item.quantity}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={incrementQuantity}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium">
              {formatPrice(totalPrice)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(itemPrice)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
