import React, { useState } from "react";
import Image from "next/image";
import { Star, Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { Product } from "~/types/product";
import { Button } from "@saasfly/ui/button";
import PreviewSlider from "../Common/PreviewSlider";

interface ProductDetailProps {
  product: Product;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);

  const handleIncrease = () => {
    if (quantity < (product.stock ?? 0)) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // Implement cart functionality
    console.log("Added to cart:", product.title, "Quantity:", quantity);
  };

  const handleAddToWishlist = () => {
    // Implement wishlist functionality
    console.log("Added to wishlist:", product.title);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Product Images */}
      <div className="relative">
        {product.imgs?.previews && product.imgs.previews.length > 0 ? (
          <>
            <div className="mb-6 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.imgs.previews[activeImage] || "/images/products/placeholder.png"}
                alt={product.title}
                width={600}
                height={600}
                className="h-auto w-full object-cover transition-all hover:scale-105"
              />
            </div>
            <div className="flex space-x-2">
              {product.imgs.thumbnails?.map((img, index) => (
                <div
                  key={index}
                  className={`cursor-pointer overflow-hidden rounded-md border-2 ${
                    activeImage === index ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img || "/images/products/placeholder-sm.png"}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-100">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.title}</h1>
        
        <div className="mb-4 flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.reviews / 10)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            ({product.reviews} reviews)
          </span>
        </div>

        <div className="mb-6 flex items-center">
          {product.discountedPrice && product.discountedPrice < product.price ? (
            <>
              <span className="text-2xl font-bold text-primary">
                ${product.discountedPrice.toFixed(2)}
              </span>
              <span className="ml-2 text-lg text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-700">{product.description}</p>
        </div>

        <div className="mb-4 flex items-center">
          <span className="text-gray-700">Availability:</span>
          <span className={`ml-2 ${(product.stock ?? 0) > 0 ? "text-green-600" : "text-red-600"}`}>
            {(product.stock ?? 0) > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </span>
        </div>

        <div className="mb-4 flex items-center">
          <span className="text-gray-700">Seller:</span>
          <span className="ml-2 text-gray-900">{product.seller?.name}</span>
        </div>

        <div className="mb-4 flex items-center">
          <span className="text-gray-700">Category:</span>
          <span className="ml-2 text-gray-900">{product.category}</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-1">
          <span className="text-gray-700">Tags:</span>
          {product.tags?.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-6 flex items-center">
          <span className="mr-4 text-gray-700">Quantity:</span>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="h-8 w-8 rounded-l-md rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="flex h-8 w-12 items-center justify-center border border-input bg-white text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrease}
              disabled={quantity >= (product.stock ?? 0)}
              className="h-8 w-8 rounded-l-none rounded-r-md"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleAddToCart}
            disabled={(product.stock ?? 0) <= 0}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAddToWishlist}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Add to Wishlist
          </Button>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <div className="mb-6 flex border-b">
            <button
              className={`pb-2 text-sm font-medium ${
                activeTab === "description"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`ml-8 pb-2 text-sm font-medium ${
                activeTab === "reviews"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({product.reviews})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "description" && (
              <div>
                <p className="text-gray-700">
                  {product.description}
                </p>
                <ul className="mt-4 list-inside list-disc text-gray-700">
                  <li className="mb-1">Premium quality product</li>
                  <li className="mb-1">Sustainably sourced</li>
                  <li className="mb-1">Ideal for agricultural use</li>
                  <li className="mb-1">Trusted by farmers</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <p className="text-gray-700">
                  Customer reviews will be implemented in a future update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
