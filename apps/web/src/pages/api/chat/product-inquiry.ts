import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  getOrCreateChatConversation,
  addChatMessage
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

  // Only accept POST requests for product inquiries
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sellerId, productId, initialMessage } = req.body;

    if (!sellerId || !initialMessage) {
      return res.status(400).json({ 
        error: 'Missing required fields: sellerId and initialMessage are required' 
      });
    }

    // Create or get an existing conversation between the buyer and seller for this product
    const conversation = await getOrCreateChatConversation(
      userId, // buyer (current user)
      sellerId,
      productId
    );

    // Add the initial message to the conversation
    const message = await addChatMessage(
      conversation.id,
      userId,
      initialMessage
    );

    return res.status(200).json({
      success: true,
      conversation,
      message
    });
  } catch (error) {
    console.error('Error creating product inquiry:', error);
    return res.status(500).json({ 
      error: 'An error occurred while creating the product inquiry' 
    });
  }
}
