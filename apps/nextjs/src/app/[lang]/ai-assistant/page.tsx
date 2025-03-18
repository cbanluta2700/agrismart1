import { redirect } from 'next/navigation';
import type { Locale } from "~/config/i18n-config";

// This is a redirector page that sends visitors to the proper AI Assistant page in the marketing group
export default function AIAssistantRedirectPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  // Redirect to the marketing version of the AI Assistant page
  redirect(`/${lang}/(marketing)/ai-assistant`);
}
