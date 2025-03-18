import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, ArrowLeft } from "lucide-react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

export const metadata = {
  title: "Product Details",
};

export default async function ProductDetailPage({
  params: { lang, id },
}: {
  params: {
    lang: Locale;
    id: string;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Fetch the product
  const product = await db.product.findUnique({
    where: {
      id: id,
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
  });
  
  // If product doesn't exist or doesn't belong to the user
  if (!product || (product.sellerId !== user?.id && user?.role !== "ADMIN")) {
    notFound();
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading={product.name}
        text="View and manage your product details."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/marketplace/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/marketplace/products/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="divide-y divide-border rounded-md border">
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Product Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="mt-1">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                  <p className="mt-1">${product.price.toString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Stock</h3>
                  <p className="mt-1">{product.stock} units</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                <p className="mt-1">{product.category.name}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border rounded-md border">
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Product Image</h2>
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square overflow-hidden rounded-md">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">No image available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
