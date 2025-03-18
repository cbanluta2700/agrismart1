"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

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
import type { ProductFilter } from "~/components/marketplace/types/product";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  
  // State for UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for filters and pagination
  const [cursor, setCursor] = useState<string | null>(null);
  const limit = 9; // Items per page
  
  // Fetch categories
  const categoriesQuery = api.products.getCategories.useQuery();
  const categories = categoriesQuery.data || [];
  
  // Find current category by slug
  const currentCategory = categories.find(category => category.slug === slug);
  
  // Initialize filters with current category
  const initialFilters: ProductFilter = {
    categoryId: currentCategory?.id,
    sortBy: "newest",
  };
  
  const [filters, setFilters] = useState<ProductFilter>(initialFilters);
  
  // Update filters when category data is loaded
  useEffect(() => {
    if (currentCategory?.id) {
      setFilters(prev => ({ ...prev, categoryId: currentCategory.id }));
    }
  }, [currentCategory]);
  
  // Fetch products with filters
  const productsQuery = api.products.getAll.useQuery({
    limit,
    cursor,
    categoryId: filters.categoryId,
    search: filters.query,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
  });
  
  // Access product store for cart and wishlist actions
  const { addToCart, addToWishlist } = useProductStore();
  
  // Calculate total pages for pagination
  const totalCount = productsQuery.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Handle filter change
  const handleFilterChange = (newFilters: ProductFilter) => {
    // Preserve the category ID when changing other filters
    setFilters({ ...newFilters, categoryId: currentCategory?.id });
    setCursor(null); // Reset cursor when filters change
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (productsQuery.data?.nextCursor && page > currentPage) {
      setCursor(productsQuery.data.nextCursor);
    } else if (page < currentPage) {
      // Going backward requires refetching from the beginning
      setCursor(null);
    }
  };
  
  // Get the products to display
  const products = productsQuery.data?.items || [];
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;

  if (!isLoading && !currentCategory) {
    // Handle case where category doesn't exist
    return (
      <DashboardShell>
        <DashboardHeader heading="Category Not Found" text="The requested category could not be found.">
          <Link href="/dashboard/marketplace/categories">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
        </DashboardHeader>
        
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Warning" />
          <EmptyPlaceholder.Title>Category not found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            The category you're looking for doesn't exist or may have been removed.
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/marketplace/browse">
            <Button>Browse All Products</Button>
          </Link>
        </EmptyPlaceholder>
      </DashboardShell>
    );
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading={currentCategory?.name || "Loading Category..."}
        text={currentCategory?.description || "Browse products in this category."}
      >
        <Link href="/dashboard/marketplace/categories">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Categories
          </Button>
        </Link>
      </DashboardHeader>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Loading products..."
            ) : (
              <>Showing <strong>{totalCount}</strong> products in this category</>
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
                  There are no products in this category that match your filters.
                </EmptyPlaceholder.Description>
                <Button onClick={() => handleFilterChange({ categoryId: currentCategory?.id })}>
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
