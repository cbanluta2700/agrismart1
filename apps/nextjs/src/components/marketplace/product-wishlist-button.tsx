"use client";

import { Heart } from "lucide-react";
import { Button } from "@saasfly/ui/button";
import { toast } from "sonner";
import { useProductStore } from "./store/product-store";

interface ProductWishlistButtonProps {
  product: any; // Using any for now to avoid type conflicts
  variant?: "default" | "sm" | "icon";
}

export function ProductWishlistButton({ 
  product,
  variant = "default" 
}: ProductWishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, wishlist } = useProductStore();
  
  // Check if the product is already in wishlist
  const isInWishlist = wishlist.some(item => item.id === product.id);
  
  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist", {
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist", {
        description: `${product.name} has been added to your wishlist.`,
        action: {
          label: "View Wishlist",
          onClick: () => window.location.href = "/dashboard/marketplace/wishlist",
        },
      });
    }
  };
  
  if (variant === "icon") {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full"
        onClick={handleToggleWishlist}
      >
        <Heart 
          className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} 
        />
        <span className="sr-only">
          {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        </span>
      </Button>
    );
  }
  
  if (variant === "sm") {
    return (
      <Button
        size="sm"
        variant={isInWishlist ? "destructive" : "secondary"}
        className="flex items-center gap-1"
        onClick={handleToggleWishlist}
      >
        <Heart className={`mr-1 h-3 w-3 ${isInWishlist ? "fill-current" : ""}`} />
        {isInWishlist ? "Remove" : "Wishlist"}
      </Button>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="icon"
      className={isInWishlist ? "border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700" : ""}
      onClick={handleToggleWishlist}
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  );
}
