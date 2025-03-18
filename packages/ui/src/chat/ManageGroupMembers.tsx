import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../dialog';
import { Button } from '../button';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Input } from '../input';
import { ScrollArea } from '../scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../dropdown-menu';
import { Check, MoreVertical, Shield, UserPlus, X } from 'lucide-react';
import { Badge } from '../badge';
import { Separator } from '../separator';
import { useToast } from '../use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt?: Date;
  user: User;
}

interface ManageGroupMembersProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentUserId: string;
}

export function ManageGroupMembers({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentUserId
}: ManageGroupMembersProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const { toast } = useToast();

  // Check if current user is an admin
  const isCurrentUserAdmin = members.some(
    member => member.userId === currentUserId && member.role === 'admin'
  );

  // Fetch group members
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch(`/api/chat/groups/members?groupId=${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to load group members",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch available users to add
  const fetchAvailableUsers = async () => {
    if (!showAddMembers) return;
    
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/chat/users');
      if (response.ok) {
        const data = await response.json();
        // Filter out users who are already members
        const memberUserIds = members.map(member => member.userId);
        const filteredUsers = data.users.filter(
          (user: User) => !memberUserIds.includes(user.id)
        );
        setAvailableUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to load available users",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
      toast({
        title: "Error",
        description: "Failed to load available users",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Handle adding a member
  const handleAddMember = async (userId: string) => {
    setIsAddingMember(true);
    try {
      const response = await fetch(`/api/chat/groups/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId,
          userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMembers([...members, data.member]);
        // Remove user from available users list
        setAvailableUsers(availableUsers.filter(user => user.id !== userId));
        setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
        toast({
          title: "Success",
          description: "Member added to group",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add member",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive"
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/groups/members?groupId=${groupId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove member from list
        setMembers(members.filter(member => member.userId !== userId));
        // If we have available users loaded, add this user back to that list
        if (availableUsers.length > 0) {
          const removedMember = members.find(member => member.userId === userId);
          if (removedMember) {
            const userData = {
              id: removedMember.userId,
              name: removedMember.user.name,
              email: removedMember.user.email,
              imageUrl: removedMember.user.imageUrl
            };
            setAvailableUsers([...availableUsers, userData]);
            setFilteredUsers([...filteredUsers, userData]);
          }
        }
        toast({
          title: "Success",
          description: "Member removed from group",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to remove member",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  // Handle promoting a member to admin
  const handlePromoteMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/groups/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId,
          userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update member role in the list
        setMembers(members.map(member => 
          member.userId === userId ? data.member : member
        ));
        toast({
          title: "Success",
          description: "Member promoted to admin",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to promote member",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error promoting member:", error);
      toast({
        title: "Error",
        description: "Failed to promote member",
        variant: "destructive"
      });
    }
  };

  // Handle leaving the group
  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/chat/groups/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.groupDeleted) {
          toast({
            title: "Group Deleted",
            description: "You were the last member. The group has been deleted.",
          });
        } else {
          toast({
            title: "Left Group",
            description: "You have successfully left the group.",
          });
        }
        onClose();
      } else {
        const error = await response.json();
        if (error.isLastAdmin) {
          toast({
            title: "Cannot Leave Group",
            description: "You are the last admin. Promote another member to admin before leaving.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.error || "Failed to leave group",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive"
      });
    }
  };

  // Filter available users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchTerm, availableUsers]);

  // Fetch members when the dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setShowAddMembers(false);
      setSearchTerm('');
    }
  }, [isOpen, groupId]);

  // Fetch available users when add members section is opened
  useEffect(() => {
    if (showAddMembers) {
      fetchAvailableUsers();
    }
  }, [showAddMembers]);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Group Members - {groupName}</DialogTitle>
          <DialogDescription>
            {showAddMembers ? "Add new members to this group" : "Manage members of this group chat"}
          </DialogDescription>
        </DialogHeader>

        {!showAddMembers ? (
          <>
            <div className="flex items-center justify-between my-2">
              <span className="text-sm text-muted-foreground">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
              {isCurrentUserAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddMembers(true)}
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Members
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 max-h-[50vh] pr-4">
              {isLoadingMembers ? (
                <div className="py-8 flex justify-center">
                  <span className="text-sm text-muted-foreground">Loading members...</span>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user.imageUrl} alt={member.user.name} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0) || member.user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.user.name}</span>
                            {member.role === 'admin' && (
                              <Badge variant="outline" className="gap-1 py-0">
                                <Shield className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                            {member.userId === currentUserId && (
                              <Badge variant="secondary" className="py-0">You</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{member.user.email}</span>
                        </div>
                      </div>

                      {isCurrentUserAdmin && member.userId !== currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handlePromoteMember(member.userId)}
                                className="gap-2"
                              >
                                <Shield className="h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-destructive gap-2"
                            >
                              <X className="h-4 w-4" />
                              Remove from Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <DialogFooter className="flex justify-between items-center">
              <Button 
                variant="destructive" 
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mb-4">
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>

            <ScrollArea className="flex-1 max-h-[50vh] pr-4">
              {isLoadingUsers ? (
                <div className="py-8 flex justify-center">
                  <span className="text-sm text-muted-foreground">Loading users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 flex justify-center">
                  <span className="text-sm text-muted-foreground">
                    {searchTerm ? "No users match your search" : "No users available to add"}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.imageUrl} alt={user.name} />
                          <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddMember(user.id)}
                        disabled={isAddingMember}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMembers(false)}>
                Back to Members
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
