import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { getDictionary } from "@/lib/langs";
import { auth } from "@/auth";
import { Textarea } from "@/components/ui/textarea";
import { GroupPostsList } from "@/components/community/group-posts-list";
import { GroupMembersList } from "@/components/community/group-members-list";
import { 
  getDiscussionGroupById, 
  getGroupMembers,
  getGroupPosts,
  isGroupMember,
  getUserGroupRole,
} from "@/lib/community/discussion-groups";

export default async function GroupPage({
  params: { lang, id },
}: {
  params: { lang: string; id: string };
}) {
  const dict = await getDictionary(lang);
  const session = await auth();
  
  // Fetch the group
  const group = await getDiscussionGroupById(id);
  
  if (!group) {
    notFound();
  }
  
  // Fetch group members
  const members = await getGroupMembers(id);
  
  // Fetch group posts
  const posts = await getGroupPosts(id);
  
  // Check if current user is a member
  const isMember = session?.user?.id ? await isGroupMember(session.user.id, id) : false;
  
  // Get user's role in the group if they're a member
  const userRole = session?.user?.id ? await getUserGroupRole(session.user.id, id) : null;
  
  // Check if the group is accessible
  const canAccess = group.privacy === "public" || isMember;
  
  if (!canAccess) {
    return (
      <div className="container mx-auto max-w-4xl py-16">
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <Icons.lock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{dict.community.groups.private_group}</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {dict.community.groups.private_group_description}
            </p>
            <div className="flex justify-center pt-4">
              <Button asChild>
                <Link href="/community/groups">
                  {dict.community.groups.back_to_groups}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="relative h-48 sm:h-64 w-full rounded-b-lg overflow-hidden">
        {group.coverImage ? (
          <Image
            src={group.coverImage}
            alt={group.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
            <Icons.users className="h-16 w-16 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={group.privacy === 'public' ? 'outline' : 'secondary'}>
                  {group.privacy === 'public' 
                    ? dict.community.groups.public 
                    : group.privacy === 'private' 
                      ? dict.community.groups.private 
                      : dict.community.groups.secret}
                </Badge>
                <span className="text-sm text-white">
                  {group.memberCount} {dict.community.groups.members}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            </div>
            <div className="flex gap-2">
              {isMember ? (
                <>
                  <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
                    <Icons.bell className="mr-2 h-4 w-4" />
                    {dict.community.groups.notifications}
                  </Button>
                  {(userRole === "owner" || userRole === "admin") && (
                    <Button variant="outline" asChild className="bg-background/80 backdrop-blur-sm">
                      <Link href={`/community/groups/${id}/manage`}>
                        <Icons.settings className="mr-2 h-4 w-4" />
                        {dict.community.groups.manage}
                      </Link>
                    </Button>
                  )}
                </>
              ) : session ? (
                <Button>
                  <Icons.userPlus className="mr-2 h-4 w-4" />
                  {dict.community.groups.join_group}
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/sign-in">
                    {dict.community.groups.sign_in_to_join}
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="bg-background/80 backdrop-blur-sm">
                <Link href="/community/groups">
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  {dict.community.groups.back}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="posts">
                  {dict.community.groups.posts}
                </TabsTrigger>
                <TabsTrigger value="about">
                  {dict.community.groups.about}
                </TabsTrigger>
              </TabsList>
              
              {isMember && (
                <Button asChild>
                  <Link href={`/community/groups/${id}/new-post`}>
                    <Icons.plus className="mr-2 h-4 w-4" />
                    {dict.community.groups.new_post}
                  </Link>
                </Button>
              )}
            </div>
            
            <TabsContent value="posts" className="mt-0 space-y-6">
              {isMember ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {session?.user?.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder={dict.community.groups.whats_on_your_mind}
                          className="resize-none mb-2"
                          disabled={!isMember}
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm">
                              <Icons.image className="mr-1 h-4 w-4" />
                              {dict.community.groups.photo}
                            </Button>
                            <Button type="button" variant="outline" size="sm">
                              <Icons.paperclip className="mr-1 h-4 w-4" />
                              {dict.community.groups.file}
                            </Button>
                          </div>
                          <Button size="sm">
                            {dict.community.groups.post}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {session ? 
                        dict.community.groups.join_to_post : 
                        dict.community.groups.sign_in_to_post}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {posts.length > 0 ? (
                <GroupPostsList posts={posts} lang={lang} />
              ) : (
                <Card className="text-center py-12">
                  <CardContent className="space-y-4">
                    <Icons.messageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">
                      {dict.community.groups.no_posts_yet}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {dict.community.groups.no_posts_description}
                    </p>
                    {isMember && (
                      <Button asChild className="mt-2">
                        <Link href={`/community/groups/${id}/new-post`}>
                          <Icons.plus className="mr-2 h-4 w-4" />
                          {dict.community.groups.create_first_post}
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="about" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{dict.community.groups.about_this_group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{group.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{dict.community.groups.topics}</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{dict.community.groups.created}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString(lang, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>{dict.community.groups.group_rules}</CardTitle>
                    {(userRole === "owner" || userRole === "admin") && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/community/groups/${id}/manage/rules`}>
                          <Icons.edit className="mr-2 h-4 w-4" />
                          {dict.community.groups.edit_rules}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* In a real app, these would be dynamic rules set by group admins */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">{dict.community.groups.be_respectful}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dict.community.groups.be_respectful_description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">{dict.community.groups.stay_on_topic}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dict.community.groups.stay_on_topic_description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">{dict.community.groups.no_self_promotion}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dict.community.groups.no_self_promotion_description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{dict.community.groups.members}</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupMembersList members={members.slice(0, 5)} lang={lang} />
            </CardContent>
            {members.length > 5 && (
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href={`/community/groups/${id}/members`}>
                    {dict.community.groups.view_all_members}
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{dict.community.groups.share_group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Icons.share className="mr-2 h-4 w-4" />
                  {dict.community.groups.share}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Icons.link className="mr-2 h-4 w-4" />
                  {dict.community.groups.copy_link}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1">
                  <Icons.facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Icons.twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Icons.linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Icons.mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {!isMember && session && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Icons.users className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">{dict.community.groups.join_community}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {dict.community.groups.join_benefits}
                </p>
                <Button className="w-full">
                  <Icons.userPlus className="mr-2 h-4 w-4" />
                  {dict.community.groups.join_group}
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{dict.community.groups.similar_groups}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* This would be dynamically populated in a real app */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Icons.tractor className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">AgTech Innovators</h4>
                    <p className="text-xs text-muted-foreground">76 members</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {dict.community.groups.view}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Icons.leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">New Farmer Support Network</h4>
                    <p className="text-xs text-muted-foreground">142 members</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {dict.community.groups.view}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
