import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { DashboardConfig } from "~/types";

export const getDashboardConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<DashboardConfig> => {
  const dict = await getDictionary(lang);

  return {
    mainNav: [
      {
        title: "Marketplace",
        href: "/marketplace",
      },
      {
        title: "Community",
        href: "/community",
      },
      {
        title: "Resources",
        href: "/resources",
      },
      {
        title: dict.common.dashboard.main_nav_documentation,
        href: "/docs",
      },
      {
        title: dict.common.dashboard.main_nav_support,
        href: "/support",
        disabled: true,
      },
    ],
    sidebarNav: [
      {
        id: "dashboard",
        title: dict.common.dashboard.sidebar_nav_clusters || "Dashboard",
        href: "/dashboard/",
      },
      {
        id: "marketplace",
        title: "Marketplace",
        href: "/dashboard/marketplace",
      },
      {
        id: "ai-assistant",
        title: "AI Assistant",
        href: "/dashboard/ai-assistant",
      },
      {
        id: "community",
        title: "Community",
        href: "/dashboard/community",
      },
      {
        id: "resources",
        title: "Resources",
        href: "/dashboard/resources",
      },
      {
        id: "buyer",
        title: "Buyer Dashboard",
        href: "/dashboard/buyer",
      },
      {
        id: "seller",
        title: "Seller Dashboard",
        href: "/dashboard/seller",
      },
      {
        id: "billing",
        title: dict.common.dashboard.sidebar_nav_billing || "Billing",
        href: "/dashboard/billing",
      },
      {
        id: "settings",
        title: dict.common.dashboard.sidebar_nav_settings || "Settings",
        href: "/dashboard/settings",
      },
    ],
  };
};
