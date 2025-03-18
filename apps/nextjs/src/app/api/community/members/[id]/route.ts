import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: {
    id: string;
  };
}

/**
 * Get a specific member by ID
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = params.id;

    // Get the member with profile and connection count
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        UserProfile: true,
        _count: {
          select: {
            posts: true,
            ConnectedFrom: { where: { status: "accepted" } },
            ConnectedTo: { where: { status: "accepted" } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Check if current user is connected to this member
    const connectionStatus = await getConnectionStatus(session.user.id, userId);

    // Get user's recent activity (posts, comments, etc)
    const recentActivity = await getRecentActivity(userId);

    // Format the response
    const member = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.image,
      role: user.role,
      joinedDate: user.createdAt,
      postCount: user._count?.posts || 0,
      connections: (user._count?.ConnectedFrom || 0) + (user._count?.ConnectedTo || 0),
      connectionStatus,
      profile: user.UserProfile ? {
        bio: user.UserProfile.bio,
        headline: user.UserProfile.headline,
        location: user.UserProfile.location,
        skills: user.UserProfile.skills,
        expertise: user.UserProfile.expertise,
        experience: user.UserProfile.experience,
        education: user.UserProfile.education,
        socialLinks: user.UserProfile.socialLinks,
        interests: user.UserProfile.interests,
        availability: user.UserProfile.availability,
      } : null,
      recentActivity,
    };

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get the connection status between two users
 */
async function getConnectionStatus(currentUserId: string, targetUserId: string) {
  // Check if there's an existing connection in either direction
  const connection = await db.userConnection.findFirst({
    where: {
      OR: [
        {
          userId: currentUserId,
          connectedToId: targetUserId,
        },
        {
          userId: targetUserId,
          connectedToId: currentUserId,
        },
      ],
    },
  });

  if (!connection) {
    return { status: 'none' };
  }

  // Format the status response
  return {
    status: connection.status,
    id: connection.id,
    createdAt: connection.createdAt,
    initiatedByMe: connection.userId === currentUserId,
  };
}

/**
 * Helper function to get a user's recent activity
 */
async function getRecentActivity(userId: string) {
  // Get recent forum topics created by the user
  const topics = await db.topic.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      forum: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  });

  // Get recent comments by the user
  const comments = await db.comment.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      topic: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  });

  // Get recent group posts by the user
  const posts = await db.groupPost.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      group: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  });

  // Format all activities in a unified format and sort by date
  const activities = [
    ...topics.map(topic => ({
      type: 'topic',
      id: topic.id,
      title: topic.title,
      context: topic.forum.name,
      createdAt: topic.createdAt,
    })),
    ...comments.map(comment => ({
      type: 'comment',
      id: comment.id,
      title: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
      context: comment.topic.title,
      createdAt: comment.createdAt,
    })),
    ...posts.map(post => ({
      type: 'post',
      id: post.id,
      title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
      context: post.group.name,
      createdAt: post.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return activities.slice(0, 5); // Return top 5 most recent activities
}
