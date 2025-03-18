import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Rocket, Post, Dashboard, Search } from "@saasfly/ui/icons";

import { auth } from "~/lib/auth";
import { validateRoleAccess } from "~/lib/role-validation";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { marketingConfig } from "~/config/marketing";

export const metadata: Metadata = {
  title: "Buyer Dashboard | AgriSmart",
  description: "Access agricultural products, connect with sellers, and manage your purchases",
};

export default async function BuyerDashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Use centralized role validation instead of inline checks
  validateRoleAccess(session, "BUYER", lang);

  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Buyer Dashboard"
        description="Welcome to AgriSmart - your agricultural marketplace"
      >
        <Button asChild>
          <Link href={`/${lang}/dashboard/marketplace`}>
            <Search className="mr-2 h-4 w-4" />
            Browse Marketplace
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Featured Products Card */}
        <Card className="border-2 border-green-100">
          <CardHeader className="pb-4">
            <CardTitle>Featured Products</CardTitle>
            <CardDescription>
              Top agricultural products selected for you
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center rounded-md bg-green-50 p-2">
                <div className="h-12 w-12 overflow-hidden rounded-md">
                  <Image
                    src="/images/products/organic-fertilizer.jpg"
                    alt="Organic Fertilizer"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold">Organic Fertilizer</h4>
                  <p className="text-xs text-muted-foreground">Eco-friendly soil enhancement</p>
                </div>
                <div className="font-medium">$24.99</div>
              </div>
              <div className="flex items-center rounded-md bg-green-50 p-2">
                <div className="h-12 w-12 overflow-hidden rounded-md">
                  <Image
                    src="/images/products/irrigation-system.jpg"
                    alt="Smart Irrigation System"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold">Smart Irrigation System</h4>
                  <p className="text-xs text-muted-foreground">Water-saving technology</p>
                </div>
                <div className="font-medium">$129.99</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/marketplace`}>
                View All Products
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Purchases Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>
              Manage your recent agricultural purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Post className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Order #234-5678</p>
                  <p className="text-xs text-muted-foreground">Heritage Seeds Collection</p>
                </div>
                <div className="ml-auto font-medium text-green-600">Delivered</div>
              </div>
              <div className="flex items-center">
                <Post className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Order #123-9876</p>
                  <p className="text-xs text-muted-foreground">Organic Pesticides Bundle</p>
                </div>
                <div className="ml-auto font-medium text-amber-600">Shipped</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/buyer/purchases`}>
                View All Purchases
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Community Resources Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Agricultural Resources</CardTitle>
            <CardDescription>
              Learn from experts in sustainable farming
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Post className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Crop Rotation Techniques</p>
                  <p className="text-xs text-muted-foreground">Maximize your yield</p>
                </div>
                <div className="ml-auto font-medium">5m read</div>
              </div>
              <div className="flex items-center">
                <Post className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Water Conservation Methods</p>
                  <p className="text-xs text-muted-foreground">Sustainable practices</p>
                </div>
                <div className="ml-auto font-medium">8m read</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/resources`}>
                Explore Resources
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
