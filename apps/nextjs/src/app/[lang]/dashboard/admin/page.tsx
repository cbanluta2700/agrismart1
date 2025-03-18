import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import * as Icons from "@saasfly/ui/icons";

import { auth } from "@/auth";
import { DashboardShell } from "~/components/shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Admin Dashboard | AgriSmart",
  description: "Manage the AgriSmart platform, users, and system settings",
};

export default async function AdminDashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has ADMIN role
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Admin Dashboard"
        description="Manage the AgriSmart agricultural platform"
      >
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/admin/settings`}>
              <Icons.Settings className="mr-2 h-4 w-4" />
              System Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/users/new`}>
              <Icons.UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Platform Statistics Card */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="pb-4">
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>
              Key metrics of the AgriSmart platform
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.Users className="mr-2 h-5 w-5 text-blue-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Total Users</p>
                  <p className="text-sm text-muted-foreground">1,248 users</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+24.8%</div>
              </div>
              <div className="flex items-center">
                <Icons.ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Product Listings</p>
                  <p className="text-sm text-muted-foreground">387 products</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+12.4%</div>
              </div>
              <div className="flex items-center">
                <Icons.CircleDollarSign className="mr-2 h-5 w-5 text-blue-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Total Revenue</p>
                  <p className="text-sm text-muted-foreground">$28,459.55</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+32.5%</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/admin/analytics`}>
                View Detailed Analytics
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Management Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users by role and status
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.ShoppingBag className="mr-2 h-5 w-5 text-green-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Buyers</p>
                  <p className="text-xs text-muted-foreground">956 active users</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${lang}/dashboard/admin/users?role=BUYER`}>
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <Icons.Store className="mr-2 h-5 w-5 text-amber-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Sellers</p>
                  <p className="text-xs text-muted-foreground">248 active sellers</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${lang}/dashboard/admin/users?role=SELLER`}>
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <Icons.Shield className="mr-2 h-5 w-5 text-blue-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Moderators & Admins</p>
                  <p className="text-xs text-muted-foreground">28 staff members</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${lang}/dashboard/admin/users?role=STAFF`}>
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/admin/users`}>
                Manage All Users
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* System Management Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>System Management</CardTitle>
            <CardDescription>
              Agricultural platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.Layers className="mr-2 h-5 w-5 text-purple-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Product Categories</p>
                  <p className="text-xs text-muted-foreground">24 categories configured</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${lang}/dashboard/admin/categories`}>
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <Icons.Bell className="mr-2 h-5 w-5 text-red-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">System Alerts</p>
                  <p className="text-xs text-muted-foreground">2 active alerts</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${lang}/dashboard/admin/alerts`}>
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <Icons.FileText className="mr-2 h-5 w-5 text-green-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Content Management</p>
                  <p className="text-xs text-muted-foreground">Manage agricultural resources</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${lang}/dashboard/admin/content`}>
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/admin/settings`}>
                Manage System Settings
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
