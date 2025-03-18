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
  title: "Community Management | AgriSmart",
  description: "Engage with the agricultural community, join groups, and participate in discussions",
};

export default async function DashboardCommunityPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();
  
  // Check if user is authenticated and has appropriate role for community access
  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  const userRole = session.user.role;
  const userId = session.user.id;
  const dict = await getDictionary(lang);
  const isModerator = userRole === "MODERATOR" || userRole === "ADMIN";
  const isBuyerOrSeller = userRole === "BUYER" || userRole === "SELLER";

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Community Dashboard"
        description="Engage with the agricultural community, join groups, and participate in discussions"
      >
        <div className="flex space-x-2">
          {(isModerator || isBuyerOrSeller) && (
            <Button asChild>
              <Link href={`/${lang}/dashboard/community/posts/new`}>
                <Icons.PenTool className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          )}
          {isModerator && (
            <Button asChild variant="outline">
              <Link href={`/${lang}/dashboard/community/moderation`}>
                <Icons.Shield className="mr-2 h-4 w-4" />
                Moderation Panel
              </Link>
            </Button>
          )}
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* My Posts Card */}
        {(isModerator || isBuyerOrSeller) && (
          <Card>
            <CardHeader>
              <CardTitle>My Posts</CardTitle>
              <CardDescription>Manage your community posts and discussions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                  <Icons.FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Posts & Discussions</p>
                  <p className="text-sm text-muted-foreground">View and edit your posts</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${lang}/dashboard/community/posts/my`}>
                  Manage My Posts
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Groups Card */}
        {(isModerator || isBuyerOrSeller) && (
          <Card>
            <CardHeader>
              <CardTitle>My Groups</CardTitle>
              <CardDescription>Participate in community groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                  <Icons.Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Community Groups</p>
                  <p className="text-sm text-muted-foreground">View and interact with groups</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${lang}/dashboard/community/groups`}>
                  View My Groups
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Moderation Card (Only visible to MODERATOR and ADMIN) */}
        {isModerator && (
          <Card>
            <CardHeader>
              <CardTitle>Community Moderation</CardTitle>
              <CardDescription>Moderate all community content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100">
                  <Icons.Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">All Content</p>
                  <p className="text-sm text-muted-foreground">View and manage all community content</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100">
                  <Icons.Flag className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Reported Content</p>
                  <p className="text-sm text-muted-foreground">Moderate flagged posts and comments</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${lang}/dashboard/community/moderation/queue`}>
                  View Moderation Queue
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
