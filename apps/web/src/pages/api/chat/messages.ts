import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  getChatConversationMessages,
  addChatMessage,
  updateMessageStatus,
  toggleMessageReaction,
  getThreadReplies,
  markMessagesAsRead,
  getMessageAttachments,
  addMessageAttachment,
  editMessage,
  MessageStatus
} from '@saasfly/db';
import { Session } from 'next-auth';

// Mock auth options until the NextAuth configuration is properly set up
const authOptions = {
  providers: [],
  callbacks: {
    session: async ({ session, token }: { session: Session; token: any }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  // Handle different HTTP methods
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetMessages(req, res, userId);
      case 'POST':
        return await handlePostMessage(req, res, userId);
      case 'PATCH':
        return await handleUpdateMessage(req, res, userId);
      case 'DELETE':
        return await handleDeleteMessage(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET: Retrieve messages
async function handleGetMessages(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { conversationId, threadId, limit, before } = req.query;

  // Get thread replies
  if (threadId) {
    const replies = await getThreadReplies(threadId as string);
    return res.status(200).json(replies);
  }

  // Get conversation messages
  if (conversationId) {
    const limitNumber = limit ? parseInt(limit as string, 10) : 50;
    let beforeDate: Date | undefined;
    
    if (before) {
      beforeDate = new Date(before as string);
    }
    
    const messages = await getChatConversationMessages(
      conversationId as string,
      limitNumber,
      beforeDate
    );
    
    // Mark messages as read
    await markMessagesAsRead(conversationId as string, userId);
    
    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.map(async (message) => {
        const attachments = await getMessageAttachments(message.id);
        return {
          ...message,
          attachments
        };
      })
    );
    
    return res.status(200).json(messagesWithAttachments);
  }

  return res.status(400).json({ error: 'Missing required parameters' });
}

// POST: Create a new message or add reaction
async function handlePostMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { type } = req.query;

  // Add reaction to message
  if (type === 'reaction') {
    const { messageId, emoji } = req.body;
    
    if (!messageId || !emoji) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await toggleMessageReaction(messageId, userId, emoji);
    return res.status(200).json(result);
  }
  
  // Add message attachment
  if (type === 'attachment') {
    const { messageId, url, fileName, fileSize, fileType, thumbnailUrl, mimeType } = req.body;
    
    if (!messageId || !url || !fileName || !fileSize || !fileType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const attachment = await addMessageAttachment(
      messageId, 
      url, 
      fileName, 
      fileSize, 
      fileType, 
      thumbnailUrl, 
      mimeType
    );
    
    return res.status(201).json(attachment);
  }
  
  // Create new message
  const { conversationId, content, attachments, replyToId } = req.body;
  
  if (!conversationId || !content) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // Set initial status as SENDING
  const message = await addChatMessage(
    conversationId,
    userId,
    content,
    attachments,
    replyToId,
    MessageStatus.SENDING
  );
  
  // Update status to SENT after message is created
  await updateMessageStatus(message.id, MessageStatus.SENT);
  
  return res.status(201).json(message);
}

// PATCH: Update message status or mark as read
async function handleUpdateMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { type } = req.query;

  // Mark conversation messages as read
  if (type === 'read') {
    const { conversationId } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'Missing conversationId' });
    }
    
    await markMessagesAsRead(conversationId, userId);
    return res.status(200).json({ success: true });
  }
  
  // Update message status
  if (type === 'status') {
    const { messageId, status } = req.body;
    
    if (!messageId || !status) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const updatedMessage = await updateMessageStatus(messageId, status);
    return res.status(200).json(updatedMessage);
  }
  
  // Edit message content
  if (type === 'edit') {
    const { messageId, content } = req.body;
    
    if (!messageId || !content) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const updatedMessage = await editMessage(messageId, userId, content);
    return res.status(200).json(updatedMessage);
  }

  return res.status(400).json({ error: 'Invalid update type' });
}

// DELETE: Delete a message or reaction
async function handleDeleteMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  // Message deletion is not supported in this version
  // As an alternative, we could implement a "deletedAt" field and filter out deleted messages
  
  return res.status(501).json({ error: 'Message deletion not implemented' });
}
