import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserPlus, MoreVertical, Settings } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface GroupMembersListProps {
  members: Array<{
    id: string;
    userId: string;
    name: string;
    avatarUrl?: string;
    joinedAt: Date;
    role: "owner" | "admin" | "moderator" | "member";
    isOnline?: boolean;
  }>;
  lang: string;
  showActions?: boolean;
}

export function GroupMembersList({ members, lang, showActions = false }: GroupMembersListProps) {
  const t = useTranslations("Community.groups");
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "moderator":
        return "outline";
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-3">
      {members.map((member, index) => (
        <div key={member.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {member.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/community/members/${member.userId}`} className="font-medium hover:underline">
                    {member.name}
                  </Link>
                  {member.role !== "member" && getRoleBadgeVariant(member.role) && (
                    <Badge variant={getRoleBadgeVariant(member.role) as any} className="text-[10px]">
                      {t(`role_${member.role}`)}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("joined")} {new Date(member.joinedAt).toLocaleDateString(lang, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {index < members.length - 1 && <Separator className="mt-3" />}
        </div>
      ))}
    </div>
  );
}
