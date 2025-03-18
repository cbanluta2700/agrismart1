"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash, ArrowLeft } from "lucide-react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent } from "@saasfly/ui/card";
import { Badge } from "@saasfly/ui/badge";
import { Separator } from "@saasfly/ui/separator";
import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { useProductStore } from "~/components/marketplace/store/product-store";
import type { Product } from "~/components/marketplace/types/product";

export default function WishlistPage() {
  const { 
    wishlist,
    removeFromWishlist,
    addToCart 
  } = useProductStore();
  
  // Format price for display
  const formatPrice = (price: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Wishlist"
        text="Products you've saved for later."
      />
      
      {wishlist.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((product: Product) => {
              // Get the primary image or a placeholder
              const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
              
              // Calculate the price
              const price = product.price.discountedPrice || product.price.amount;
              const hasDiscount = product.price.discountedPrice !== undefined;
              
              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        No image
                      </div>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove from wishlist</span>
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/dashboard/marketplace/products/${product.id}`}
                          className="font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                        
                        {product.isOrganic && (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-600">
                            Organic
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {formatPrice(price, product.price.currency)}
                        </span>
                        
                        {hasDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.price.amount, product.price.currency)}
                          </span>
                        )}
                      </div>
                      
                      <Button
                        className="mt-2 w-full"
                        onClick={() => {
                          addToCart(product);
                          removeFromWishlist(product.id);
                        }}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
          <EmptyPlaceholder.Icon name="Heart">
            <Heart className="h-8 w-8" />
          </EmptyPlaceholder.Icon>
          <EmptyPlaceholder.Title>Your wishlist is empty</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Products you save will appear here. Start adding some products to your wishlist!
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
    </DashboardShell>
  );
}
