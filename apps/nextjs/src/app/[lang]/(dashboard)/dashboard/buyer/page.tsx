import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, HeartIcon, ListFilter } from "lucide-react";

import { getCurrentUser } from "@saasfly/auth";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import prisma from "@saasfly/db";

export const metadata = {
  title: "Buyer Dashboard",
  description: "Manage your agricultural purchases, orders, and saved items."
};

export default async function BuyerDashboardPage({
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

  // Redirect to seller dashboard if user is not a buyer
  if (!userWithRole || userWithRole.role !== "BUYER") {
    redirect(`/${lang}/dashboard/seller`);
  }
  
  const dict = await getDictionary(lang);
  
  // In a real implementation, we would fetch these from the database
  const recentOrders = [];
  const savedProducts = 0;
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Buyer Dashboard"
        text="Manage your agricultural purchases, orders, and saved items."
      >
        <Link href="/dashboard/marketplace">
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </Link>
      </DashboardHeader>
      
      {/* Dashboard stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Orders</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{recentOrders.length}</p>
          <p className="text-xs text-muted-foreground">Total orders</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Saved Items</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{savedProducts}</p>
          <p className="text-xs text-muted-foreground">Products saved</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Status</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">Active</p>
          <p className="text-xs text-muted-foreground">Account status</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">My Orders</h2>
              <p className="text-sm text-muted-foreground">Track and manage your purchases</p>
            </div>
            <Link href="/dashboard/buyer/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {/* Order list would go here */}
              <p className="p-4 text-sm text-muted-foreground">No orders to display</p>
            </div>
          ) : (
            <div className="p-8">
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="Post" />
                <EmptyPlaceholder.Title>No orders yet</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Browse the marketplace and place your first order.
                </EmptyPlaceholder.Description>
                <Link
                  href="/dashboard/marketplace"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </EmptyPlaceholder>
            </div>
          )}
        </div>
        
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Saved Products</h2>
              <p className="text-sm text-muted-foreground">Items you've bookmarked for later</p>
            </div>
            <Link href="/dashboard/buyer/favorites">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="p-8">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="Post" />
              <EmptyPlaceholder.Title>No saved products</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                Products you save will appear here for quick access.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          </div>
        </div>
        
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recommended For You</h2>
              <p className="text-sm text-muted-foreground">Products matched to your preferences</p>
            </div>
          </div>
          
          <div className="p-8">
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="Post" />
              <EmptyPlaceholder.Title>No recommendations yet</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                Set up your preferences to receive personalized recommendations.
              </EmptyPlaceholder.Description>
              <Link
                href="/dashboard/buyer/preferences"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <ListFilter className="mr-2 h-4 w-4" />
                Set Preferences
              </Link>
            </EmptyPlaceholder>
          </div>
        </div>
        
        <div className="rounded-lg border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Your recent marketplace interactions</p>
            </div>
          </div>
          
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No recent activity to display</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
