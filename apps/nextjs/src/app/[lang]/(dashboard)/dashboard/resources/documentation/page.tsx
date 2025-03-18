import React from "react";
import Link from "next/link";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import * as Icons from "@saasfly/ui/icons";
import { Badge } from "@saasfly/ui/badge";
import { Input } from "@saasfly/ui/input";
import { Separator } from "@saasfly/ui/separator";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Documentation - AgriSmart Platform",
};

// Placeholder data for documentation categories
const documentationCategories = [
  {
    title: "Getting Started",
    description: "Essential guides for new users of the AgriSmart platform",
    icon: "Book",
    docs: [
      { title: "Platform Overview", href: "/dashboard/resources/documentation/platform-overview" },
      { title: "Account Setup", href: "/dashboard/resources/documentation/account-setup" },
      { title: "Navigation Guide", href: "/dashboard/resources/documentation/navigation-guide" },
    ]
  },
  {
    title: "Marketplace",
    description: "Learn how to buy and sell agricultural products",
    icon: "Store",
    docs: [
      { title: "Buying Products", href: "/dashboard/resources/documentation/buying-guide" },
      { title: "Selling Products", href: "/dashboard/resources/documentation/selling-guide" },
      { title: "Payment Processing", href: "/dashboard/resources/documentation/payments" },
    ]
  },
  {
    title: "Community Features",
    description: "Connect with other farmers and agricultural experts",
    icon: "Users",
    docs: [
      { title: "Forums & Discussions", href: "/dashboard/resources/documentation/forums" },
      { title: "Organizations", href: "/dashboard/resources/documentation/organizations" },
      { title: "Messaging System", href: "/dashboard/resources/documentation/messaging" },
    ]
  },
  {
    title: "API Reference",
    description: "Technical documentation for developers",
    icon: "Code",
    docs: [
      { title: "Authentication", href: "/dashboard/resources/documentation/api-auth" },
      { title: "Endpoints", href: "/dashboard/resources/documentation/api-endpoints" },
      { title: "Rate Limits", href: "/dashboard/resources/documentation/api-rate-limits" },
    ]
  },
];

export default function DocumentationPage({
  params: { lang: _lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const _dict = getDictionary(_lang);
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Documentation"
        text="Comprehensive guides and reference materials for the AgriSmart platform."
      >
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="Search documentation..." />
          <Button type="submit">Search</Button>
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6 md:grid-cols-2">
        {documentationCategories.map((category, index) => (
          <Card key={index} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                {/* @ts-expect-error - Dynamic icon component */}
                {Icons[category.icon] && React.createElement(Icons[category.icon], { className: "h-5 w-5" })}
                <CardTitle>{category.title}</CardTitle>
              </div>
              <CardDescription>
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {category.docs.map((doc, docIndex) => (
                  <li key={docIndex}>
                    <Link 
                      href={doc.href}
                      className="flex items-center gap-2 text-sm text-foreground hover:underline"
                    >
                      <Icons.ArrowRight className="h-4 w-4" />
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Separator className="my-8" />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recently Updated</h2>
        <div className="divide-y divide-border rounded-md border">
          {[
            { title: "Platform Overview", date: "Updated March 15, 2025", href: "/dashboard/resources/documentation/platform-overview" },
            { title: "Selling Products", date: "Updated March 10, 2025", href: "/dashboard/resources/documentation/selling-guide" },
            { title: "API Authentication", date: "Updated March 5, 2025", href: "/dashboard/resources/documentation/api-auth" },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Icons.Post className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Link 
                    href={doc.href}
                    className="font-medium hover:underline"
                  >
                    {doc.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{doc.date}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={doc.href}>
                  View
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
