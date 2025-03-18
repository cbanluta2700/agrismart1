import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getDictionary } from "@/lib/langs";

export default async function CommunityPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);

  const features = [
    {
      title: dict.community.features.organizations.title,
      description: dict.community.features.organizations.description,
      icon: <Icons.users className="h-6 w-6" />,
      href: `/community/organizations`,
    },
    {
      title: dict.community.features.forums.title,
      description: dict.community.features.forums.description,
      icon: <Icons.messageSquare className="h-6 w-6" />,
      href: `/community/forums`,
    },
    {
      title: dict.community.features.members.title,
      description: dict.community.features.members.description,
      icon: <Icons.user className="h-6 w-6" />,
      href: `/community/members`,
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 rounded-md bg-primary/10 p-2 w-fit">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {/* Feature content will go here */}
            </CardContent>
            <CardFooter>
              <Link
                href={feature.href}
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                {dict.community.explore_button}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
