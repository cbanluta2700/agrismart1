import React from "react";
import { Suspense } from "react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import { Button } from "@saasfly/ui/button";
import { Skeleton } from "@saasfly/ui/skeleton";
import type { Locale } from "~/config/i18n-config";
import { AlertCircle, Bot, MessageSquare, Plus } from "~/components/ai-assistant/icons";
import { auth } from "@saasfly/auth";
import { Chat } from "~/components/ai-assistant/chat"; 
import { ChatHistory } from "~/components/ai-assistant/chat-history";
import { getChatMessages } from "@saasfly/ai-assistant";

export const metadata = {
  title: "AI Assistant - AgriSmart",
};

interface AIAssistantPageProps {
  params: {
    lang: Locale;
  };
  searchParams: {
    chatId?: string;
  };
}

async function AIAssistantContent({ searchParams }: { searchParams: { chatId?: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  // If a chatId is provided, fetch the messages for that chat
  const initialMessages = searchParams?.chatId
    ? await getChatMessages(searchParams.chatId)
    : [];
  
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Chat History Sidebar */}
      <Card className="col-span-12 lg:col-span-3">
        <CardHeader>
          <CardTitle>Chat History</CardTitle>
          <CardDescription>Your previous conversations</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-0">
          <ChatHistory />
        </CardContent>
      </Card>
      
      {/* Chat Interface */}
      <Card className="col-span-12 lg:col-span-9 flex flex-col" style={{ minHeight: "600px" }}>
        <CardHeader>
          <CardTitle>AgriSmart Assistant</CardTitle>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="agricultural-expert">
                <Bot className="h-4 w-4 mr-2" />
                Agricultural Expert
              </TabsTrigger>
              <TabsTrigger value="troubleshooting">
                <AlertCircle className="h-4 w-4 mr-2" />
                Troubleshooting
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col p-0">
          <Chat 
            id={searchParams.chatId} 
            initialMessages={initialMessages} 
            className="h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AIAssistantPage({
  params,
  searchParams,
}: AIAssistantPageProps) {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="AI Assistant"
        text="Get agricultural advice and assistance from our AI farming expert."
      >
        <Button asChild>
          <a href="/dashboard/ai-assistant">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </a>
        </Button>
      </DashboardHeader>
      
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="col-span-12 lg:col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-12 lg:col-span-9 flex flex-col" style={{ minHeight: "600px" }}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-full" />
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-col h-full">
                  <div className="flex-grow space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-2/3 ml-auto" />
                    <Skeleton className="h-10 w-4/5" />
                  </div>
                  <Skeleton className="h-10 w-full mt-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <AIAssistantContent searchParams={searchParams} />
      </Suspense>
    </DashboardShell>
  );
}
