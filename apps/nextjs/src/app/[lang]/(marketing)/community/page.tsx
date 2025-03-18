import React from "react";
import Link from "next/link";

import { DashboardShell as Shell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";

export const metadata = {
  title: "Community",
};

export default async function CommunityPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Create links that redirect to login if user is not authenticated
  const joinNowLink = user
    ? `/${lang}/dashboard/community/profile`
    : `/${lang}/login?callbackUrl=/${lang}/dashboard/community/profile&feature=community`;
  
  // Function to create forum, group, and event links
  const getCommunityLink = (section: string, id: string) => {
    return user
      ? `/${lang}/dashboard/community/${section}/${id}`
      : `/${lang}/login?callbackUrl=/${lang}/dashboard/community/${section}/${id}&feature=${section}`;
  };
  
  return (
    <Shell className="max-w-6xl">
      <div className="py-8">
        <h1 className="mb-6 text-center text-4xl font-bold text-primary">AgriSmart Community</h1>
        <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground">
          Connect with other farmers, agricultural experts, and suppliers. Share knowledge, 
          ask questions, and collaborate on agricultural challenges.
        </p>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Forums</h2>
            <p className="text-muted-foreground">Discuss farming techniques, equipment, and more with the community.</p>
            <div className="mt-4 space-y-3">
              <Link href={getCommunityLink("forums", "crop-management")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Crop Management</h3>
                  <p className="text-sm text-muted-foreground">246 discussions</p>
                </div>
              </Link>
              <Link href={getCommunityLink("forums", "equipment-tools")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Equipment & Tools</h3>
                  <p className="text-sm text-muted-foreground">183 discussions</p>
                </div>
              </Link>
              <Link href={getCommunityLink("forums", "market-trends")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Market Trends</h3>
                  <p className="text-sm text-muted-foreground">129 discussions</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Groups</h2>
            <p className="text-muted-foreground">Join specialized groups based on farming type, region, or interests.</p>
            <div className="mt-4 space-y-3">
              <Link href={getCommunityLink("groups", "organic-farming")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Organic Farming Alliance</h3>
                  <p className="text-sm text-muted-foreground">1,245 members</p>
                </div>
              </Link>
              <Link href={getCommunityLink("groups", "urban-agriculture")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Urban Agriculture Network</h3>
                  <p className="text-sm text-muted-foreground">879 members</p>
                </div>
              </Link>
              <Link href={getCommunityLink("groups", "livestock-dairy")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Livestock & Dairy Producers</h3>
                  <p className="text-sm text-muted-foreground">1,056 members</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Events</h2>
            <p className="text-muted-foreground">Discover and join agricultural events, webinars, and meetups.</p>
            <div className="mt-4 space-y-3">
              <Link href={getCommunityLink("events", "sustainable-farming-summit")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Sustainable Farming Summit</h3>
                  <p className="text-sm text-muted-foreground">Virtual • June 15-17, 2025</p>
                </div>
              </Link>
              <Link href={getCommunityLink("events", "regional-farmers-market")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Regional Farmers Market</h3>
                  <p className="text-sm text-muted-foreground">Chicago • Monthly</p>
                </div>
              </Link>
              <Link href={getCommunityLink("events", "agtech-innovation-conference")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">AgTech Innovation Conference</h3>
                  <p className="text-sm text-muted-foreground">San Francisco • August 10-12, 2025</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 rounded-lg border bg-muted/50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Join the AgriSmart Community</h2>
          <p className="mb-6">
            Connect with thousands of agricultural professionals, share your knowledge, and learn from others' experiences.
          </p>
          <Link href={joinNowLink}>
            <Button className="font-medium">Join Now</Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
