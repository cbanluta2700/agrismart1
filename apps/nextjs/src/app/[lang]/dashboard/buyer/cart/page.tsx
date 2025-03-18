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
  title: "Shopping Cart",
  description: "View and manage items in your AgriSmart shopping cart",
};

export default async function CartPage() {
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
        heading="Shopping Cart"
        text="Review and checkout items in your cart."
      >
        <Button>
          <Icons.Billing className="mr-2 h-4 w-4" />
          Checkout
        </Button>
      </DashboardHeader>
      <div>
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="Billing" />
          <EmptyPlaceholder.Title>Your cart is empty</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any items in your cart. Add products from the marketplace to get started.
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
