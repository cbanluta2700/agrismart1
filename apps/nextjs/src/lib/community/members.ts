/**
 * This file contains functions for interacting with community members.
 * Implementation uses db package from Saasfly.
 */

import { db } from "@saasfly/db";

interface CommunityMember {
  id: string;
  name: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  role?: string | null;
  bio?: string | null;
  expertise: string[];
  joinedDate: string;
  postCount: number;
  location?: string | null;
  website?: string | null;
  connections: number;
  // Added profile fields
  headline?: string | null;
  skills?: string[];
  experience?: string | null;
  education?: string | null;
  socialLinks?: Record<string, string> | null;
  interests?: string[];
  availability?: string | null;
}

interface MemberFilterOptions {
  search?: string;
  role?: string;
  expertise?: string[];
  skills?: string[];
  limit?: number;
  skip?: number;
}

/**
 * Get all community members with optional filtering
 * @param options Filter options
 * @returns Filtered community members
 */
export async function getCommunityMembers(options: MemberFilterOptions = {}): Promise<CommunityMember[]> {
  const { search, role, expertise, skills, limit = 50, skip = 0 } = options;
  
  // Build the where clause for filtering
  const where: any = {};
  
  // Apply search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { UserProfile: { bio: { contains: search, mode: "insensitive" } } },
      { UserProfile: { headline: { contains: search, mode: "insensitive" } } },
    ];
  }
  
  // Apply role filter
  if (role) {
    where.role = role;
  }
  
  // Apply expertise filter
  if (expertise && expertise.length > 0) {
    where.UserProfile = {
      ...where.UserProfile,
      expertise: {
        hasSome: expertise,
      },
    };
  }
  
  // Apply skills filter
  if (skills && skills.length > 0) {
    where.UserProfile = {
      ...where.UserProfile,
      skills: {
        hasSome: skills,
      },
    };
  }

  // Get users with their profiles and connection counts
  const users = await db.user.findMany({
    where,
    take: limit,
    skip,
    include: {
      UserProfile: true,
      _count: {
        select: {
          posts: true, // Count of posts by the user
          ConnectedFrom: {
            where: { status: "accepted" },
          },
          ConnectedTo: {
            where: { status: "accepted" },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform the users into the expected format
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    avatarUrl: user.image,
    email: user.email,
    role: user.role,
    bio: user.UserProfile?.bio || null,
    expertise: user.UserProfile?.expertise || [],
    joinedDate: formatDate(user.createdAt),
    postCount: user._count?.posts || 0,
    location: user.UserProfile?.location || null,
    website: null, // Add website field to UserProfile if needed
    connections: (user._count?.ConnectedFrom || 0) + (user._count?.ConnectedTo || 0),
    // Additional profile fields
    headline: user.UserProfile?.headline || null,
    skills: user.UserProfile?.skills || [],
    experience: user.UserProfile?.experience || null,
    education: user.UserProfile?.education || null,
    socialLinks: user.UserProfile?.socialLinks || null,
    interests: user.UserProfile?.interests || [],
    availability: user.UserProfile?.availability || null,
  }));
}

/**
 * Get a community member by ID
 * @param id Member ID
 * @returns The member or null if not found
 */
export async function getCommunityMemberById(id: string): Promise<CommunityMember | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      UserProfile: true,
      _count: {
        select: {
          posts: true,
          ConnectedFrom: {
            where: { status: "accepted" },
          },
          ConnectedTo: {
            where: { status: "accepted" },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.image,
    email: user.email,
    role: user.role,
    bio: user.UserProfile?.bio || null,
    expertise: user.UserProfile?.expertise || [],
    joinedDate: formatDate(user.createdAt),
    postCount: user._count?.posts || 0,
    location: user.UserProfile?.location || null,
    website: null, // Add website field to UserProfile if needed
    connections: (user._count?.ConnectedFrom || 0) + (user._count?.ConnectedTo || 0),
    // Additional profile fields
    headline: user.UserProfile?.headline || null,
    skills: user.UserProfile?.skills || [],
    experience: user.UserProfile?.experience || null,
    education: user.UserProfile?.education || null,
    socialLinks: user.UserProfile?.socialLinks || null,
    interests: user.UserProfile?.interests || [],
    availability: user.UserProfile?.availability || null,
  };
}

/**
 * Get all unique member roles from the community
 * @returns Array of unique roles
 */
export async function getCommunityMemberRoles(): Promise<string[]> {
  const users = await db.user.findMany({
    select: {
      role: true,
    },
    distinct: ["role"],
    where: {
      role: {
        not: null,
      },
    },
  });

  // Filter out null roles and return distinct values
  return users
    .map((user) => user.role)
    .filter((role): role is string => role !== null);
}

/**
 * Get all unique expertise tags from all members
 * @returns Array of unique expertise tags
 */
export async function getCommunityMemberExpertise(): Promise<string[]> {
  const profiles = await db.userProfile.findMany({
    select: {
      expertise: true,
    },
  });

  // Combine all expertise arrays and remove duplicates
  const allExpertise = profiles.flatMap((profile) => profile.expertise || [] as string[]);
  return [...new Set(allExpertise)];
}

/**
 * Get all unique skills from all members
 * @returns Array of unique skills
 */
export async function getCommunityMemberSkills(): Promise<string[]> {
  const profiles = await db.userProfile.findMany({
    select: {
      skills: true,
    },
  });

  // Combine all skills arrays and remove duplicates
  const allSkills = profiles.flatMap((profile) => profile.skills || [] as string[]);
  return [...new Set(allSkills)];
}

/**
 * Get statistics about community members
 * @returns Member statistics
 */
export async function getCommunityMemberStats(): Promise<{
  totalMembers: number;
  newMembersThisMonth: number;
  mostActiveMembers: { id: string; name: string; postCount: number }[];
  connectionStats: { totalConnections: number; averageConnectionsPerMember: number };
}> {
  // Get total members count
  const totalMembers = await db.user.count();

  // Get new members joined this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const newMembersThisMonth = await db.user.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });

  // Get most active members (by post count)
  const activeMembers = await db.user.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
  });

  // Get connection statistics
  const connectionCount = await db.userConnection.count({
    where: {
      status: "accepted",
    },
  });

  return {
    totalMembers,
    newMembersThisMonth,
    mostActiveMembers: activeMembers.map((member) => ({
      id: member.id,
      name: member.name || "Unknown",
      postCount: member._count?.posts || 0,
    })),
    connectionStats: {
      totalConnections: connectionCount,
      averageConnectionsPerMember: totalMembers > 0 ? connectionCount / totalMembers : 0,
    },
  };
}

/**
 * Helper function to format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Get user connections with filter options
 * @param userId The user ID to get connections for
 * @param options Filter options
 * @returns Array of connections
 */
export async function getUserConnections(userId: string, options: { status?: string } = {}) {
  const { status } = options;
  
  const whereClause: any = {
    OR: [
      { userId, },
      { connectedToId: userId },
    ],
  };
  
  if (status) {
    whereClause.status = status;
  }
  
  const connections = await db.userConnection.findMany({
    where: whereClause,
    include: {
      user: {
        include: {
          UserProfile: true,
        },
      },
      connectedTo: {
        include: {
          UserProfile: true,
        },
      },
    },
  });
  
  // Transform the connections to get the connected user (not the current user)
  return connections.map((connection) => {
    const isInitiator = connection.userId === userId;
    const connectedUser = isInitiator ? connection.connectedTo : connection.user;
    
    return {
      id: connection.id,
      status: connection.status,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
      initiatedByMe: isInitiator,
      user: {
        id: connectedUser.id,
        name: connectedUser.name,
        avatarUrl: connectedUser.image,
        email: connectedUser.email,
        bio: connectedUser.UserProfile?.bio || null,
        headline: connectedUser.UserProfile?.headline || null,
        expertise: connectedUser.UserProfile?.expertise || [],
      },
    };
  });
}
