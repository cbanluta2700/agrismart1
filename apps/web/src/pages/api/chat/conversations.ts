import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  getUserChatConversations,
  getOrCreateChatConversation,
  createGroupConversation,
  archiveConversation,
  toggleConversationPin
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
        return await handleGetConversations(req, res, userId);
      case 'POST':
        return await handleCreateConversation(req, res, userId);
      case 'PATCH':
        return await handleUpdateConversation(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Conversation API error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

// GET: Retrieve conversations
async function handleGetConversations(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;

  if (id) {
    // Get single conversation by ID - for this we'll need to enhance our DB utilities
    // TODO: Add a function to get detailed conversation including participants
    return res.status(501).json({ error: 'Get single conversation not yet implemented' });
  } else {
    // Get all user conversations
    const conversations = await getUserChatConversations(userId);
    return res.status(200).json(conversations);
  }
}

// POST: Create a new conversation
async function handleCreateConversation(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { type } = req.query;

  // Create a group conversation
  if (type === 'group') {
    const { name, memberIds, description, groupAvatar } = req.body;
    
    if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Ensure creator is in the member list
    const allMemberIds = Array.from(new Set([userId, ...memberIds]));
    
    const conversation = await createGroupConversation(
      name,
      userId,
      allMemberIds,
      description,
      groupAvatar
    );
    
    return res.status(201).json(conversation);
  }
  
  // Create a direct (1:1) conversation
  const { otherUserId, productId } = req.body;
  
  if (!otherUserId) {
    return res.status(400).json({ error: 'Missing otherUserId' });
  }
  
  // For direct conversations, we distinguish between buyer and seller
  // For this simplified API, we'll always set the current user as buyer
  // and the other user as seller - this could be adjusted based on actual user roles
  const conversation = await getOrCreateChatConversation(
    userId,          // buyerId
    otherUserId,     // sellerId
    productId        // optional productId
  );
  
  return res.status(201).json(conversation);
}

// PATCH: Update conversation settings
async function handleUpdateConversation(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;
  const { action } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing conversation ID' });
  }

  const conversationId = id as string;

  switch (action) {
    case 'archive':
      // Archive the conversation
      const archivedConvo = await archiveConversation(conversationId, userId);
      return res.status(200).json(archivedConvo);
      
    case 'togglePin':
      // Pin or unpin the conversation
      const toggledConvo = await toggleConversationPin(conversationId, userId);
      return res.status(200).json(toggledConvo);
      
    case 'leave':
      // TODO: Implement leave conversation functionality
      return res.status(501).json({ error: 'Leave conversation not yet implemented' });
      
    case 'addParticipants':
      // TODO: Implement add participants functionality
      return res.status(501).json({ error: 'Add participants not yet implemented' });
      
    case 'removeParticipant':
      // TODO: Implement remove participant functionality
      return res.status(501).json({ error: 'Remove participant not yet implemented' });
      
    case 'updateGroupInfo':
      // TODO: Implement update group info functionality
      return res.status(501).json({ error: 'Update group info not yet implemented' });
      
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}
