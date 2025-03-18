import React from "react";
import { Metadata } from "next";
import Link from "next/link";

import { DashboardShell as Shell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { getCurrentUser } from "@saasfly/auth";
import ShopWithSidebar from "./components/ShopWithSidebar";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "AgriSmart Marketplace",
    description: "Buy and sell agricultural products, equipment, and services",
  };
};

export default async function MarketplacePage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  const sellerProfileLink = user 
    ? `/${lang}/dashboard/marketplace/seller-profile` 
    : `/${lang}/login?callbackUrl=/${lang}/dashboard/marketplace/seller-profile&feature=seller`;
  
  return (
    <Shell className="max-w-7xl px-4">
      <div className="py-8">
        <h1 className="mb-6 text-center text-4xl font-bold text-primary">AgriSmart Marketplace</h1>
        <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground mb-10">
          Welcome to the AgriSmart Marketplace, where farmers and suppliers can connect, 
          buy and sell agricultural products, equipment, and services.
        </p>
        
        {/* NextMerce marketplace integration */}
        <ShopWithSidebar />
        
        <div className="mt-12 rounded-lg border bg-muted/50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Sell on AgriSmart</h2>
          <p className="mb-6">
            Reach thousands of farmers and agricultural businesses. Create your seller profile today and start listing your products or services.
          </p>
          <Link href={sellerProfileLink}>
            <Button className="font-medium">
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
