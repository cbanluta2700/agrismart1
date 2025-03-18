"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Separator } from "@saasfly/ui/separator";
import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { CartItem } from "~/components/marketplace/cart/cart-item";
import { useProductStore } from "~/components/marketplace/store/product-store";

export default function CartPage() {
  const { cart, getTotalCartPrice, clearCart } = useProductStore();
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };
  
  // Calculate subtotal
  const subtotal = getTotalCartPrice();
  
  // Example shipping cost - would be calculated based on location and products
  const shipping = cart.length > 0 ? 10 : 0;
  
  // Calculate total
  const total = subtotal + shipping;
  
  // Handle checkout - in a real app, this would navigate to checkout
  const handleCheckout = () => {
    alert("Proceeding to checkout! In a real implementation, this would navigate to the checkout page.");
    // Would navigate to checkout page with the cart data
  };
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Shopping Cart"
        text="Review your items and proceed to checkout."
      />
      
      <div className="grid gap-10 md:grid-cols-12">
        {/* Cart Items */}
        <div className="md:col-span-8">
          {cart.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Cart Items ({cart.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
              
              <div className="space-y-3">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              
              <div className="pt-4">
                <Link
                  href="/dashboard/marketplace/browse"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="shopping-cart">
                <ShoppingCart className="h-8 w-8" />
              </EmptyPlaceholder.Icon>
              <EmptyPlaceholder.Title>Your cart is empty</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                Looks like you haven&apos;t added any products to your cart yet.
              </EmptyPlaceholder.Description>
              <Link
                href="/dashboard/marketplace/browse"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse Products
              </Link>
            </EmptyPlaceholder>
          )}
        </div>
        
        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="md:col-span-4">
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-medium">Order Summary</h3>
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shipping</span>
                  <span className="font-medium">{formatPrice(shipping)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handleCheckout}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Checkout
              </Button>
              
              <p className="mt-4 text-center text-xs text-muted-foreground">
                By proceeding to checkout, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
