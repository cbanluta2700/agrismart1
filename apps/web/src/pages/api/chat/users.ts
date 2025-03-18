/**
 * Chat Users API
 * 
 * API endpoint for fetching users that can be added to conversations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@saasfly/auth';
import prisma from '@saasfly/db';
import { z } from 'zod';

// Validation schema for query parameters
const searchParamsSchema = z.object({
  search: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive().max(100)).optional().default('20'),
  excludeIds: z.string().transform(ids => ids.split(',')).optional(),
});

// API handler for searching and listing users
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate and parse query parameters
    const { search, limit, excludeIds } = searchParamsSchema.parse(req.query);
    
    // Build search query conditions
    const whereConditions: any = {
      NOT: { id: session.user.id }, // Exclude current user
    };

    // Add search term if provided
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add excluded user IDs if provided
    if (excludeIds?.length) {
      whereConditions.NOT = {
        id: { in: excludeIds },
      };
    }

    // Query database for users
    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    // Return results
    return res.status(200).json({
      users: users.map((user: { id: string; name: string | null; email: string | null; image: string | null }) => ({
        ...user,
        imageUrl: user.image
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    // Handle other errors
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
