import React from "react";
import Link from "next/link";

import { DashboardShell as Shell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";

export const metadata = {
  title: "Resources",
};

export default async function ResourcesPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Links for resource content access
  const askExpertLink = user 
    ? `/${lang}/dashboard/resources/ask-expert` 
    : `/${lang}/login?callbackUrl=/${lang}/dashboard/resources/ask-expert&feature=expert`;
  
  // Function to generate resource detail links
  const getResourceLink = (resourceType: string, resourceId: string) => {
    return user 
      ? `/${lang}/dashboard/resources/${resourceType}/${resourceId}` 
      : `/${lang}/login?callbackUrl=/${lang}/dashboard/resources/${resourceType}/${resourceId}&feature=${resourceType}`;
  };
  
  return (
    <Shell className="max-w-6xl">
      <div className="py-8">
        <h1 className="mb-6 text-center text-4xl font-bold text-primary">AgriSmart Resources</h1>
        <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground">
          Access valuable agricultural resources, guides, and educational content to help you 
          improve your farming practices and business.
        </p>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Guides & Articles</h2>
            <p className="text-muted-foreground">Comprehensive guides on farming techniques, crop management, and more.</p>
            <div className="mt-4 space-y-3">
              <Link href={getResourceLink("guides", "sustainable-farming")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Sustainable Farming Practices</h3>
                  <p className="text-sm text-muted-foreground">Complete guide to reduce environmental impact</p>
                </div>
              </Link>
              <Link href={getResourceLink("guides", "crop-rotation")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Crop Rotation Strategies</h3>
                  <p className="text-sm text-muted-foreground">Maximize soil health and yield</p>
                </div>
              </Link>
              <Link href={getResourceLink("guides", "water-conservation")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Water Conservation Techniques</h3>
                  <p className="text-sm text-muted-foreground">Efficient irrigation methods</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Tools & Calculators</h2>
            <p className="text-muted-foreground">Useful tools for planning, calculating yields, and managing farm operations.</p>
            <div className="mt-4 space-y-3">
              <Link href={getResourceLink("tools", "seed-calculator")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Seed Planting Calculator</h3>
                  <p className="text-sm text-muted-foreground">Determine optimal seed quantity and spacing</p>
                </div>
              </Link>
              <Link href={getResourceLink("tools", "yield-estimator")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Harvest Yield Estimator</h3>
                  <p className="text-sm text-muted-foreground">Forecast your crop production</p>
                </div>
              </Link>
              <Link href={getResourceLink("tools", "fertilizer-planner")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Fertilizer Application Planner</h3>
                  <p className="text-sm text-muted-foreground">Calculate needed nutrients for your crops</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Training & Courses</h2>
            <p className="text-muted-foreground">Educational resources to enhance your agricultural knowledge and skills.</p>
            <div className="mt-4 space-y-3">
              <Link href={getResourceLink("courses", "organic-farming")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Introduction to Organic Farming</h3>
                  <p className="text-sm text-muted-foreground">6-week online course • Self-paced</p>
                </div>
              </Link>
              <Link href={getResourceLink("courses", "irrigation-systems")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Modern Irrigation Systems</h3>
                  <p className="text-sm text-muted-foreground">4-week course • Certification available</p>
                </div>
              </Link>
              <Link href={getResourceLink("courses", "business-management")}>
                <div className="rounded-md bg-accent/50 p-3 cursor-pointer hover:bg-accent/70">
                  <h3 className="font-medium">Agricultural Business Management</h3>
                  <p className="text-sm text-muted-foreground">8-week course • Expert instructors</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 rounded-lg border bg-muted/50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Expert Advice at Your Fingertips</h2>
          <p className="mb-6">
            Get personalized recommendations and answers to your agricultural questions with our AI-powered assistant.
          </p>
          <Link href={askExpertLink}>
            <Button className="font-medium">Ask an Expert</Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
