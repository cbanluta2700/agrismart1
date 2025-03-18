import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { getDictionary } from "@/lib/langs";
import Link from "next/link";
import { ForumCategoryList } from "@/components/community/forum-category-list";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { getForumStats } from "@/lib/community/forums";

export default async function ForumsPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);
  // In a real implementation, this would fetch stats from the database
  const stats = await getForumStats();
  
  return (
    <div className="container mx-auto space-y-8">
      <PageHeader
        heading={dict.community.forums.title}
        text={dict.community.forums.description}
      >
        <Link href="/community/forums/new-topic">
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            {dict.community.forums.create_topic_button}
          </Button>
        </Link>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{dict.community.forums.categories}</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={dict.community.forums.search_placeholder}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ForumCategoryList lang={lang} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{dict.community.forums.latest_topics}</CardTitle>
              <CardDescription>
                {dict.community.forums.latest_topics_description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icons.user className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link 
                        href={`/community/forums/topic/${i}`}
                        className="font-medium hover:underline"
                      >
                        {dict.community.forums.example_topics[i % dict.community.forums.example_topics.length]}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {dict.community.forums.example_authors[i % dict.community.forums.example_authors.length]} • {dict.community.forums.example_times[i % dict.community.forums.example_times.length]}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Icons.messageSquare className="mr-1 h-3 w-3" />
                          {Math.floor(Math.random() * 15) + 1}
                        </div>
                        <div className="flex items-center">
                          <Icons.eye className="mr-1 h-3 w-3" />
                          {Math.floor(Math.random() * 200) + 50}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                {dict.community.forums.view_all_topics}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dict.community.forums.forum_stats}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {dict.community.forums.total_topics}
                  </span>
                  <span className="font-medium">{stats.topics}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {dict.community.forums.total_posts}
                  </span>
                  <span className="font-medium">{stats.posts}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {dict.community.forums.total_members}
                  </span>
                  <span className="font-medium">{stats.members}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {dict.community.forums.newest_member}
                  </span>
                  <span className="font-medium">{stats.newestMember}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{dict.community.forums.active_members}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.activeMembers.map((member, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Icons.user className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.posts} {dict.community.forums.posts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
