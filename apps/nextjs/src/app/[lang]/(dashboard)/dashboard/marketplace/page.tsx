import React from "react";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Marketplace Dashboard",
};

export default async function DashboardMarketplacePage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Marketplace"
        text="Manage your marketplace products, orders, and transactions."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="divide-y divide-border rounded-md border">
          <div className="p-6">
            <h2 className="mb-2 text-xl font-semibold">My Products</h2>
            <p className="text-muted-foreground">Manage your listed products and services in the marketplace.</p>
          </div>
        </div>
        <div className="divide-y divide-border rounded-md border">
          <div className="p-6">
            <h2 className="mb-2 text-xl font-semibold">My Orders</h2>
            <p className="text-muted-foreground">Track your purchases and sales orders.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
