/**
 * Chat Page
 * 
 * This page provides a unified interface for all chat functionality,
 * including direct messaging, group chats, and message search.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@saasfly/auth';
import { 
  ConversationList, 
  MessagePanel, 
  SearchMessages, 
  CreateGroupDialog,
  ConversationInfo,
  EditGroupDialog,
  ManageGroupMembers,
  ThreadPanel,
  NotificationCenter,
  Button
} from '@saasfly/ui';
import { useChat, ConversationType, ChatMessageType } from '@saasfly/chat';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { MessageSquare, Search, Users, Plus, Bell, X } from 'lucide-react';

// Custom Badge component since it's not exported from @saasfly/ui
const Badge = ({ 
  children, 
  variant = 'default', 
  className = '' 
}: { 
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}) => {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground"
  };
  
  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Custom EmptyState component that extends the one from @saasfly/ui
const CustomEmptyState = ({
  icon,
  title,
  description,
  action
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-4">{description}</p>
      {action}
    </div>
  );
};

// Custom ChatContainer component to wrap the actual chat UI
const ChatContainer = ({ 
  sidebarContent, 
  mainContent, 
  asideContent = null 
}: {
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
  asideContent?: React.ReactNode;
}) => {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="w-72 flex-shrink-0 border-r border-border">
        {sidebarContent}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {mainContent}
      </div>
      {asideContent && (
        <div className="w-80 flex-shrink-0 border-l border-border">
          {asideContent}
        </div>
      )}
    </div>
  );
};

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [infoOpen, setInfoPanelOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [activeThreadMessage, setActiveThreadMessage] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Initialize chat hook
  const {
    // Connection state
    socket,
    connected,
    connecting,
    error,
    
    // Data
    activeConversation,
    conversations,
    messages,
    typingUsers,
    unreadCount,
    threadMessages,
    activeThreadId,
    
    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    sendTypingStatus,
    selectConversation,
    clearActiveConversation,
    
    // Group actions
    createGroup,
    updateGroup,
    leaveGroup,
    addGroupMember,
    removeGroupMember,
    
    // Thread actions
    loadThreadReplies,
    sendThreadReply,
    setActiveThreadId,
    
    // Reaction actions
    addReaction,
    removeReaction
  } = useChat();

  // Handler for message typing status
  const handleTyping = (isTyping: boolean) => {
    if (!activeConversation) return;
    sendTypingStatus(activeConversation.id, isTyping);
  };

  // Handler for loading more messages
  const loadMoreMessagesHandler = async () => {
    // This would typically load more messages from the server
    // Return empty array for now
    return [];
  };

  // Handle managing members for a group chat
  const handleManageMembers = (groupId: string) => {
    if (!activeConversation) return;
    setInfoPanelOpen(true);
  };

  // Handle message reactions
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Handle removing message reactions
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await removeReaction(messageId, emoji);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Send a thread reply with proper typing
  const handleSendThreadReply = async (content: string, attachments?: any) => {
    if (!activeThreadId) return;
    
    try {
      await sendThreadReply(activeThreadId, content, attachments);
    } catch (error) {
      console.error('Error sending thread reply:', error);
    }
  };

  // Handle thread opening
  const handleOpenThread = async (messageId: string) => {
    try {
      setActiveThreadId(messageId);
      const message = messages.find(m => m.id === messageId);
      
      if (message) {
        setActiveThreadMessage(message);
        setShowThreadPanel(true);
        await loadThreadReplies(messageId);
      }
    } catch (error) {
      console.error('Error opening thread:', error);
    }
  };

  // Handle search for messages
  const handleSearchMessages = async (query: string): Promise<ChatMessageType[]> => {
    try {
      const response = await fetch(`/api/chat/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data.messages || [];
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    }
    return [];
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (message: ChatMessageType) => {
    const conversation = conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      selectConversation(conversation);
      setSearchOpen(false);
    }
  };

  // Handle group creation
  const handleCreateGroup = async (data: { 
    name: string; 
    description?: string;
    members: string[];
    image?: File;
  }) => {
    try {
      if (!session?.user?.id) return;
      // Convert File to string URL if needed
      const iconUrl = data.image ? URL.createObjectURL(data.image) : undefined;
      await createGroup(data.name, data.members, data.description, iconUrl);
      setCreateGroupOpen(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Handle group settings update
  const handleUpdateGroup = async (groupData: {
    name?: string;
    description?: string;
    image?: File;
  }) => {
    try {
      if (!activeConversation || !session?.user?.id) return;
      
      // Convert File to string URL if needed
      const iconUrl = groupData.image ? URL.createObjectURL(groupData.image) : undefined;
      
      await updateGroup(activeConversation.id, {
        name: groupData.name,
        description: groupData.description,
        iconUrl: iconUrl
      });
      
      setInfoPanelOpen(false);
      setEditGroupOpen(false);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  // Load available users for adding to conversations
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/chat/users');
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load users when creating a group
  useEffect(() => {
    if (createGroupOpen) {
      loadUsers();
    }
  }, [createGroupOpen]);

  const toast = {
    title: (title: string) => console.log(title),
    description: (desc: string) => console.log(desc),
    variant: (variant: string) => console.log(variant)
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="container py-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search messages"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1" variant="destructive">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-1 overflow-hidden bg-background rounded-lg border border-border shadow-sm">
            <ChatContainer
              sidebarContent={
                <div className="h-full flex flex-col">
                  {/* Custom buttons for conversation actions */}
                  <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm"
                        onClick={() => setCreateGroupOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Group
                      </Button>
                    </div>
                  </div>
                  <ConversationList
                    conversations={conversations}
                    activeConversationId={activeConversation?.id}
                    onSelectConversation={selectConversation}
                    onRefresh={fetchConversations}
                  />
                </div>
              }
              mainContent={
                activeConversation ? (
                  <MessagePanel
                    conversation={activeConversation}
                    messages={messages}
                    onSendMessage={(content, attachments) => 
                      sendMessage(activeConversation.id, content, attachments)
                    }
                    onTyping={handleTyping}
                    typingUsers={typingUsers.get(activeConversation.id) || new Set()}
                    isConnected={connected}
                    loadMoreMessages={loadMoreMessagesHandler}
                    currentUserId={session?.user?.id}
                    onAddReaction={handleAddReaction}
                    onRemoveReaction={handleRemoveReaction}
                  />
                ) : (
                  <CustomEmptyState 
                    icon={<MessageSquare className="h-12 w-12 opacity-20" />}
                    title="Select a conversation"
                    description="Choose a conversation from the sidebar or start a new one"
                  />
                )
              }
              asideContent={
                showThreadPanel && activeThreadMessage ? (
                  <div className="h-full">
                    {/* Custom thread panel implementation */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold">Thread</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setShowThreadPanel(false);
                          setActiveThreadMessage(null);
                          setActiveThreadId(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4">
                      {activeThreadMessage && (
                        <div className="mb-4 p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activeThreadMessage.senderName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activeThreadMessage.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p>{activeThreadMessage.content}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <Button 
                          className="w-full"
                          onClick={() => handleSendThreadReply("Reply...")}
                        >
                          Reply to Thread
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null
              }
            />
          </div>
        </div>
      </div>

      {/* Search Messages Dialog */}
      {searchOpen && (
        <SearchMessages
          onSearch={handleSearchMessages}
          onSelectResult={handleSelectSearchResult}
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Create Group Dialog */}
      {createGroupOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Members</label>
                <div className="border rounded-md p-2 h-40 overflow-auto">
                  {availableUsers.map(user => (
                    <div key={user.id} className="flex items-center p-2 hover:bg-muted rounded">
                      <input type="checkbox" className="mr-2" id={`user-${user.id}`} />
                      <label htmlFor={`user-${user.id}`}>{user.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                handleCreateGroup({
                  name: "New Group",
                  members: availableUsers.slice(0, 3).map(u => u.id)
                });
                setCreateGroupOpen(false);
              }}>Create Group</Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom dialogs instead of Saasfly UI components that are causing TypeScript errors */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Notifications</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No notifications</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto">
                {notifications.map((notification, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <p>{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setNotifications([]);
                  setShowNotifications(false);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
