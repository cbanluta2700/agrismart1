import { Shell } from "@/components/shells/shell";
import { PageHeader } from "@/components/page-header";
import { getTranslations } from "next-intl/server";
import { getDictionary } from "@/lib/langs";

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const t = await getTranslations({ locale: lang, namespace: "Community" });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

interface CommunityLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default async function CommunityLayout({
  children,
  params: { lang },
}: CommunityLayoutProps) {
  const dict = await getDictionary(lang);

  return (
    <Shell>
      <PageHeader
        heading={dict.community.title}
        text={dict.community.description}
      />
      <div className="container pb-12 pt-4">{children}</div>
    </Shell>
  );
}
