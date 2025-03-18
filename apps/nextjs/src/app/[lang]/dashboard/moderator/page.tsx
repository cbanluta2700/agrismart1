import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Icons } from "@saasfly/ui/icons";

import { auth } from "@/auth";
import { DashboardHeader } from "~/components/dashboard-header";
import { DashboardShell } from "~/components/dashboard-shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Moderator Dashboard | AgriSmart",
  description: "Moderate community content, manage users, and ensure platform quality",
};

export default async function ModeratorDashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has MODERATOR role
  if (!session?.user || session.user.role !== "MODERATOR") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Moderator Dashboard"
        text="Manage and moderate the AgriSmart community"
      >
        <Button asChild variant="outline">
          <Link href={`/${lang}/dashboard/moderator/reports`}>
            <Icons.Flag className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Reported Content Card */}
        <Card className="border-2 border-amber-100">
          <CardHeader className="pb-4">
            <CardTitle>Reported Content</CardTitle>
            <CardDescription>
              Content flagged by the community
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Forum Post: "Pesticide Recommendations"</p>
                  <p className="text-xs text-muted-foreground">Reported for: Potentially harmful advice</p>
                </div>
                <div className="ml-auto font-medium text-amber-600">High</div>
              </div>
              <div className="flex items-center">
                <Icons.AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Comment on "Organic Certification"</p>
                  <p className="text-xs text-muted-foreground">Reported for: Misleading information</p>
                </div>
                <div className="ml-auto font-medium text-amber-600">Medium</div>
              </div>
              <div className="flex items-center">
                <Icons.AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Product Review: "Irrigation Systems"</p>
                  <p className="text-xs text-muted-foreground">Reported for: Spam/advertising</p>
                </div>
                <div className="ml-auto font-medium text-amber-600">Low</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/moderator/reports/content`}>
                Review All Reports
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Management Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Review and manage community members
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.UserX className="mr-2 h-5 w-5 text-red-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">User Reports</p>
                  <p className="text-xs text-muted-foreground">5 pending user reports</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm">
                    <Icons.ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <Icons.UserCheck className="mr-2 h-5 w-5 text-green-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Verification Requests</p>
                  <p className="text-xs text-muted-foreground">8 pending verifications</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm">
                    <Icons.ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                <Icons.Users className="mr-2 h-5 w-5 text-blue-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Community Growth</p>
                  <p className="text-xs text-muted-foreground">+24 new members this week</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm">
                    <Icons.ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/moderator/users`}>
                Manage Users
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Community Health Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Community Health</CardTitle>
            <CardDescription>
              Monitor the agricultural community activity
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <Icons.MessageSquare className="mr-2 h-5 w-5 text-green-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Active Discussions</p>
                  <p className="text-xs text-muted-foreground">42 active threads</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+12%</div>
              </div>
              <div className="flex items-center">
                <Icons.FileText className="mr-2 h-5 w-5 text-green-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Knowledge Base</p>
                  <p className="text-xs text-muted-foreground">156 articles</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+5%</div>
              </div>
              <div className="flex items-center">
                <Icons.Star className="mr-2 h-5 w-5 text-amber-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Featured Content</p>
                  <p className="text-xs text-muted-foreground">8 items to review</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm">
                    <Icons.ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/dashboard/moderator/content`}>
                Manage Content
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
