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
  title: "Products",
  description: "Manage your products in the AgriSmart marketplace",
};

export default async function ProductsPage() {
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
        heading="Products"
        text="Manage your products in the AgriSmart marketplace."
      >
        <Button>
          <Icons.Add className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </DashboardHeader>
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Page" />
          <EmptyPlaceholder.Title>No products created</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any products yet. Start adding products to your store.
          </EmptyPlaceholder.Description>
          <Button>
            <Icons.Add className="mr-2 h-4 w-4" />
            Create New Product
          </Button>
        </EmptyPlaceholder>
      </div>
    </DashboardShell>
  );
}
