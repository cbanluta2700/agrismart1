import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@saasfly/auth';
import prisma from '@saasfly/db';
import { z } from 'zod';

// Validation schema for search parameters
const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  conversationId: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20),
});

// API handler for searching chat messages
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Validate query parameters
    const { query, conversationId, limit } = searchSchema.parse(req.query);

    // Build search conditions
    let whereConditions: any = {
      // Search within messages where user is a participant
      conversation: {
        members: {
          some: {
            userId,
          },
        },
      },
      // Search for text content matching the query
      content: {
        contains: query,
        mode: 'insensitive',
      },
    };

    // Restrict to specific conversation if specified
    if (conversationId) {
      whereConditions.conversationId = conversationId;

      // Verify user is a participant in this conversation
      const isParticipant = await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId,
        },
      });

      if (!isParticipant) {
        return res.status(403).json({ error: 'Not authorized to search in this conversation' });
      }
    }

    // Execute search query
    const messages = await prisma.message.findMany({
      where: whereConditions,
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        conversation: {
          select: {
            id: true,
            title: true,
            isGroup: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Return search results
    return res.status(200).json({
      results: messages,
      count: messages.length,
      query,
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    // Handle other errors
    return res.status(500).json({ error: 'Failed to search messages' });
  }
}
