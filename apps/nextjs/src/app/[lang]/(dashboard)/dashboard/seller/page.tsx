import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LineChart, BarChart, PlusCircle } from "lucide-react";

import { getCurrentUser } from "@saasfly/auth";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import prisma from "@saasfly/db";

export const metadata = {
  title: "Seller Dashboard",
  description: "Manage your agricultural products, sales, and analytics."
};

export default async function SellerDashboardPage({
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
  
  // Get user role from database
  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  // Redirect to buyer dashboard if user is not a seller
  if (!userWithRole || userWithRole.role !== "SELLER") {
    redirect(`/${lang}/dashboard/buyer`);
  }
  
  const dict = await getDictionary(lang);
  
  // In a real implementation, we would fetch these from the database
  const recentOrders = [];
  const productCount = 0;
  const totalRevenue = 0;
  const pendingOrders = 0;
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Seller Dashboard"
        text="Manage your agricultural products, sales, and buyer interactions."
      >
        <Link href="/dashboard/marketplace/products/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </DashboardHeader>
      
      {/* Dashboard stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Products</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{productCount}</p>
          <p className="text-xs text-muted-foreground">Listed products</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Revenue</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">${totalRevenue}</p>
          <p className="text-xs text-muted-foreground">Total sales</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Pending Orders</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{pendingOrders}</p>
          <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Rating</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">N/A</p>
          <p className="text-xs text-muted-foreground">Seller rating</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">Track and manage recent sales</p>
            </div>
            <Link href="/dashboard/seller/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {/* Order list would go here */}
              <p className="p-4 text-sm text-muted-foreground">No recent orders to display</p>
            </div>
          ) : (
            <div className="p-8">
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="Post" />
                <EmptyPlaceholder.Title>No orders yet</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  When you receive orders, they will appear here.
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            </div>
          )}
        </div>
        
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Analytics</h2>
              <p className="text-sm text-muted-foreground">Sales performance and trends</p>
            </div>
            <Link href="/dashboard/seller/analytics">
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
          
          <div className="p-8 flex flex-col items-center justify-center">
            <LineChart className="h-16 w-16 text-muted-foreground/60" />
            <p className="mt-4 text-sm text-muted-foreground">Start selling to see your analytics data</p>
          </div>
        </div>
        
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">My Products</h2>
              <p className="text-sm text-muted-foreground">Manage your listings</p>
            </div>
            <Link href="/dashboard/marketplace/products">
              <Button variant="outline" size="sm">Manage Products</Button>
            </Link>
          </div>
          
          <div className="p-8">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="Post" />
              <EmptyPlaceholder.Title>No products yet</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                Create your first product listing to start selling.
              </EmptyPlaceholder.Description>
              <Link
                href="/dashboard/marketplace/products/new"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add your first product
              </Link>
            </EmptyPlaceholder>
          </div>
        </div>
        
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Inventory Status</h2>
              <p className="text-sm text-muted-foreground">Stock levels and alerts</p>
            </div>
            <Link href="/dashboard/seller/inventory">
              <Button variant="outline" size="sm">Manage Inventory</Button>
            </Link>
          </div>
          
          <div className="p-8 flex flex-col items-center justify-center">
            <BarChart className="h-16 w-16 text-muted-foreground/60" />
            <p className="mt-4 text-sm text-muted-foreground">Add products to track inventory</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
