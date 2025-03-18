"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@saasfly/ui/card";
import { Badge } from "@saasfly/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";

import type { Product } from "./types/product";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  variant?: "default" | "compact" | "featured";
};

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  variant = "default",
}: ProductCardProps) {
  const {
    id,
    name,
    slug,
    shortDescription,
    price,
    images,
    rating,
    isOrganic,
    isFeatured,
  } = product;

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const discountPercentage = price.discountPercentage || 0;
  const hasDiscount = discountPercentage > 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  if (variant === "compact") {
    return (
      <Card className="h-full overflow-hidden transition-all hover:shadow-md group">
        <div className="relative aspect-square overflow-hidden">
          <Link href={`/dashboard/marketplace/products/${slug}`}>
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isOrganic && (
              <Badge className="bg-green-600 hover:bg-green-700">Organic</Badge>
            )}
            {isFeatured && (
              <Badge className="bg-amber-600 hover:bg-amber-700">Featured</Badge>
            )}
          </div>
        </div>
        <CardContent className="p-2">
          <h3 className="font-medium line-clamp-1 text-sm">
            <Link 
              href={`/dashboard/marketplace/products/${slug}`}
              className="hover:underline"
            >
              {name}
            </Link>
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              {hasDiscount ? (
                <>
                  <span className="font-bold text-green-600">
                    ${price.discountedPrice?.toFixed(2)}
                  </span>
                  <span className="text-xs line-through text-muted-foreground">
                    ${price.amount.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-bold">${price.amount.toFixed(2)}</span>
              )}
            </div>
            {rating && (
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-amber-500">★</span>
                <span>{rating.average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="h-full overflow-hidden transition-all hover:shadow-md">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 relative">
            <Link href={`/dashboard/marketplace/products/${slug}`}>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || name}
                width={200}
                height={200}
                className="object-cover rounded-l-lg h-full w-full"
              />
            </Link>
            {isOrganic && (
              <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700">
                Organic
              </Badge>
            )}
          </div>
          <div className="col-span-2 flex flex-col justify-between p-4">
            <div>
              <div className="flex justify-between items-start">
                <Link 
                  href={`/dashboard/marketplace/products/${slug}`}
                  className="hover:underline"
                >
                  <h3 className="font-semibold text-lg">{name}</h3>
                </Link>
                {isFeatured && (
                  <Badge className="bg-amber-600 hover:bg-amber-700">Featured</Badge>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2 mt-1 text-sm">
                {shortDescription}
              </p>
              {rating && (
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(rating.average)
                            ? "text-amber-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({rating.count})
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span className="font-bold text-lg text-green-600">
                      ${price.discountedPrice?.toFixed(2)}
                    </span>
                    <span className="text-sm line-through text-muted-foreground">
                      ${price.amount.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-lg">${price.amount.toFixed(2)}</span>
                )}
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddToWishlist}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add to Wishlist</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md group">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/dashboard/marketplace/products/${slug}`}>
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isOrganic && (
            <Badge className="bg-green-600 hover:bg-green-700">Organic</Badge>
          )}
          {isFeatured && (
            <Badge className="bg-amber-600 hover:bg-amber-700">Featured</Badge>
          )}
        </div>
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
            {price.discountPercentage}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium line-clamp-1">
            <Link 
              href={`/dashboard/marketplace/products/${slug}`}
              className="hover:underline"
            >
              {name}
            </Link>
          </h3>
          {rating && (
            <div className="flex items-center">
              <span className="text-amber-500 mr-1">★</span>
              <span>{rating.average.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground line-clamp-2 mt-1 text-sm">
          {shortDescription}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-lg text-green-600">
                ${price.discountedPrice?.toFixed(2)}
              </span>
              <span className="text-sm line-through text-muted-foreground">
                ${price.amount.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg">${price.amount.toFixed(2)}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" onClick={handleAddToWishlist}>
          <Heart className="h-4 w-4 mr-2" />
          Wishlist
        </Button>
        <Button size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
