import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  addChatMessage,
  getChatConversationById,
  addMessageAttachment
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

  // Only accept POST requests for resource sharing
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, message, resourceId, resourceType, resourceTitle, resourceUrl, thumbnailUrl } = req.body;

    if (!conversationId || !resourceId || !resourceType) {
      return res.status(400).json({ 
        error: 'Missing required fields: conversationId, resourceId, and resourceType are required' 
      });
    }

    // Verify the conversation exists
    const conversation = await getChatConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create a formatted message with the resource info
    const formattedMessage = message || `Shared a resource: ${resourceTitle || resourceType}`;
    
    // Add the message to the conversation
    const chatMessage = await addChatMessage(
      conversationId,
      userId,
      formattedMessage
    );

    // Add the resource as an attachment to the message
    const attachment = await addMessageAttachment(
      chatMessage.id,
      resourceUrl || `internal://resources/${resourceType}/${resourceId}`,
      resourceTitle || `${resourceType} resource`,
      0, // fileSize is not applicable for internal resources
      resourceType,
      thumbnailUrl,
      'application/resource'
    );

    return res.status(200).json({
      success: true,
      message: chatMessage,
      attachment
    });
  } catch (error) {
    console.error('Error sharing resource:', error);
    return res.status(500).json({ 
      error: 'An error occurred while sharing the resource' 
    });
  }
}
