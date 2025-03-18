import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/langs";
import { OrganizationForm } from "@/components/community/organization-form";
import { Separator } from "@/components/ui/separator";

export default async function CreateOrganizationPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        heading={dict.community.organizations.create_title}
        text={dict.community.organizations.create_description}
      />
      
      <Separator className="my-6" />
      
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{dict.community.organizations.form_title}</CardTitle>
            <CardDescription>
              {dict.community.organizations.form_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationForm lang={lang} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
