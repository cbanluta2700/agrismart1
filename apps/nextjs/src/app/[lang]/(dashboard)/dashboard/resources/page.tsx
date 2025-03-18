import React from "react";
import Link from "next/link";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import * as Icons from "@saasfly/ui/icons";
import type { Locale } from "~/config/i18n-config";

export const metadata = {
  title: "Resources Dashboard",
};

// Resource section data
const resourceSections = [
  {
    title: "Knowledge Base",
    description: "Access articles, guides, and resources to enhance your agricultural knowledge.",
    icon: "Post",
    href: "/dashboard/resources/knowledge-base",
    color: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Educational Resources",
    description: "Enhance your agricultural knowledge with our comprehensive courses and lessons.",
    icon: "Rocket",
    href: "/dashboard/resources/educational-resources",
    color: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    title: "Documentation",
    description: "Comprehensive guides and reference materials for the AgriSmart platform.",
    icon: "Blocks",
    href: "/dashboard/resources/documentation",
    color: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

// Recent resources placeholder data
const recentResources = [
  {
    title: "Sustainable Farming Practices",
    type: "Knowledge Base",
    date: "Accessed Mar 15, 2025",
    href: "/dashboard/resources/knowledge-base/kb-1",
  },
  {
    title: "Introduction to Sustainable Agriculture",
    type: "Course",
    date: "Started Mar 10, 2025",
    href: "/dashboard/resources/educational-resources/course-1",
  },
  {
    title: "Platform Overview",
    type: "Documentation",
    date: "Accessed Mar 5, 2025",
    href: "/dashboard/resources/documentation/platform-overview",
  },
];

export default function DashboardResourcesPage({
  params: { lang: _lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Resources"
        text="Access educational materials, guides, and tools for agricultural success."
      />
      
      <div className="grid gap-6 md:grid-cols-3">
        {resourceSections.map((section, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute right-0 top-0 h-16 w-16 rounded-bl-lg ${section.color} flex items-center justify-center`}>
              {section.icon === "Post" && <Icons.Post className={`h-8 w-8 ${section.iconColor}`} />}
              {section.icon === "Rocket" && <Icons.Rocket className={`h-8 w-8 ${section.iconColor}`} />}
              {section.icon === "Blocks" && <Icons.Blocks className={`h-8 w-8 ${section.iconColor}`} />}
            </div>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={section.href}>
                  Explore {section.title}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recently Accessed</h2>
        <div className="divide-y divide-border rounded-md border">
          {recentResources.map((resource, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Icons.Post className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Link 
                    href={resource.href}
                    className="font-medium hover:underline"
                  >
                    {resource.title}
                  </Link>
                  <div className="flex space-x-2 text-sm text-muted-foreground">
                    <span>{resource.type}</span>
                    <span>•</span>
                    <span>{resource.date}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={resource.href}>
                  Continue
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
