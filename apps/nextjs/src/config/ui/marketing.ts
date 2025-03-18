import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { MarketingConfig } from "~/types";

export const getMarketingConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<MarketingConfig> => {
  const dict = await getDictionary(lang);
  // Use any as an intermediate type for safe type casting
  const marketing = dict.marketing as any;
  
  // Default strings to use if translations are missing
  const defaultLabels = {
    main_nav_ai_assistant: "AI Assistant",
    main_nav_marketplace: "Marketplace",
    main_nav_community: "Community", 
    main_nav_resources: "Resources",
    main_nav_pricing: "Pricing",
    main_nav_documentation: "Documentation"
  };
  
  return {
    mainNav: [
      {
        title: (marketing.main_nav_ai_assistant as string) || defaultLabels.main_nav_ai_assistant,
        href: `/${lang}/ai-assistant`,
      },
      {
        title: (marketing.main_nav_marketplace as string) || defaultLabels.main_nav_marketplace,
        href: `/${lang}/marketplace`,
      },
      {
        title: (marketing.main_nav_community as string) || defaultLabels.main_nav_community,
        href: `/${lang}/community`,
      },
      {
        title: (marketing.main_nav_resources as string) || defaultLabels.main_nav_resources,
        href: `/${lang}/resources`,
      },
      {
        title: (marketing.main_nav_pricing as string) || defaultLabels.main_nav_pricing,
        href: `/${lang}/pricing`,
      },
      {
        title: (marketing.main_nav_documentation as string) || defaultLabels.main_nav_documentation,
        href: `/${lang}/docs`,
      },
    ],
  };
};
