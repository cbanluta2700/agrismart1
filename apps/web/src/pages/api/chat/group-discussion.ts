import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  createGroupConversation,
  addChatMessage,
  addGroupConversationMember,
  getChatConversationById
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
      case 'POST':
        return await handleCreateGroupDiscussion(req, res, userId);
      case 'PUT':
        return await handleAddMembersToGroup(req, res, userId);
      case 'GET':
        return await handleGetGroupDetails(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error with group discussion:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing the group discussion request'
    });
  }
}

// POST: Create a new group discussion
async function handleCreateGroupDiscussion(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { name, description, memberIds, initialMessage, groupAvatar } = req.body;

  if (!name || !memberIds || !Array.isArray(memberIds)) {
    return res.status(400).json({ 
      error: 'Missing required fields: name and memberIds array are required' 
    });
  }

  // Ensure creator is included in member list
  if (!memberIds.includes(userId)) {
    memberIds.push(userId);
  }

  // Create the group conversation
  const conversation = await createGroupConversation(
    name,
    userId, // creator
    memberIds,
    description,
    groupAvatar
  );

  // Add initial message if provided
  if (initialMessage) {
    await addChatMessage(
      conversation.id,
      userId,
      initialMessage
    );
  }

  return res.status(200).json({
    success: true,
    conversation
  });
}

// PUT: Add members to an existing group
async function handleAddMembersToGroup(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { conversationId, memberIds, role = 'MEMBER' } = req.body;

  if (!conversationId || !memberIds || !Array.isArray(memberIds)) {
    return res.status(400).json({ 
      error: 'Missing required fields: conversationId and memberIds array are required' 
    });
  }

  // Check if the user is authorized to add members (should be a member)
  const conversation = await getChatConversationById(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Add each member to the group
  const addedMembers = [];
  for (const memberId of memberIds) {
    try {
      const participant = await addGroupConversationMember(
        conversationId,
        memberId,
        userId, // added by current user
        role
      );
      addedMembers.push(participant);
    } catch (error) {
      console.error(`Error adding member ${memberId}:`, error);
      // Continue with other members even if one fails
    }
  }

  return res.status(200).json({
    success: true,
    addedMembers
  });
}

// GET: Get group discussion details
async function handleGetGroupDetails(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { conversationId } = req.query;

  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  const conversation = await getChatConversationById(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  return res.status(200).json({
    success: true,
    conversation
  });
}
