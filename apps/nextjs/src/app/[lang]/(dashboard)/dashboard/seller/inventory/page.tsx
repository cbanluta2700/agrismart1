import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Edit, AlertCircle, CheckCircle2 } from "lucide-react";

import { getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Badge } from "@saasfly/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@saasfly/ui/table";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Inventory Management",
  description: "Manage your product inventory and stock levels",
};

export default async function InventoryManagementPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const user = await getCurrentUser();
  
  // Redirect if not authenticated
  if (!user) {
    redirect(`/${lang}/login`);
  }
  
  const dict = await getDictionary(lang);
  
  // Fetch user's products with stock information
  const products = await db.selectFrom("Product")
    .where("sellerId", "=", user.id)
    .select([
      "id",
      "name",
      "price",
      "stock",
      "createdAt",
      "isActive",
    ])
    .orderBy("createdAt", "desc")
    .execute();
  
  // Calculate inventory statistics
  const totalProducts = products.length;
  const lowStockThreshold = 5; // Products with stock below this are considered low
  const lowStockProducts = products.filter(p => p.stock && p.stock.quantity < lowStockThreshold).length;
  const outOfStockProducts = products.filter(p => !p.stock || p.stock.quantity === 0).length;
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Inventory Management"
        text="Track and manage your product stock levels."
      />
      
      {/* Inventory Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in your inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products with stock below threshold ({lowStockThreshold})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products unavailable for purchase
            </p>
          </CardContent>
        </Card>
      </div>
      
      {products.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
            <CardDescription>
              Manage stock levels and product availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockLevel = product.stock ? product.stock.quantity : 0;
                  const stockStatus = 
                    stockLevel === 0 ? "out-of-stock" :
                    stockLevel < lowStockThreshold ? "low-stock" : "in-stock";
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        {stockLevel} units
                      </TableCell>
                      <TableCell>
                        {stockStatus === "out-of-stock" && (
                          <Badge variant="destructive" className="flex gap-1 items-center">
                            <AlertCircle className="h-3 w-3" /> Out of stock
                          </Badge>
                        )}
                        {stockStatus === "low-stock" && (
                          <Badge variant="outline" className="flex gap-1 items-center bg-amber-100">
                            <AlertCircle className="h-3 w-3" /> Low stock
                          </Badge>
                        )}
                        {stockStatus === "in-stock" && (
                          <Badge variant="success" className="flex gap-1 items-center">
                            <CheckCircle2 className="h-3 w-3" /> In stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/marketplace/products/${product.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Post" />
          <EmptyPlaceholder.Title>No products in inventory</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any products yet. Start creating products to manage your inventory.
          </EmptyPlaceholder.Description>
          <Link
            href="/dashboard/marketplace/products/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Add your first product
          </Link>
        </EmptyPlaceholder>
      )}
    </DashboardShell>
  );
}
