import React, { useState } from 'react';
import { NextPage } from 'next';
import { 
  MessageList, 
  MessageBubble, 
  MessageReactions, 
  ThreadPanel,
  UserAvatar,
  EditGroupDialog,
  ManageGroupMembers,
  Button,
  DashboardShell,
  Card, CardContent, CardHeader, CardTitle,
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@saasfly/ui';

// Mock data for testing
const mockCurrentUser = {
  id: 'user-1',
  name: 'Current User',
  email: 'current@example.com',
  avatar: 'https://ui-avatars.com/api/?name=Current+User'
};

const mockUsers = [
  mockCurrentUser,
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith'
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson'
  }
];

const mockMessages = [
  {
    id: 'msg-1',
    content: 'Hello there!',
    createdAt: new Date(Date.now() - 60000 * 5).toISOString(),
    senderId: 'user-2',
    isRead: true,
    senderName: 'Jane Smith',
    senderAvatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    status: 'read',
    reactions: [
      { userId: 'user-1', emoji: '👍', createdAt: new Date().toISOString() },
      { userId: 'user-3', emoji: '❤️', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 'msg-2',
    content: 'How are you doing today?',
    createdAt: new Date(Date.now() - 60000 * 4).toISOString(),
    senderId: 'user-2',
    isRead: true,
    senderName: 'Jane Smith',
    senderAvatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    status: 'read',
    reactions: []
  },
  {
    id: 'msg-3',
    content: 'I\'m doing great, thanks for asking!',
    createdAt: new Date(Date.now() - 60000 * 3).toISOString(),
    senderId: 'user-1',
    isRead: true,
    senderName: 'Current User',
    senderAvatar: 'https://ui-avatars.com/api/?name=Current+User',
    status: 'read',
    reactions: [
      { userId: 'user-2', emoji: '👏', createdAt: new Date().toISOString() },
    ]
  }
];

const mockThreadReplies = [
  {
    id: 'reply-1',
    parentId: 'msg-1',
    content: 'This is a thread reply',
    createdAt: new Date(Date.now() - 60000 * 2).toISOString(),
    senderId: 'user-1',
    isRead: true,
    senderName: 'Current User',
    senderAvatar: undefined,
    status: 'read',
    reactions: []
  },
  {
    id: 'reply-2',
    parentId: 'msg-1',
    content: 'Another reply in the thread',
    createdAt: new Date(Date.now() - 60000).toISOString(),
    senderId: 'user-2',
    isRead: true,
    senderName: 'Jane Smith',
    senderAvatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    status: 'read',
    reactions: []
  }
];

// Mock group for testing
const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  members: mockUsers,
  createdAt: new Date().toISOString(),
  createdBy: 'user-1',
  avatarUrl: ''
};

const ChatComponentsTest: NextPage = () => {
  const [activeTab, setActiveTab] = useState('message-list');
  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});

  // Handler functions
  const handleAddReaction = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    setUserReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji]
    }));
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
    setUserReactions(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || []).filter(e => e !== emoji)
    }));
  };

  const handleSendMessage = (content: string) => {
    console.log(`Sending message: ${content}`);
    // In a real app, this would call an API to send the message
  };

  const handleSendThreadReply = (content: string) => {
    console.log(`Sending thread reply: ${content}`);
    // In a real app, this would call an API to send the thread reply
  };

  const handleReply = () => {
    setShowThreadPanel(true);
  };

  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Chat Components Test</h2>
        </div>
        
        <div className="grid gap-4">
          <Tabs defaultValue="message-list" onValueChange={setActiveTab} value={activeTab}>
            <TabsList>
              <TabsTrigger value="message-list">Message List</TabsTrigger>
              <TabsTrigger value="message-bubble">Message Bubble</TabsTrigger>
              <TabsTrigger value="reactions">Message Reactions</TabsTrigger>
              <TabsTrigger value="thread-panel">Thread Panel</TabsTrigger>
              <TabsTrigger value="user-avatar">User Avatar</TabsTrigger>
              <TabsTrigger value="group-dialogs">Group Dialogs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="message-list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MessageList Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 h-[400px] overflow-y-auto bg-slate-50">
                    <MessageList
                      messages={mockMessages}
                      currentUserId={mockCurrentUser.id}
                      hasMore={false}
                      isLoading={false}
                      onLoadMore={() => console.log('Load more messages')}
                      onReply={handleReply}
                      onAddReaction={handleAddReaction}
                      onRemoveReaction={handleRemoveReaction}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="message-bubble" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MessageBubble Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Other User's Message:</h3>
                      <MessageBubble
                        messageId="test-msg-1"
                        content="This is a message from another user"
                        timestamp={new Date()}
                        isOwn={false}
                        showSender={true}
                        senderName="Jane Smith"
                        senderAvatar="https://ui-avatars.com/api/?name=Jane+Smith"
                        status="read"
                        isRead={true}
                        currentUserId={mockCurrentUser.id}
                        onAddReaction={(emoji: string) => console.log(`Add reaction: ${emoji}`)}
                        onRemoveReaction={(emoji: string) => console.log(`Remove reaction: ${emoji}`)}
                        replyCount={3}
                        onReply={() => setShowThreadPanel(true)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Current User's Message:</h3>
                      <MessageBubble
                        messageId="test-msg-2"
                        content="This is my own message"
                        timestamp={new Date()}
                        isOwn={true}
                        showSender={false}
                        senderName={mockCurrentUser.name}
                        status="delivered"
                        isRead={false}
                        currentUserId={mockCurrentUser.id}
                        onAddReaction={(emoji: string) => console.log(`Add reaction: ${emoji}`)}
                        onRemoveReaction={(emoji: string) => console.log(`Remove reaction: ${emoji}`)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MessageReactions Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Message Reactions:</h3>
                      <MessageReactions
                        messageId="test-reactions"
                        reactions={[
                          { userId: 'user-1', emoji: '👍', createdAt: new Date().toISOString() },
                          { userId: 'user-2', emoji: '👍', createdAt: new Date().toISOString() },
                          { userId: 'user-3', emoji: '❤️', createdAt: new Date().toISOString() },
                          { userId: 'user-2', emoji: '😂', createdAt: new Date().toISOString() }
                        ]}
                        currentUserId={mockCurrentUser.id}
                        onReactionSelect={handleAddReaction}
                        onReactionRemove={handleRemoveReaction}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="thread-panel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ThreadPanel Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => setShowThreadPanel(!showThreadPanel)}>
                      {showThreadPanel ? 'Hide Thread Panel' : 'Show Thread Panel'}
                    </Button>
                  </div>
                  
                  {showThreadPanel && (
                    <div className="border rounded-md h-[500px]">
                      <ThreadPanel
                        isOpen={showThreadPanel}
                        onClose={() => setShowThreadPanel(false)}
                        parentMessage={mockMessages[0]}
                        messages={mockThreadReplies}
                        currentUserId={mockCurrentUser.id}
                        userMap={{
                          'user-1': { id: 'user-1', name: 'Current User', avatar: 'https://ui-avatars.com/api/?name=Current+User' },
                          'user-2': { id: 'user-2', name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith' },
                          'user-3': { id: 'user-3', name: 'Bob Johnson', avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson' }
                        }}
                        onSendMessage={handleSendThreadReply}
                        onAddReaction={handleAddReaction}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="user-avatar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>UserAvatar Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-6 items-end">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Extra Small</p>
                      <UserAvatar 
                        user={mockCurrentUser} 
                        size="xs" 
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Small</p>
                      <UserAvatar 
                        user={mockCurrentUser} 
                        size="sm" 
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Medium (Default)</p>
                      <UserAvatar 
                        user={mockCurrentUser} 
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Large</p>
                      <UserAvatar 
                        user={mockCurrentUser} 
                        size="lg" 
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">With Status</p>
                      <UserAvatar 
                        user={mockCurrentUser} 
                        size="lg" 
                        showStatus 
                        status="online" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="group-dialogs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Group Dialog Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-6">
                    <Button onClick={() => setShowEditGroupDialog(true)}>
                      Show Edit Group Dialog
                    </Button>
                    <Button onClick={() => setShowManageMembers(true)}>
                      Show Manage Members Dialog
                    </Button>
                  </div>
                  
                  {showEditGroupDialog && (
                    <EditGroupDialog
                      isOpen={showEditGroupDialog}
                      onClose={() => setShowEditGroupDialog(false)}
                      groupId={mockGroup.id}
                      initialName={mockGroup.name}
                      initialImage={mockGroup.avatarUrl}
                      onSave={(name: string, image: string | null) => {
                        console.log(`Updating group with name: ${name}`);
                        setShowEditGroupDialog(false);
                      }}
                    />
                  )}
                  
                  {showManageMembers && (
                    <ManageGroupMembers
                      isOpen={showManageMembers}
                      onClose={() => setShowManageMembers(false)}
                      groupId={mockGroup.id}
                      groupName={mockGroup.name}
                      members={mockUsers}
                      currentUserId={mockCurrentUser.id}
                      isAdmin={true}
                      onAddMembers={(memberIds: string[]) => {
                        console.log(`Adding members: ${memberIds.join(', ')}`);
                        return Promise.resolve();
                      }}
                      onRemoveMember={(memberId: string) => {
                        console.log(`Removing member: ${memberId}`);
                        return Promise.resolve();
                      }}
                      onPromoteToAdmin={(memberId: string) => {
                        console.log(`Promoting member to admin: ${memberId}`);
                        return Promise.resolve();
                      }}
                      onDemoteFromAdmin={(memberId: string) => {
                        console.log(`Demoting admin to member: ${memberId}`);
                        return Promise.resolve();
                      }}
                      onSearchUsers={(query: string) => {
                        console.log(`Searching users with query: ${query}`);
                        return Promise.resolve(mockUsers.filter(u => 
                          u.name.toLowerCase().includes(query.toLowerCase()) || 
                          u.email.toLowerCase().includes(query.toLowerCase())
                        ));
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ChatComponentsTest;
