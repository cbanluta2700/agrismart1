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
  title: "Saved Items",
  description: "View and manage your saved items in the AgriSmart marketplace",
};

export default async function FavoritesPage() {
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
        heading="Saved Items"
        text="View and manage products you've saved for later."
      >
        <Button variant="outline">
          <Icons.Post className="mr-2 h-4 w-4" />
          Create List
        </Button>
      </DashboardHeader>
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Heart" />
          <EmptyPlaceholder.Title>No saved items</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You haven&apos;t saved any items yet. Save products from the marketplace to view them here.
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
