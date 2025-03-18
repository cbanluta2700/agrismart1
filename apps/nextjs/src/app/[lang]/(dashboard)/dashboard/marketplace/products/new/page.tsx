import React from "react";
import { redirect } from "next/navigation";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { authOptions, getCurrentUser } from "@saasfly/auth";
import { ProductForm } from "../components/product-form";

export const metadata = {
  title: "New Product",
  description: "Create a new product to sell in the marketplace.",
};

export default async function NewProductPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const user = await getCurrentUser();
  
  // Redirect if user not authenticated or not a seller
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }
  
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create Product"
        text="Add a new product to the marketplace."
      />
      <div className="grid gap-10">
        <ProductForm user={user} />
      </div>
    </DashboardShell>
  );
}
