import React from "react";
import { Metadata } from "next";
import Link from "next/link";

import { DashboardShell as Shell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "AgriSmart AI Assistant",
    description: "Get farming advice, market insights, and agricultural support from our AI assistant",
  };
};

export default async function AIAssistantPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Determine target links based on authentication status
  const getTargetLink = (feature: string) => {
    return user 
      ? `/${lang}/dashboard/ai-assistant/${feature}` 
      : `/${lang}/login?callbackUrl=/${lang}/dashboard/ai-assistant/${feature}&feature=${feature}`;
  };
  
  return (
    <Shell className="max-w-7xl px-4">
      <div className="py-8">
        <h1 className="mb-6 text-center text-4xl font-bold text-primary">AgriSmart AI Assistant</h1>
        <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground mb-10">
          Get instant farming advice, market insights, and agricultural support from our intelligent AI assistant.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-md border border-border">
            <h2 className="text-2xl font-bold mb-4 text-primary">Farming Knowledge</h2>
            <p className="mb-4 text-muted-foreground">
              Access a vast database of agricultural knowledge, crop management techniques, 
              pest control strategies, and sustainable farming practices.
            </p>
            <Link href={getTargetLink("farming-knowledge")}>
              <Button className="w-full">Ask About Farming</Button>
            </Link>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-md border border-border">
            <h2 className="text-2xl font-bold mb-4 text-primary">Market Insights</h2>
            <p className="mb-4 text-muted-foreground">
              Get real-time market data, price trends, demand forecasts, and selling 
              recommendations to maximize your profits.
            </p>
            <Link href={getTargetLink("market-insights")}>
              <Button className="w-full">Explore Market Data</Button>
            </Link>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-md border border-border">
            <h2 className="text-2xl font-bold mb-4 text-primary">Equipment Guidance</h2>
            <p className="mb-4 text-muted-foreground">
              Find the right agricultural equipment for your needs, with personalized 
              recommendations based on your farm size, crop types, and budget.
            </p>
            <Link href={getTargetLink("equipment-guidance")}>
              <Button className="w-full">Get Equipment Advice</Button>
            </Link>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-md border border-border">
            <h2 className="text-2xl font-bold mb-4 text-primary">Weather Planning</h2>
            <p className="mb-4 text-muted-foreground">
              Access climate data interpretation and weather-based planting recommendations
              to optimize your farming calendar and increase yields.
            </p>
            <Link href={getTargetLink("weather-planning")}>
              <Button className="w-full">Check Weather Insights</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-primary/10 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Sign up or login to access the full capabilities of the AgriSmart AI Assistant
            and revolutionize your farming approach with data-driven insights.
          </p>
          <div className="flex justify-center gap-4">
            <Link href={`/${lang}/register`}>
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link href={`/${lang}/login`}>
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
