import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, ShoppingBag, Star, Truck, ShieldCheck, Leaf } from "lucide-react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Separator } from "@saasfly/ui/separator";
import { Badge } from "@saasfly/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import { ProductCartButton } from "~/components/marketplace/product-cart-button";
import { ProductWishlistButton } from "~/components/marketplace/product-wishlist-button";
import { db } from "@saasfly/db";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";

import type { Product } from "~/components/marketplace/types/product";

export const metadata = {
  title: "Product Details",
};

interface ProductReview {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export default async function ProductDetailPage({
  params: { lang, slug },
}: {
  params: {
    lang: Locale;
    slug: string;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Fetch the product by slug
  const productData = await db.product.findFirst({
    where: {
      slug: slug,
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });
  
  // If product doesn't exist
  if (!productData) {
    notFound();
  }
  
  // Transform the product data to match our Product type
  const product: Product = {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    description: productData.description,
    shortDescription: productData.shortDescription || "",
    sellerId: productData.sellerId,
    sellerName: productData.seller.name,
    category: {
      id: productData.category.id,
      name: productData.category.name,
      slug: productData.category.slug,
    },
    categoryId: productData.categoryId,
    price: {
      amount: parseFloat(productData.price?.toString() || "0"),
      currency: "USD",
      discountedPrice: productData.discount 
        ? parseFloat(productData.price?.toString() || "0") * (1 - (productData.discount / 100))
        : undefined
    },
    stock: productData.stock || 0,
    images: productData.images as string[] || [],
    rating: {
      average: productData.reviews.length > 0
        ? productData.reviews.reduce((acc: number, review: ProductReview) => acc + review.rating, 0) / productData.reviews.length
        : 0,
      count: productData.reviews.length || 0,
    },
    features: productData.features as string[] || [],
    specifications: productData.specifications as Record<string, string> || {},
    tags: productData.tags as string[] || [],
    isFeatured: productData.isFeatured || false,
    isOrganic: productData.isOrganic || false,
    cultivationMethod: productData.cultivationMethod || "",
    harvestDate: productData.harvestDate,
    origin: productData.origin || "",
    certifications: productData.certifications as string[] || [],
    createdAt: productData.createdAt,
    updatedAt: productData.updatedAt,
  };
  
  // Calculate average rating if reviews exist
  const averageRating = product.rating?.average || 0;
  
  // Format price for display
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  // Calculate final price with discount if applicable
  const originalPrice = product.price.amount;
  const discountPercentage = productData.discount || 0;
  const finalPrice = product.price.discountedPrice || originalPrice;
  
  // Fetch related products from the same category
  const relatedProductsData = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: {
        not: product.id,
      },
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 4,
  });
  
  // Transform related products
  const relatedProducts = relatedProductsData.map(relProd => ({
    id: relProd.id,
    name: relProd.name,
    slug: relProd.slug,
    description: relProd.description,
    shortDescription: relProd.shortDescription || "",
    sellerId: relProd.sellerId,
    sellerName: relProd.seller.name,
    category: {
      id: relProd.category.id,
      name: relProd.category.name,
      slug: relProd.category.slug,
    },
    categoryId: relProd.categoryId,
    price: {
      amount: parseFloat(relProd.price?.toString() || "0"),
      currency: "USD",
      discountedPrice: relProd.discount 
        ? parseFloat(relProd.price?.toString() || "0") * (1 - (relProd.discount / 100))
        : undefined
    },
    stock: relProd.stock || 0,
    images: relProd.images as string[] || [],
    isFeatured: relProd.isFeatured || false,
    isOrganic: relProd.isOrganic || false,
    createdAt: relProd.createdAt,
    updatedAt: relProd.updatedAt,
  }));
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Product Details"
        text="View product information and purchase options."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/marketplace/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border">
              <div className="relative aspect-square">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{product.category.name}</Badge>
                {product.isOrganic && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Organic
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge>Featured</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              
              {/* Rating */}
              {product.rating?.count > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>
            
            {/* Pricing */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(finalPrice)}</span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <Badge variant="destructive" className="ml-2">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Stock */}
              <div className="mt-2">
                {product.stock > 0 ? (
                  <div className="text-sm text-green-600">
                    In Stock ({product.stock} units)
                  </div>
                ) : (
                  <div className="text-sm text-red-500">Out of Stock</div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground">
              {product.description}
            </p>
            
            {/* Client-side Cart and Wishlist Controls */}
            <div className="space-y-4">
              {product.stock > 0 && (
                <div className="flex gap-2">
                  <ProductCartButton product={product} />
                  <ProductWishlistButton product={product} />
                </div>
              )}
            </div>
            
            {/* Seller Info */}
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Seller Information</h3>
              <div className="mt-2 text-sm">
                <p>Sold by: {product.sellerName}</p>
                {product.origin && <p>Origin: {product.origin}</p>}
                {product.harvestDate && (
                  <p>Harvest Date: {new Date(product.harvestDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            
            {/* Shipping & Returns */}
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
              <div className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Secure Payments</p>
                  <p className="text-muted-foreground">Protected by Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4 space-y-4">
              <div className="prose max-w-none">
                <p>{product.description}</p>
                
                {product.features && product.features.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium">Features</h3>
                    <ul>
                      {product.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {product.certifications && product.certifications.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.certifications.map((cert: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-4">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="divide-y rounded-md border">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-2 p-3">
                      <span className="font-medium">{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specifications available</p>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-4">
                {productData.reviews.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(averageRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {productData.reviews.length} reviews
                        </div>
                      </div>
                      
                      <Separator orientation="vertical" className="h-16" />
                      
                      <div className="flex-1">
                        <div className="space-y-4">
                          {productData.reviews.map((review: ProductReview) => (
                            <div key={review.id} className="rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">{review.user.name}</div>
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="mt-2 text-sm">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No reviews yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-xl font-semibold">Related Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group rounded-lg border p-4 transition-all hover:shadow-md">
                  <Link href={`/dashboard/marketplace/browse/${relatedProduct.slug}`}>
                    <div className="relative aspect-square overflow-hidden rounded-md">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-medium">{relatedProduct.name}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-medium">
                          {formatPrice(relatedProduct.price.discountedPrice || relatedProduct.price.amount)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
