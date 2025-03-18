"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Grid, List, SlidersHorizontal } from "lucide-react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Separator } from "@saasfly/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@saasfly/ui/sheet";
import { ProductCard } from "~/components/marketplace/product-card";
import { ProductGrid } from "~/components/marketplace/product-grid";
import { ProductFilters } from "~/components/marketplace/product-filters";
import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { useProductStore } from "~/components/marketplace/store/product-store";
import { api } from "~/utils/api";
import type { ProductCategory, ProductFilter } from "~/components/marketplace/types/product";

export default function MarketplaceBrowsePage() {
  // Get the query parameters
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for filters and pagination
  const [cursor, setCursor] = useState<string | null>(null);
  const limit = 9; // Items per page
  
  // Initialize filters from URL parameters
  const initialFilters: ProductFilter = {
    categoryId: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    query: searchParams.get("q") || undefined,
    isOrganic: searchParams.get("organic") === "true",
    isFeatured: searchParams.get("featured") === "true",
    sortBy: (searchParams.get("sort") as ProductFilter["sortBy"]) || undefined,
  };
  
  const [filters, setFilters] = useState<ProductFilter>(initialFilters);
  
  // Fetch categories from the database
  const categoriesQuery = api.products.getCategories.useQuery();
  const categories = categoriesQuery.data || [];
  
  // Fetch products with filters
  const productsQuery = api.products.getAll.useQuery({
    limit,
    cursor,
    categoryId: filters.categoryId,
    search: filters.query,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy === "rating" ? "newest" : filters.sortBy, // API doesn't support rating sort yet
  });
  
  // Access product store for cart and wishlist actions
  const { addToCart, addToWishlist } = useProductStore();
  
  // Calculate total pages for pagination
  const totalCount = productsQuery.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Handle filter change
  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
    setCursor(null); // Reset cursor when filters change
    setCurrentPage(1); // Reset to first page when filters change
    
    // Update URL with filter params
    const params = new URLSearchParams();
    if (newFilters.categoryId) params.set("category", newFilters.categoryId);
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice.toString());
    if (newFilters.query) params.set("q", newFilters.query);
    if (newFilters.isOrganic) params.set("organic", "true");
    if (newFilters.isFeatured) params.set("featured", "true");
    if (newFilters.sortBy) params.set("sort", newFilters.sortBy);
    
    router.push(`?${params.toString()}`);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (productsQuery.data?.nextCursor && page > currentPage) {
      setCursor(productsQuery.data.nextCursor);
    } else if (page < currentPage) {
      // Going backward requires refetching from the beginning
      setCursor(null);
      // We would need to implement more sophisticated cursor tracking for true back pagination
    }
  };
  
  // Get the products to display
  const products = productsQuery.data?.items || [];
  const isLoading = productsQuery.isLoading;
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Explore Marketplace"
        text="Discover fresh agricultural products from local farmers."
      />
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Loading products..."
            ) : (
              <>Showing <strong>{totalCount}</strong> products</>
            )}
          </p>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[400px]">
                <ProductFilters
                  categories={categories}
                  initialFilters={filters}
                  onFilterChange={handleFilterChange}
                  minPrice={0}
                  maxPrice={1000}
                  isMobile={true}
                />
              </SheetContent>
            </Sheet>
            
            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <ProductFilters
                categories={categories}
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                minPrice={0}
                maxPrice={1000}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <ProductGrid
                products={products}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                variant={viewMode === "grid" ? "default" : "compact"}
                columns={{ sm: 1, md: 2, lg: 3 }}
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: handlePageChange,
                }}
              />
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="Package" />
                <EmptyPlaceholder.Title>No products found</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Try adjusting your filters to find what you're looking for.
                </EmptyPlaceholder.Description>
                <Button onClick={() => handleFilterChange({})}>
                  Reset Filters
                </Button>
              </EmptyPlaceholder>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
