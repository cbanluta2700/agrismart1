"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Globe, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface UserProfile {
  bio?: string | null;
  location?: string | null;
  skills?: string[] | null;
  title?: string | null;
  company?: string | null;
  website?: string | null;
}

interface MemberCardProps {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  userProfile?: UserProfile | null;
  lang: string;
}

export function MemberCard({ 
  id, 
  name, 
  email, 
  image, 
  role,
  userProfile,
  lang
}: MemberCardProps) {
  const t = useTranslations("Community.members");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Generate initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Function to handle connection request
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // In a full implementation, this would send a connection request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(t("connection_sent"));
    } catch (error) {
      toast.error(t("connection_error"));
    } finally {
      setIsConnecting(false);
    }
  };

  const displayName = name || email?.split("@")[0] || t("unknown_user");
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={image || ""} alt={displayName} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <Link 
            href={`/${lang}/community/members/${id}`} 
            className="text-lg font-semibold hover:underline overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {displayName}
          </Link>
          {userProfile?.title && (
            <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
              {userProfile.title}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        {userProfile?.bio ? (
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {userProfile.bio}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            {t("no_bio")}
          </p>
        )}
        
        <div className="mt-4 space-y-2">
          {userProfile?.company && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{userProfile.company}</span>
            </div>
          )}
          
          {userProfile?.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{userProfile.location}</span>
            </div>
          )}
          
          {userProfile?.website && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <a 
                href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline truncate"
              >
                {userProfile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
        
        {userProfile?.skills && userProfile.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {userProfile.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {userProfile.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{userProfile.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <Button asChild variant="ghost" size="sm">
          <a href={`mailto:${email}`}>
            <Mail className="h-4 w-4 mr-2" />
            {t("contact")}
          </a>
        </Button>
        <Button 
          onClick={handleConnect} 
          size="sm"
          disabled={isConnecting}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isConnecting ? t("connecting") : t("connect")}
        </Button>
      </CardFooter>
    </Card>
  );
}
