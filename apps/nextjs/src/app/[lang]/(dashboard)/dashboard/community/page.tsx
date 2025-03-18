import React from "react";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Community Dashboard",
};

export default async function DashboardCommunityPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Community"
        text="Engage with the agricultural community, join groups, and participate in discussions."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="divide-y divide-border rounded-md border">
          <div className="p-6">
            <h2 className="mb-2 text-xl font-semibold">My Groups</h2>
            <p className="text-muted-foreground">View and manage the community groups you've joined.</p>
          </div>
        </div>
        <div className="divide-y divide-border rounded-md border">
          <div className="p-6">
            <h2 className="mb-2 text-xl font-semibold">Forum Activities</h2>
            <p className="text-muted-foreground">Track your recent discussions and posts in the community forums.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
