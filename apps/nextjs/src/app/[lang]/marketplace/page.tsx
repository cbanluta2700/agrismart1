import { redirect } from 'next/navigation';
import type { Locale } from "~/config/i18n-config";

// This is a redirector page that sends visitors to the proper marketplace page in the marketing group
export default function MarketplaceRedirectPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  // Redirect to the marketing version of the marketplace
  redirect(`/${lang}/(marketing)/marketplace`);
}
