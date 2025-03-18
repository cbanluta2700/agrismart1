/**
 * Chat Component Test Page
 * 
 * This page tests the fixed chat components to ensure they work correctly.
 * It focuses on the components we've made TypeScript fixes to.
 */

import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

// Import components from @saasfly/ui package
import { 
  MessageBubble, 
  ThreadPanel,
  UserAvatar,
  MessageReactions,
} from '@saasfly/ui/src/chat';

// Import UI components from shadcn
import { Button } from '@saasfly/ui/src/button';
import { DashboardShell } from '@saasfly/ui/src/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@saasfly/ui/src/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@saasfly/ui/src/tabs';
import { Separator } from '@saasfly/ui/src/separator';

// Define mock data and types that match the expected component interfaces
interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

interface MockUser {
  id: string;
  name: string;
  avatar?: string;
}

interface MockMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
  reactions: MessageReaction[];
  conversationId: string;
  replyCount: number;
}

// Mock data
const mockCurrentUser: MockUser = {
  id: 'user-1',
  name: 'Current User',
  avatar: 'https://ui-avatars.com/api/?name=Current+User'
};

const mockUsers: Record<string, MockUser> = {
  'user-1': mockCurrentUser,
  'user-2': {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith'
  },
  'user-3': {
    id: 'user-3',
    name: 'Bob Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson'
  }
};

const mockMessage: MockMessage = {
  id: 'msg-1',
  content: 'Hello there!',
  createdAt: new Date(Date.now() - 60000 * 5).toISOString(),
  senderId: 'user-2',
  isRead: true,
  reactions: [
    { userId: 'user-1', emoji: '👍', createdAt: new Date().toISOString() },
    { userId: 'user-3', emoji: '❤️', createdAt: new Date().toISOString() }
  ],
  conversationId: 'conv-1',
  replyCount: 2
};

const mockThreadReplies: MockMessage[] = [
  {
    id: 'reply-1',
    content: 'This is a thread reply',
    createdAt: new Date(Date.now() - 60000 * 2).toISOString(),
    senderId: 'user-1',
    isRead: true,
    reactions: [],
    conversationId: 'conv-1',
    replyCount: 0
  },
  {
    id: 'reply-2',
    content: 'Another reply in the thread',
    createdAt: new Date(Date.now() - 60000).toISOString(),
    senderId: 'user-2',
    isRead: true,
    reactions: [],
    conversationId: 'conv-1',
    replyCount: 0
  }
];

const ChatComponentTest: NextPage = () => {
  const [activeTab, setActiveTab] = useState('message-bubble');
  const [showThreadPanel, setShowThreadPanel] = useState(false);

  // Handler functions for reactions
  const handleAddReaction = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
  };

  return (
    <>
      <Head>
        <title>Chat Component Test</title>
      </Head>
      
      <DashboardShell>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Chat Component Tests</h2>
          </div>
          
          <Tabs defaultValue="message-bubble" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="message-bubble">MessageBubble</TabsTrigger>
              <TabsTrigger value="user-avatar">UserAvatar</TabsTrigger>
              <TabsTrigger value="message-reactions">MessageReactions</TabsTrigger>
              <TabsTrigger value="thread-panel">ThreadPanel</TabsTrigger>
            </TabsList>
            
            <TabsContent value="message-bubble" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MessageBubble Component Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Testing the MessageBubble component with fixed TypeScript
                  </p>
                  <div className="border p-4 rounded-md space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Other User's Message:</h3>
                      <MessageBubble
                        messageId={mockMessage.id}
                        content={mockMessage.content}
                        timestamp={mockMessage.createdAt}
                        isOwn={false}
                        showSender={true}
                        senderName={mockUsers[mockMessage.senderId].name}
                        senderAvatar={mockUsers[mockMessage.senderId].avatar}
                        status="read"
                        isRead={true}
                        currentUserId={mockCurrentUser.id}
                        onAddReaction={(emoji: string) => handleAddReaction(mockMessage.id, emoji)}
                        onRemoveReaction={(emoji: string) => handleRemoveReaction(mockMessage.id, emoji)}
                        reactions={mockMessage.reactions}
                        replyCount={mockMessage.replyCount}
                        onReply={() => setShowThreadPanel(true)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Current User's Message:</h3>
                      <MessageBubble
                        messageId="test-msg-2"
                        content="This is my own message"
                        timestamp={new Date().toISOString()}
                        isOwn={true}
                        showSender={false}
                        senderName={mockCurrentUser.name}
                        status="delivered"
                        isRead={false}
                        currentUserId={mockCurrentUser.id}
                        onAddReaction={(emoji: string) => handleAddReaction("test-msg-2", emoji)}
                        onRemoveReaction={(emoji: string) => handleRemoveReaction("test-msg-2", emoji)}
                        reactions={[]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="user-avatar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>UserAvatar Component Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Testing the UserAvatar component with fixed TypeScript
                  </p>
                  
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
            
            <TabsContent value="message-reactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MessageReactions Component Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Testing the MessageReactions component with fixed TypeScript
                  </p>
                  
                  <div className="border p-4 rounded-md">
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="thread-panel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ThreadPanel Component Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Testing the ThreadPanel component with fixed TypeScript
                  </p>
                  
                  <div className="mb-4">
                    <Button onClick={() => setShowThreadPanel(!showThreadPanel)}>
                      {showThreadPanel ? 'Hide Thread Panel' : 'Show Thread Panel'}
                    </Button>
                  </div>
                  
                  {showThreadPanel && (
                    <div className="border rounded-md h-[500px]">
                      <ThreadPanel
                        isOpen={showThreadPanel}
                        onClose={() => setShowThreadPanel(false)}
                        parentMessage={mockMessage}
                        messages={mockThreadReplies}
                        currentUserId={mockCurrentUser.id}
                        userMap={mockUsers}
                        onSendMessage={(content: string) => console.log(`Sending thread reply: ${content}`)}
                        onAddReaction={handleAddReaction}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              This test page verifies that our TypeScript fixes for chat components are working correctly.
              Interact with the components above to test functionality.
            </p>
          </div>
        </div>
      </DashboardShell>
    </>
  );
};

export default ChatComponentTest;
