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
  title: "Orders Management",
  description: "Manage customer orders for your AgriSmart products",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user has the seller role
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Orders Management"
        text="View and manage customer orders for your products."
      >
        <Button variant="outline">
          <Icons.ArrowRight className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </DashboardHeader>
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Billing" />
          <EmptyPlaceholder.Title>No orders yet</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You haven&apos;t received any orders yet. When customers purchase your products, their orders will appear here.
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      </div>
    </DashboardShell>
  );
}
