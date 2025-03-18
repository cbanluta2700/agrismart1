import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { getDictionary } from "@/lib/langs";
import Link from "next/link";
import { OrganizationsList } from "@/components/community/organizations-list";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/auth";

export default async function OrganizationsPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);
  const session = await auth();
  
  return (
    <div className="container mx-auto space-y-8">
      <PageHeader
        heading={dict.community.organizations.title}
        text={dict.community.organizations.description}
      >
        <Link href="/community/organizations/create">
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            {dict.community.organizations.create_button}
          </Button>
        </Link>
      </PageHeader>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{dict.community.organizations.your_organizations}</CardTitle>
            <CardDescription>
              {dict.community.organizations.your_organizations_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* This component will be implemented later */}
            <OrganizationsList userId={session?.user.id} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{dict.community.organizations.discover}</CardTitle>
            <CardDescription>
              {dict.community.organizations.discover_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for organization discovery */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icons.users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {dict.community.organizations.example_names[i]}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {dict.community.organizations.example_member_count[i]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm">
                      {dict.community.organizations.example_descriptions[i]}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 p-3">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Icons.externalLink className="mr-2 h-4 w-4" />
                      {dict.community.organizations.view_button}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              {dict.community.organizations.browse_more}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
