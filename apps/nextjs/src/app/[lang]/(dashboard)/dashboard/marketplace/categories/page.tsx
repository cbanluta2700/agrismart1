"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid, Package } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { api } from "~/utils/api";
import { cn } from "@saasfly/ui";
import type { ProductCategory } from "~/components/marketplace/types/product";

export default function MarketplaceCategoriesPage() {
  // Fetch all categories
  const categoriesQuery = api.products.getCategories.useQuery();
  const categories = categoriesQuery.data || [];
  const isLoading = categoriesQuery.isLoading;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Product Categories"
        text="Browse all product categories in our agricultural marketplace."
      >
        <Link href="/dashboard/marketplace/browse">
          <Button variant="outline">All Products</Button>
        </Link>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: ProductCategory) => (
            <Link
              key={category.id}
              href={`/dashboard/marketplace/categories/${category.slug}`}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all hover:border-primary hover:shadow-md">
                {category.imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="p-4">
                  <CardTitle className="line-clamp-1">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription className="line-clamp-2">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Grid className="mr-1 h-4 w-4" />
                      <span>Browse Products</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-primary hover:text-primary"
                    >
                      View Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Post" />
          <EmptyPlaceholder.Title>No categories found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            No product categories have been created yet.
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/marketplace/browse">
            <Button>Browse All Products</Button>
          </Link>
        </EmptyPlaceholder>
      )}
    </DashboardShell>
  );
}
