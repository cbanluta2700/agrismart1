import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { Locale } from "~/config/i18n-config";

export default async function DashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session || !session.user) {
    redirect(`/${lang}/login`);
  }

  // Get user role and redirect to appropriate dashboard
  const userRole = session.user.role;

  switch (userRole) {
    case "BUYER":
      redirect(`/${lang}/dashboard/buyer`);
    case "SELLER":
      redirect(`/${lang}/dashboard/seller`);
    case "MODERATOR":
      redirect(`/${lang}/dashboard/moderator`);
    case "ADMIN":
      redirect(`/${lang}/dashboard/admin`);
    default:
      // Default to buyer dashboard if role is not specified
      redirect(`/${lang}/dashboard/buyer`);
  }

  // This code will never execute due to the redirects above
  return null;
}
