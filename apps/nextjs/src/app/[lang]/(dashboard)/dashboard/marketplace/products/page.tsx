import React from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

export const metadata = {
  title: "My Products",
};

export default async function DashboardProductsPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Fetch user's products
  const products = await db.product.findMany({
    where: {
      sellerId: user?.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Products"
        text="Manage your listed products in the marketplace."
      >
        <Link
          href="/dashboard/marketplace/products/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </DashboardHeader>
      
      {products.length > 0 ? (
        <div className="divide-y divide-border rounded-md border">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4">
              <div className="grid gap-1">
                <Link
                  href={`/dashboard/marketplace/products/${product.id}`}
                  className="font-semibold hover:underline"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Category: {product.category.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Price: ${product.price.toString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
              <Link
                href={`/dashboard/marketplace/products/${product.id}/edit`}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>No products created</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any products yet. Start creating one.
          </EmptyPlaceholder.Description>
          <Link
            href="/dashboard/marketplace/products/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add your first product
          </Link>
        </EmptyPlaceholder>
      )}
    </DashboardShell>
  );
}
