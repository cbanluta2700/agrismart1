import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@saasfly/ui/table";
import { Input } from "@saasfly/ui/input";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Bulk Update Inventory",
  description: "Update stock levels for multiple products at once",
};

export default async function BulkUpdateInventoryPage({
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
    .orderBy("name", "asc")
    .execute();
    
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Bulk Update Inventory"
        text="Update stock levels for multiple products at once."
      >
        <Link href="/dashboard/seller/inventory">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>
      </DashboardHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
          <CardDescription>
            Update the stock quantity for each product. Changes will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/inventory/bulk-update" method="POST">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>New Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const currentStock = product.stock ? product.stock.quantity : 0;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{currentStock} units</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          name={`stock-${product.id}`}
                          defaultValue={currentStock}
                          min="0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        {product.isActive ? "Active" : "Inactive"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <div className="mt-6 flex justify-end">
              <Button type="submit" className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
