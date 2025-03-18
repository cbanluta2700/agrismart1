import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/langs";
import { auth } from "@/auth";
import Link from "next/link";
import { GroupForm } from "@/components/community/group-form";

export default async function CreateGroupPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);
  const session = await auth();
  
  // Redirect to sign in if not authenticated
  if (!session) {
    redirect("/sign-in");
  }
  
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <PageHeader
        heading={dict.community.groups.create_new_group}
        text={dict.community.groups.create_group_description}
      />
      
      <div className="space-y-8">
        <GroupForm lang={lang} />
      </div>
    </div>
  );
}
