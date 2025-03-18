"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { Slider } from "@saasfly/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@saasfly/ui/accordion";
import { Checkbox } from "@saasfly/ui/checkbox";
import { Badge } from "@saasfly/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@saasfly/ui/select";

import type { ProductCategory, ProductFilter } from "./types/product";

type ProductFiltersProps = {
  categories: ProductCategory[];
  initialFilters?: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  minPrice?: number;
  maxPrice?: number;
  isMobile?: boolean;
  onMobileClose?: () => void;
};

export function ProductFilters({
  categories,
  initialFilters = {},
  onFilterChange,
  minPrice = 0,
  maxPrice = 1000,
  isMobile = false,
  onMobileClose,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductFilter>(initialFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice || minPrice,
    initialFilters.maxPrice || maxPrice,
  ]);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || "");

  // Helper function to update filters
  const updateFilters = (newFilters: Partial<ProductFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    updateFilters({ categoryId: checked ? categoryId : undefined });
  };

  // Handle sort selection
  const handleSortChange = (value: string) => {
    updateFilters({ sortBy: value as ProductFilter["sortBy"] });
  };

  // Handle organic filter
  const handleOrganicChange = (checked: boolean) => {
    updateFilters({ isOrganic: checked });
  };

  // Handle featured filter
  const handleFeaturedChange = (checked: boolean) => {
    updateFilters({ isFeatured: checked });
  };

  // Handle price range change
  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  // Apply price range after slider is released
  const handlePriceChangeCommitted = () => {
    updateFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchQuery });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setPriceRange([minPrice, maxPrice]);
    setSearchQuery("");
    onFilterChange({});
  };

  return (
    <div className={`${isMobile ? "h-full overflow-auto" : ""}`}>
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="text-lg font-semibold">Filters</h3>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6 py-4">
        {/* Search */}
        <div className="space-y-2">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
              <Button type="submit" size="sm" className="h-9">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sort-by">Sort By</Label>
          <Select
            value={filters.sortBy || ""}
            onValueChange={handleSortChange}
          >
            <SelectTrigger id="sort-by" className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Best Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <Accordion type="single" collapsible defaultValue="categories">
          <AccordionItem value="categories">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categoryId === category.id}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(
                          category.id,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex justify-between w-full"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Price Range */}
        <Accordion type="single" collapsible defaultValue="price">
          <AccordionItem value="price">
            <AccordionTrigger>Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                <Slider
                  defaultValue={priceRange}
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={5}
                  onValueChange={handlePriceChange}
                  onValueCommit={handlePriceChangeCommitted}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    ${priceRange[0]}
                  </span>
                  <span className="text-sm">
                    ${priceRange[1]}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Product Types */}
        <Accordion type="single" collapsible defaultValue="product-types">
          <AccordionItem value="product-types">
            <AccordionTrigger>Product Types</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organic"
                    checked={filters.isOrganic || false}
                    onCheckedChange={(checked) =>
                      handleOrganicChange(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="organic"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Organic Products
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={filters.isFeatured || false}
                    onCheckedChange={(checked) =>
                      handleFeaturedChange(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="featured"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Featured Products
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Active Filters */}
        {Object.values(filters).some((val) => val !== undefined) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Active Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.categoryId && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {categories.find((c) => c.id === filters.categoryId)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCategoryChange(filters.categoryId!, false)}
                  />
                </Badge>
              )}
              {filters.query && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {filters.query}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilters({ query: undefined })}
                  />
                </Badge>
              )}
              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Price: ${filters.minPrice || minPrice} - ${filters.maxPrice || maxPrice}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setPriceRange([minPrice, maxPrice]);
                      updateFilters({ minPrice: undefined, maxPrice: undefined });
                    }}
                  />
                </Badge>
              )}
              {filters.isOrganic && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Organic
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleOrganicChange(false)}
                  />
                </Badge>
              )}
              {filters.isFeatured && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Featured
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFeaturedChange(false)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
