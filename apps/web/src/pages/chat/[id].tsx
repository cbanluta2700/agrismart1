/**
 * Conversation Page
 * 
 * Dedicated page for a single chat conversation, providing
 * a focused interface for messaging between buyer and seller.
 */

import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@saasfly/auth';
import { MessagePanel, EmptyState, Button, SearchMessages } from '@saasfly/ui';
import { useChat, type ConversationType, type ChatMessageType } from '@saasfly/chat';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { ChevronLeft, MessageSquareDashed, Search } from 'lucide-react';
import Link from 'next/link';

export default function ConversationPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize chat hook
  const {
    connected,
    activeConversation,
    messages,
    typingUsers,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    sendTypingStatus,
    selectConversation,
  } = useChat();

  // Load conversation data
  useEffect(() => {
    if (status === 'authenticated' && id && !initialized) {
      setLoading(true);
      
      // Fetch all conversations first
      fetchConversations()
        .then((conversations) => {
          // Find the requested conversation
          const conversation = conversations.find((c: ConversationType) => c.id === id);
          
          if (conversation) {
            // Select the conversation to join the room and load messages
            selectConversation(conversation);
          } else {
            setNotFound(true);
          }
          
          setInitialized(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading conversation:', err);
          setLoading(false);
        });
    }
  }, [status, id, initialized, fetchConversations, selectConversation]);

  // Function to load more messages
  const loadMoreMessages = async () => {
    if (!activeConversation) return [];
    
    // Get oldest message timestamp for pagination
    const oldestMessage = messages[0];
    const before = oldestMessage ? new Date(oldestMessage.createdAt) : new Date();
    
    // Fetch older messages
    try {
      const response = await fetch(
        `/api/chat/messages?conversationId=${activeConversation.id}&before=${before.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error loading more messages:', error);
      return [];
    }
  };
  
  // Function to search messages within this conversation
  const searchMessages = async (query: string): Promise<ChatMessageType[]> => {
    if (!activeConversation || !query.trim()) return [];
    
    try {
      const response = await fetch(
        `/api/chat/search?conversationId=${activeConversation.id}&query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search messages');
      }
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };
  
  // Handle sending messages
  const handleSendMessage = async (content: string, attachments?: any) => {
    if (!activeConversation || !content.trim()) return;
    
    try {
      await sendMessage(activeConversation.id, content, attachments);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle selecting search result
  const handleSearchResultSelect = (message: ChatMessageType) => {
    // Implementation would typically scroll to the message or highlight it
    console.log('Selected message:', message);
    setSearchOpen(false);
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (activeConversation) {
      sendTypingStatus(activeConversation.id, isTyping);
    }
  };

  // Determine if we should show loading state
  const isLoading = status === 'loading' || loading;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="container mx-auto p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/chat" passHref>
                <Button variant="ghost" size="sm" className="mr-2">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back to Conversations
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">
                {activeConversation?.title || 'Conversation'}
              </h1>
            </div>
            
            {activeConversation && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-1 h-4 w-4" />
                Search in conversation
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p>Loading conversation...</p>
            </div>
          ) : notFound ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <EmptyState
                icon={<MessageSquareDashed className="h-12 w-12" />}
                title="Conversation not found"
                description="This conversation may no longer exist or you may not have permission to view it."
              />
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => router.push('/chat')}
              >
                Go back to all conversations
              </Button>
            </div>
          ) : !activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p>No conversation selected</p>
            </div>
          ) : (
            <div className="flex-1 rounded-lg border shadow-sm overflow-hidden">
              <MessagePanel 
                conversation={activeConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                typingUsers={typingUsers.get(activeConversation.id) || new Set<string>()}
                isConnected={connected}
                loadMoreMessages={loadMoreMessages}
              />
              
              {searchOpen && (
                <SearchMessages
                  onSearch={searchMessages}
                  onSelectResult={handleSearchResultSelect}
                  isOpen={searchOpen}
                  onClose={() => setSearchOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
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
