import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";

interface GroupListProps {
  groups: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage?: string;
    privacy: 'public' | 'private' | 'secret';
    memberCount: number;
    postCount: number;
    createdAt: Date;
    topics: string[];
    recentActivity?: Array<{
      type: string;
      date: Date;
      user: {
        id: string;
        name: string;
        avatarUrl?: string;
      };
      content: string;
    }>;
  }>;
  lang: string;
  showLastActivity?: boolean;
}

export function GroupList({ groups, lang, showLastActivity = false }: GroupListProps) {
  const t = useTranslations("Community.groups");
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map((group) => (
        <Card key={group.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-40 w-full">
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
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <Badge variant={group.privacy === 'public' ? 'outline' : 'secondary'}>
                    {group.privacy === 'public' 
                      ? t("public") 
                      : group.privacy === 'private' 
                        ? t("private") 
                        : t("secret")}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-white">
                    <Icons.users className="h-3 w-3" />
                    <span>{group.memberCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Link href={`/community/groups/${group.id}`} className="hover:underline">
              <h3 className="text-lg font-medium">{group.name}</h3>
            </Link>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {group.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {group.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icons.calendarDays className="h-3 w-3" />
                <span>{t("created")} {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icons.messageSquare className="h-3 w-3" />
                <span>{group.postCount} {t("posts")}</span>
              </div>
            </div>
            
            {showLastActivity && group.recentActivity && group.recentActivity.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group.recentActivity[0].user.avatarUrl} alt={group.recentActivity[0].user.name} />
                    <AvatarFallback>{group.recentActivity[0].user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm line-clamp-2">
                      {group.recentActivity[0].content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(group.recentActivity[0].date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-3 flex justify-end">
            <Button asChild>
              <Link href={`/community/groups/${group.id}`}>
                {t("visit_group")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
