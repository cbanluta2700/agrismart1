import React from "react";
import Link from "next/link";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import { Input } from "@saasfly/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader } from "@saasfly/ui/table";
import type { Locale } from "~/config/i18n-config";
// _getDictionary is unused, so it's prefixed with an underscore
// import { _getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Knowledge Base - AgriSmart Resources",
};

// Placeholder data for knowledge base articles
const knowledgeBaseArticles = [
  {
    id: "kb-1",
    title: "Sustainable Farming Practices",
    description: "Learn about sustainable farming techniques to improve soil health and crop yields.",
    category: "farming",
    readTime: "8 min read",
    date: "Mar 10, 2025",
  },
  {
    id: "kb-2",
    title: "Water Conservation Methods",
    description: "Effective strategies for managing water resources in agricultural operations.",
    category: "water-management",
    readTime: "5 min read",
    date: "Mar 05, 2025",
  },
  {
    id: "kb-3",
    title: "Pest Management Without Chemicals",
    description: "Natural approaches to pest control that reduce reliance on chemical pesticides.",
    category: "pest-control",
    readTime: "10 min read",
    date: "Feb 28, 2025",
  },
  {
    id: "kb-4",
    title: "Seasonal Planting Guide",
    description: "When to plant various crops based on your climate zone and seasonal changes.",
    category: "planting",
    readTime: "7 min read",
    date: "Feb 20, 2025",
  },
];

export default function KnowledgeBasePage({
  params: { lang: _lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Knowledge Base"
        text="Access articles, guides, and resources to enhance your agricultural knowledge."
      >
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="Search knowledge base..." />
          <Button type="submit">Search</Button>
        </div>
      </DashboardHeader>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="farming">Farming</TabsTrigger>
          <TabsTrigger value="water-management">Water Management</TabsTrigger>
          <TabsTrigger value="pest-control">Pest Control</TabsTrigger>
          <TabsTrigger value="planting">Planting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeBaseArticles.map((article) => (
              <Card key={article.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription>
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-2 rounded-full bg-muted px-2 py-1">{article.category}</span>
                    <span className="mr-2">{article.readTime}</span>
                    <span>{article.date}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/resources/knowledge-base/${article.id}`}>
                      Read Article
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* The other tab contents would filter the articles by category */}
        <TabsContent value="farming" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeBaseArticles
              .filter(article => article.category === "farming")
              .map((article) => (
                <Card key={article.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2 rounded-full bg-muted px-2 py-1">{article.category}</span>
                      <span className="mr-2">{article.readTime}</span>
                      <span>{article.date}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/resources/knowledge-base/${article.id}`}>
                        Read Article
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Similar tab contents for other categories */}
      </Tabs>
    </DashboardShell>
  );
}
