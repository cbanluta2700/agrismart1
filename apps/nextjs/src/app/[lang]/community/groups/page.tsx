import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDictionary } from "@/lib/langs";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import {
  getDiscussionGroups,
  getPopularGroupTopics,
} from "@/lib/community/discussion-groups";
import { GroupList } from "@/components/community/group-list";

export default async function GroupsPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const dict = await getDictionary(lang);
  const session = await auth();
  
  // Parse search parameters
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : '';
  const selectedTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'discover';
  
  // Fetch groups - this would filter based on search in a real implementation
  const groups = await getDiscussionGroups(selectedTab === 'my' ? session?.user?.id : undefined);
  
  // Get popular topics
  const popularTopics = await getPopularGroupTopics();
  
  return (
    <div className="container mx-auto space-y-8">
      <PageHeader
        heading={dict.community.groups.title}
        text={dict.community.groups.description}
      >
        <Button asChild>
          <Link href="/community/groups/create">
            <Icons.plus className="mr-2 h-4 w-4" />
            {dict.community.groups.create_group}
          </Link>
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="relative">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder={dict.community.groups.search_placeholder}
              defaultValue={searchQuery}
              className="w-full pl-8"
            />
          </div>
          
          <Card>
            <CardHeader>
              <h3 className="font-medium">{dict.community.groups.popular_topics}</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {popularTopics.slice(0, 10).map((topic) => (
                  <Link
                    key={topic.topic}
                    href={`/community/groups?topic=${encodeURIComponent(topic.topic)}`}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted"
                  >
                    {topic.topic}
                    <span className="ml-1 text-muted-foreground">({topic.count})</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="font-medium">{dict.community.groups.need_help}</h3>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert">
              <p>{dict.community.groups.help_description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/community/forums">
                  <Icons.helpCircle className="mr-2 h-4 w-4" />
                  {dict.community.groups.visit_forums}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue={selectedTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="discover" asChild>
                <Link href="/community/groups?tab=discover">
                  {dict.community.groups.discover_tab}
                </Link>
              </TabsTrigger>
              {session && (
                <TabsTrigger value="my" asChild>
                  <Link href="/community/groups?tab=my">
                    {dict.community.groups.my_groups_tab}
                  </Link>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="discover" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">
                    {groups.length} {dict.community.groups.groups_found}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dict.community.groups.sort_by}:
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      {dict.community.groups.sort_popular}
                      <Icons.chevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <GroupList groups={groups} lang={lang} />
              </div>
            </TabsContent>
            
            <TabsContent value="my" className="mt-0">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">
                      {groups.length} {dict.community.groups.my_groups}
                    </h2>
                    <Button asChild>
                      <Link href="/community/groups/create">
                        <Icons.plus className="mr-2 h-4 w-4" />
                        {dict.community.groups.create_group}
                      </Link>
                    </Button>
                  </div>
                  
                  {groups.length > 0 ? (
                    <GroupList groups={groups} lang={lang} showLastActivity />
                  ) : (
                    <Card className="flex flex-col items-center justify-center py-10 text-center">
                      <Icons.users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        {dict.community.groups.no_groups_yet}
                      </h3>
                      <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                        {dict.community.groups.groups_empty_state}
                      </p>
                      <Button asChild>
                        <Link href="/community/groups/create">
                          <Icons.plus className="mr-2 h-4 w-4" />
                          {dict.community.groups.create_first_group}
                        </Link>
                      </Button>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="flex flex-col items-center justify-center py-10 text-center">
                  <Icons.lock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    {dict.community.groups.sign_in_required}
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                    {dict.community.groups.sign_in_description}
                  </p>
                  <Button asChild>
                    <Link href="/sign-in">
                      {dict.community.groups.sign_in}
                    </Link>
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
