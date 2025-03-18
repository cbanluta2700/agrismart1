"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import { Skeleton } from "@saasfly/ui/skeleton";

import { ProductCard } from "./product-card";
import type { Product } from "./types/product";

type ProductGridProps = {
  products: Product[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  variant?: "default" | "compact";
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
};

export function ProductGrid({
  products,
  isLoading = false,
  emptyState,
  onAddToCart,
  onAddToWishlist,
  variant = "default",
  columns = {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  pagination,
}: ProductGridProps) {
  // Calculate column classes based on props
  const getGridCols = () => {
    const sm = columns.sm ? `grid-cols-${columns.sm}` : "grid-cols-2";
    const md = columns.md ? `md:grid-cols-${columns.md}` : "md:grid-cols-3";
    const lg = columns.lg ? `lg:grid-cols-${columns.lg}` : "lg:grid-cols-4";
    const xl = columns.xl ? `xl:grid-cols-${columns.xl}` : "xl:grid-cols-5";
    return `${sm} ${md} ${lg} ${xl}`;
  };

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${getGridCols()}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${getGridCols()}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            variant={variant}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: pagination.totalPages }).map((_, i) => {
            const page = i + 1;
            const isCurrentPage = page === pagination.currentPage;
            const isNearCurrent =
              page === 1 ||
              page === pagination.totalPages ||
              Math.abs(page - pagination.currentPage) <= 1;

            if (!isNearCurrent && page !== 2 && page !== pagination.totalPages - 1) {
              if (page === 3 || page === pagination.totalPages - 2) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <Button
                key={page}
                variant={isCurrentPage ? "default" : "outline"}
                size="icon"
                onClick={() => pagination.onPageChange(page)}
                className="h-8 w-8"
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
