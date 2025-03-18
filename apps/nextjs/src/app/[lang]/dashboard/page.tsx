import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@saasfly/ui/button";
import { ArrowRight } from "@saasfly/ui/icons";

import { auth } from "~/lib/auth";
import { redirectToRoleDashboard } from "~/lib/role-validation";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export default async function DashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const session = await auth();

  // Check if we're in a potential redirect loop by examining headers
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  const potentialLoop = referer.includes('dashboard') && referer.includes('redirect');

  // If there's a potential loop, show a fallback UI instead of redirecting
  if (potentialLoop) {
    const dict = await getDictionary(lang);
    return (
      <div className="container flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold mb-8">Welcome to AgriSmart</h1>
        <p className="text-xl text-center mb-12 max-w-2xl">
          Please select the appropriate dashboard based on your role:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Button asChild variant="outline" className="h-32 text-lg flex flex-col gap-2">
            <Link href={`/${lang}/dashboard/buyer`}>
              <span className="text-xl">Buyer Dashboard</span>
              <span className="text-sm text-muted-foreground">Browse and purchase agricultural products</span>
              <ArrowRight className="h-5 w-5 ml-2 mt-2" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-32 text-lg flex flex-col gap-2">
            <Link href={`/${lang}/dashboard/seller`}>
              <span className="text-xl">Seller Dashboard</span>
              <span className="text-sm text-muted-foreground">Manage your agricultural products</span>
              <ArrowRight className="h-5 w-5 ml-2 mt-2" />
            </Link>
          </Button>
        </div>
        
        <Button asChild variant="link" className="mt-8">
          <Link href={`/${lang}`}>
            Return to Homepage
          </Link>
        </Button>
      </div>
    );
  }

  // Normal flow - try to redirect to the appropriate dashboard
  try {
    redirectToRoleDashboard(session, lang);
  } catch (error) {
    // If redirection fails, return the user to the homepage
    return (
      <div className="container flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-bold mb-6">Dashboard Error</h1>
        <p className="mb-8">There was an issue accessing your dashboard.</p>
        <Button asChild>
          <Link href={`/${lang}`}>Return to Homepage</Link>
        </Button>
      </div>
    );
  }

  // This code will never execute due to the redirects above
  return null;
}
