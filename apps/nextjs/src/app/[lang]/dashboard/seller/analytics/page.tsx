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
  title: "Sales Analytics",
  description: "View analytics and insights for your AgriSmart products",
};

export default async function AnalyticsPage() {
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
        heading="Sales Analytics"
        text="Monitor your sales performance and product insights."
      >
        <Button variant="outline">
          <Icons.Dashboard className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </DashboardHeader>
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Dashboard" />
          <EmptyPlaceholder.Title>No analytics available</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any sales data yet. Analytics will appear here once you start selling products.
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      </div>
    </DashboardShell>
  );
}
