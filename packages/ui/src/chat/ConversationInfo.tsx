"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../sheet";
import { Button } from "../button";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Badge } from "../badge";
import { Separator } from "../separator";
import { ScrollArea } from "../scroll-area";
import { ChevronRight, Users, UserPlus, LogOut, Crown, Trash, Edit, Info } from "lucide-react";
import { ConversationType } from "@saasfly/chat";
import { useSession } from "next-auth/react";
import { useToast } from "../use-toast";

// Types for users that we're dealing with in this component
interface ChatUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

// Extended conversation member with role information
interface ChatMember extends ChatUser {
  role: 'admin' | 'member';
}

interface ConversationInfoProps {
  conversation: ConversationType;
  currentUser: ChatUser;
  onEditGroup?: (groupId: string) => void;
}

export function ConversationInfo({
  conversation,
  currentUser,
  onEditGroup
}: ConversationInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const isGroup = conversation.isGroup;
  // The conversation might not have users property, so we'll adapt
  const otherParticipants = isGroup ? members.filter(m => m.id !== currentUser.id) : [];
  
  // Conversation display name - use title if available
  const displayName = conversation.title || 
    (isGroup ? "Group Chat" : otherParticipants[0]?.name || "Conversation");

  // Load group members
  const loadMembers = useCallback(async () => {
    if (!isGroup) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/chat/groups/${conversation.id}/members`);
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      } else {
        toast({
          title: "Error",
          description: "Failed to load group members",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading group members:', error);
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversation.id, isGroup, toast]);

  // Function to format members for display
  const formatMemberName = (user: ChatUser) => {
    if (user.id === session?.user?.id) {
      return `${user.name || user.email} (You)`;
    }
    return user.name || user.email || user.id;
  };

  // Check if current user is admin of the group
  const isCurrentUserAdmin = isGroup && 
    members.some(m => m.id === currentUser.id && m.role === 'admin');

  // Load members when the sheet is opened
  useEffect(() => {
    if (isOpen && isGroup) {
      loadMembers();
    }
  }, [isOpen, isGroup, loadMembers]);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground" 
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-4 w-4 mr-1" />
        Info
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="text-xl font-bold">
              {isGroup ? "Group Information" : "Chat Information"}
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6">
            {/* Profile Information */}
            <div className="flex flex-col items-center justify-center mb-6">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage 
                  src={isGroup ? 
                    (conversation.productImageUrl || '/images/group-avatar.png') : 
                    otherParticipants[0]?.image || '/images/default-avatar.png'
                  } 
                  alt={displayName} 
                />
                <AvatarFallback className="text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold mb-1">{displayName}</h2>
              
              {isGroup && (
                <Badge variant="outline" className="mb-2">
                  <Users className="h-3 w-3 mr-1" />
                  Group · {members.length} members
                </Badge>
              )}
            </div>
            
            {/* Group Management */}
            {isGroup && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Settings</h3>
                
                <div className="space-y-2">
                  {/* Edit Group */}
                  {isCurrentUserAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onEditGroup && onEditGroup(conversation.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Group
                    </Button>
                  )}
                  
                  {/* Manage Members */}
                  {isCurrentUserAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setIsManageMembersOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Members
                    </Button>
                  )}
                  
                  {/* Leave Group */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Group
                  </Button>
                </div>
              </div>
            )}
            
            {/* Members List */}
            {isGroup && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Members</h3>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback>
                            {member.name?.charAt(0) || member.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {formatMemberName(member)}
                            </span>
                            {member.role === 'admin' && (
                              <Badge variant="outline" className="gap-1 py-0 h-5">
                                <Crown className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate block">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
