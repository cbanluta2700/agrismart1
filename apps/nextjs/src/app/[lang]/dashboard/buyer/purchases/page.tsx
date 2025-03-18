import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@saasfly/auth";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { EmptyPlaceholder } from "~/components/empty-placeholder";

export const metadata: Metadata = {
  title: "My Purchases",
  description: "View your purchase history in the AgriSmart marketplace",
};

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user has the buyer role
  if (session.user.role !== "buyer" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Purchases"
        text="View your purchase history and track your orders."
      >
        <Button variant="outline">
          <Icons.Settings className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </DashboardHeader>
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Billing" />
          <EmptyPlaceholder.Title>No purchases yet</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You haven&apos;t made any purchases yet. Start shopping in the marketplace to see your purchase history.
          </EmptyPlaceholder.Description>
          <Button>
            <Icons.ArrowRight className="mr-2 h-4 w-4" />
            Browse Marketplace
          </Button>
        </EmptyPlaceholder>
      </div>
    </DashboardShell>
  );
}
