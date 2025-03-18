import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { getUserOrganizations } from "@/lib/community/organizations";
import { EmptyPlaceholder } from "@/components/empty-placeholder";

interface OrganizationsListProps {
  userId?: string;
}

export async function OrganizationsList({ userId }: OrganizationsListProps) {
  // In a real implementation, this would fetch organizations from the database
  const organizations = userId ? await getUserOrganizations(userId) : [];

  if (!organizations.length) {
    return (
      <EmptyPlaceholder>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Icons.users className="h-10 w-10 text-muted-foreground" />
        </div>
        <EmptyPlaceholder.Title>No organizations yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You aren&apos;t a member of any organizations yet. Create one or join existing ones.
        </EmptyPlaceholder.Description>
        <Link href="/community/organizations/create">
          <Button variant="outline">Create an organization</Button>
        </Link>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <Card key={org.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={org.imageUrl} alt={org.name} />
                <AvatarFallback>
                  {org.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{org.name}</CardTitle>
                <CardDescription className="text-xs">
                  {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm line-clamp-3">{org.description}</p>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-3">
            <Link href={`/community/organizations/${org.id}`} className="w-full">
              <Button variant="ghost" size="sm" className="w-full">
                <Icons.externalLink className="mr-2 h-4 w-4" />
                View organization
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
