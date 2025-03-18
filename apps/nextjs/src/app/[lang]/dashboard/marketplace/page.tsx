import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import * as Icons from "lucide-react";

import { auth } from "~/lib/auth";
import { DashboardShell } from "~/components/shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Marketplace Management | AgriSmart",
  description: "Manage agricultural products, listings, and orders in the marketplace",
};

export default async function DashboardMarketplacePage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has appropriate role for marketplace management
  if (!session?.user || !(session.user.role === "SELLER" || session.user.role === "MODERATOR" || session.user.role === "ADMIN")) {
    redirect(`/${lang}/login`);
  }

  const userRole = session.user.role;
  const userId = session.user.id; // Used to filter products for SELLER role
  const dict = await getDictionary(lang);
  const isModerator = userRole === "MODERATOR" || userRole === "ADMIN";
  const isSeller = userRole === "SELLER";

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Marketplace Management"
        description={isModerator ? "Manage all agricultural products and listings" : "Manage your agricultural products and listings"}
      >
        <div className="flex space-x-2">
          {(isSeller || isModerator) && (
            <Button asChild>
              <Link href={`/${lang}/dashboard/marketplace/products/new`}>
                <Icons.Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
          )}
          {isModerator && (
            <Button asChild variant="outline">
              <Link href={`/${lang}/dashboard/marketplace/categories`}>
                <Icons.Tag className="mr-2 h-4 w-4" />
                Manage Categories
              </Link>
            </Button>
          )}
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Product Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isModerator ? "All Products" : "My Products"}</CardTitle>
            <CardDescription>
              {isModerator ? "Manage all agricultural product listings" : "Manage your agricultural product listings"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <Icons.Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{isModerator ? "All Products" : "My Products"}</p>
                <p className="text-sm text-muted-foreground">
                  {isModerator ? "View and edit all agricultural products" : "View and edit your agricultural products"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/marketplace/products${isModerator ? '/all' : ''}`}>
                {isModerator ? "View All Products" : "View My Products"}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Orders Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isModerator ? "All Orders" : "My Orders"}</CardTitle>
            <CardDescription>
              {isModerator ? "Track and manage all customer orders" : "Track and manage your orders"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                <Icons.ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{isModerator ? "All Orders" : "My Orders"}</p>
                <p className="text-sm text-muted-foreground">
                  {isModerator ? "View and process all customer orders" : "View and process your orders"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/marketplace/orders${isModerator ? '/all' : ''}`}>
                {isModerator ? "Manage All Orders" : "Manage My Orders"}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Administration Card (Only visible to MODERATOR and ADMIN) */}
        {isModerator && (
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Administration</CardTitle>
              <CardDescription>Advanced marketplace management tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100">
                  <Icons.Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Marketplace Settings</p>
                  <p className="text-sm text-muted-foreground">Configure marketplace settings and policies</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100">
                  <Icons.AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Product Reviews</p>
                  <p className="text-sm text-muted-foreground">Moderate product reviews and comments</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${lang}/dashboard/marketplace/admin`}>
                  Access Admin Tools
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
