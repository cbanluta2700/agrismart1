"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "~/types/product";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";

interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  // Replace Redux actions with simple state handlers
  const handleQuickView = () => {
    console.log("Quick view:", product.title);
    // Implement quick view functionality here
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", product.title);
    // Implement add to cart functionality here
  };

  const handleAddToWishlist = () => {
    console.log("Added to wishlist:", product.title);
    // Implement add to wishlist functionality here
  };

  return (
    <div className="group">
      <div className="relative flex min-h-[270px] items-center justify-center overflow-hidden rounded-lg bg-[#F6F7FB] mb-4">
        {product.imgs?.previews && product.imgs.previews.length > 0 ? (
          <Image 
            src={product.imgs.previews[0] || "/images/products/placeholder.png"} 
            alt={product.title} 
            width={250} 
            height={250}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-[250px] w-[250px] items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full translate-y-full flex items-center justify-center gap-2.5 pb-5 duration-200 ease-linear group-hover:translate-y-0">
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-white text-primary shadow-md transition-colors hover:bg-primary hover:text-white"
          >
            <Eye className="h-5 w-5" />
          </button>

          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-white text-primary shadow-md transition-colors hover:bg-primary hover:text-white"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          <button
            onClick={handleAddToWishlist}
            aria-label="Add to wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-white text-primary shadow-md transition-colors hover:bg-primary hover:text-white"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.reviews / 10)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-500">({product.reviews})</p>
      </div>

      <h3 className="mb-1.5 font-medium text-gray-900 duration-200 ease-out hover:text-primary">
        <Link href={`/marketplace/product/${product.id}`}>{product.title}</Link>
      </h3>

      <span className="flex items-center gap-2 text-lg font-medium">
        <span className="text-primary">
          ${product.discountedPrice ? product.discountedPrice.toFixed(2) : product.price.toFixed(2)}
        </span>
        {product.discountedPrice && product.discountedPrice < product.price && (
          <span className="text-gray-400 line-through">${product.price.toFixed(2)}</span>
        )}
      </span>
    </div>
  );
};

export default ProductItem;
