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
  title: "Agricultural Resources | AgriSmart",
  description: "Manage educational materials and resources for farmers",
};

export default async function DashboardResourcesPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has MODERATOR or ADMIN role
  // Only MODERATOR and ADMIN can access resource management
  if (!session?.user || !(session.user.role === "MODERATOR" || session.user.role === "ADMIN")) {
    redirect(`/${lang}/login`);
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Agricultural Resources"
        description="Manage educational materials, guides, and market insights"
      >
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={`/${lang}/dashboard/resources/new`}>
              <Icons.Plus className="mr-2 h-4 w-4" />
              Add New Resource
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/resources/categories`}>
              <Icons.FolderPlus className="mr-2 h-4 w-4" />
              Manage Categories
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Learning Materials Card */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Materials</CardTitle>
            <CardDescription>Manage courses, guides, and educational content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                <Icons.BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">Educational Content</p>
                <p className="text-sm text-muted-foreground">Courses, guides, and articles</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/resources/learning`}>
                Manage Learning Materials
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Market Reports Card */}
        <Card>
          <CardHeader>
            <CardTitle>Market Reports</CardTitle>
            <CardDescription>Manage market insights and price forecasts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <Icons.BarChart2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">Market Insights</p>
                <p className="text-sm text-muted-foreground">Price trends and forecasts</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/resources/reports`}>
                Manage Market Reports
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Tools and Calculators Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tools & Calculators</CardTitle>
            <CardDescription>Manage agricultural calculators and tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100">
                <Icons.Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">Farming Tools</p>
                <p className="text-sm text-muted-foreground">Calculators and decision support tools</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/resources/tools`}>
                Manage Tools
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
