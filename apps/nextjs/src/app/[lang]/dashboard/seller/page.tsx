import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Icons } from "@saasfly/ui/icons";

import { auth } from "@/auth";
import { DashboardHeader } from "~/components/dashboard-header";
import { DashboardShell } from "~/components/dashboard-shell";
import { marketingConfig } from "~/config/marketing";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Seller Dashboard | AgriSmart",
  description: "Manage your agricultural products, track orders, and view analytics",
};

export default async function SellerDashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has SELLER role
  if (!session?.user || session.user.role !== "SELLER") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Seller Dashboard"
        text="Manage your agricultural products and sales"
      >
        <Button asChild>
          <Link href={`/${lang}/dashboard/seller/products/new`}>
            <Icons.PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sales Overview Card */}
        <Card className="border-2 border-green-100">
          <CardHeader className="pb-4">
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Your performance this month
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Monthly Revenue</p>
                  <p className="text-sm text-muted-foreground">$1,248.32</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+12.5%</div>
              </div>
              <div className="flex items-center">
                <Icons.ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Total Orders</p>
                  <p className="text-sm text-muted-foreground">28 orders</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+8.2%</div>
              </div>
              <div className="flex items-center">
                <Icons.Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">New Customers</p>
                  <p className="text-sm text-muted-foreground">12 customers</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+4.6%</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/seller/analytics`}>
                View Detailed Analytics
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Orders Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your latest agricultural product orders
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.ShoppingCart className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Order #789-3456</p>
                  <p className="text-xs text-muted-foreground">Organic Seeds (5 items)</p>
                </div>
                <div className="ml-auto font-medium text-amber-600">Processing</div>
              </div>
              <div className="flex items-center">
                <Icons.ShoppingCart className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Order #567-2345</p>
                  <p className="text-xs text-muted-foreground">Farming Tools (2 items)</p>
                </div>
                <div className="ml-auto font-medium text-green-600">Shipped</div>
              </div>
              <div className="flex items-center">
                <Icons.ShoppingCart className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Order #456-7890</p>
                  <p className="text-xs text-muted-foreground">Organic Fertilizer (1 item)</p>
                </div>
                <div className="ml-auto font-medium text-green-600">Delivered</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/seller/orders`}>
                View All Orders
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Product Management Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Product Management</CardTitle>
            <CardDescription>
              Your agricultural product inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 overflow-hidden rounded-md bg-green-100 flex items-center justify-center">
                  <Icons.Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold">Organic Vegetable Seeds</h4>
                  <p className="text-xs text-muted-foreground">Stock: 125 packs</p>
                </div>
                <div className="font-medium text-green-600">Active</div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 overflow-hidden rounded-md bg-green-100 flex items-center justify-center">
                  <Icons.Droplet className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold">Natural Pesticides</h4>
                  <p className="text-xs text-muted-foreground">Stock: 48 bottles</p>
                </div>
                <div className="font-medium text-amber-600">Low Stock</div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 overflow-hidden rounded-md bg-green-100 flex items-center justify-center">
                  <Icons.BarChart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold">Soil pH Testing Kit</h4>
                  <p className="text-xs text-muted-foreground">Stock: 34 units</p>
                </div>
                <div className="font-medium text-green-600">Active</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/seller/products`}>
                Manage Products
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
