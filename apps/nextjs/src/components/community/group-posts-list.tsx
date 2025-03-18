import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useTranslations } from "next-intl";

interface GroupPostsListProps {
  posts: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      avatarUrl?: string;
      role?: string;
    };
    images?: string[];
    likeCount: number;
    commentCount: number;
    isLiked?: boolean;
    groupId: string;
  }>;
  lang: string;
}

export function GroupPostsList({ posts, lang }: GroupPostsListProps) {
  const t = useTranslations("Community.groups");

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    {post.author.role && (
                      <span className="ml-2 text-primary">{post.author.role}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Icons.moreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>{post.content}</p>
            </div>
            
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {post.images.map((image, index) => (
                  <div 
                    key={index}
                    className="aspect-video bg-muted rounded-md overflow-hidden relative"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t py-3 flex justify-between">
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="gap-1">
                <Icons.heart className={`h-4 w-4 ${post.isLiked ? 'fill-current text-red-500' : ''}`} />
                <span>{post.likeCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href={`/community/groups/${post.groupId}/posts/${post.id}`}>
                  <Icons.messageSquare className="h-4 w-4" />
                  <span>{post.commentCount}</span>
                </Link>
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Icons.share className="h-4 w-4 mr-1" />
              {t("share")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
