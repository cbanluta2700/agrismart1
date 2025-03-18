/**
 * This file contains functions for interacting with forums in the database.
 */

import prisma from "@saasfly/db";
import type { Prisma } from "@prisma/client";
import { Icons } from "@/components/icons.tsx"; // Fixed import path

// Define interfaces that match our Prisma schema
export interface ForumCategoryWithCounts {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  topicCount: number;
  postCount: number;
  latestTopics: {
    id: string;
    title: string;
    date: string;
  }[];
}

export interface ForumTopicWithDetails {
  id: string;
  title: string;
  content: string;
  tags: string[];
  forumId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  replyCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ForumCommentWithAuthor {
  id: string;
  content: string;
  topicId: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: number;
}

interface ForumStats {
  topics: number;
  posts: number;
  members: number;
  newestMember: string;
  activeMembers: {
    name: string;
    posts: number;
  }[];
}

/**
 * Get all forum categories
 * @returns All forum categories
 */
export async function getForumCategories(): Promise<ForumCategoryWithCounts[]> {
  // Get all forums
  const forums = await prisma.forum.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // For each forum, get topic count and post count
  const forumsWithCounts = await Promise.all(
    forums.map(async (forum: { id: string; [key: string]: any }) => {
      const topicCount = await prisma.topic.count({
        where: { forumId: forum.id },
      });

      // Get post count (comments) for all topics in this forum
      const topics = await prisma.topic.findMany({
        where: { forumId: forum.id },
        select: { id: true },
      });

      const topicIds = topics.map((topic: { id: string }) => topic.id);
      const postCount = topicIds.length > 0 
        ? await prisma.comment.count({
            where: { topicId: { in: topicIds } },
          })
        : 0;

      // Get latest topics
      const latestTopics = await prisma.topic.findMany({
        where: { forumId: forum.id },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      });

      return {
        ...forum,
        topicCount,
        postCount,
        latestTopics: latestTopics.map((topic: { id: string; title: string; createdAt: Date }) => ({
          id: topic.id,
          title: topic.title,
          date: formatDate(topic.createdAt),
        })),
      };
    })
  );

  return forumsWithCounts;
}

/**
 * Get a forum category by its ID
 * @param id The ID of the category
 * @returns The category or null if not found
 */
export async function getForumCategoryById(id: string): Promise<ForumCategoryWithCounts | null> {
  const forum = await prisma.forum.findUnique({
    where: { id },
  });

  if (!forum) return null;

  // Get topic count
  const topicCount = await prisma.topic.count({
    where: { forumId: id },
  });

  // Get topics to calculate post count and get latest topics
  const topics = await prisma.topic.findMany({
    where: { forumId: id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  const topicIds = topics.map((topic: { id: string }) => topic.id);
  const postCount = topicIds.length > 0
    ? await prisma.comment.count({
        where: { topicId: { in: topicIds } },
      })
    : 0;

  // Format latest topics
  const latestTopics = topics.slice(0, 2).map((topic: { id: string; title: string; createdAt: Date }) => ({
    id: topic.id,
    title: topic.title,
    date: formatDate(topic.createdAt),
  }));

  return {
    ...forum,
    topicCount,
    postCount,
    latestTopics,
  };
}

/**
 * Get a forum category by its slug
 * @param slug The slug of the category
 * @returns The category or null if not found
 */
export async function getForumCategoryBySlug(slug: string): Promise<ForumCategoryWithCounts | null> {
  const forum = await prisma.forum.findUnique({
    where: { slug },
  });

  if (!forum) return null;

  // Get topic count
  const topicCount = await prisma.topic.count({
    where: { forumId: forum.id },
  });

  // Get topics to calculate post count and get latest topics
  const topics = await prisma.topic.findMany({
    where: { forumId: forum.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  const topicIds = topics.map((topic: { id: string }) => topic.id);
  const postCount = topicIds.length > 0
    ? await prisma.comment.count({
        where: { topicId: { in: topicIds } },
      })
    : 0;

  // Format latest topics
  const latestTopics = topics.slice(0, 2).map((topic: { id: string; title: string; createdAt: Date }) => ({
    id: topic.id,
    title: topic.title,
    date: formatDate(topic.createdAt),
  }));

  return {
    ...forum,
    topicCount,
    postCount,
    latestTopics,
  };
}

/**
 * Get all forum topics
 * @returns All forum topics
 */
export async function getForumTopics(): Promise<ForumTopicWithDetails[]> {
  return await getTopicsWithDetails();
}

/**
 * Get forum topics for a specific category
 * @param forumId The ID of the forum
 * @returns Topics for the forum
 */
export async function getForumTopicsByCategory(forumId: string): Promise<ForumTopicWithDetails[]> {
  return await getTopicsWithDetails({ forumId });
}

/**
 * Get a forum topic by its ID
 * @param id The ID of the topic
 * @returns The topic or null if not found
 */
export async function getForumTopicById(id: string): Promise<ForumTopicWithDetails | null> {
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!topic) return null;

  // Get reply count
  const replyCount = await prisma.comment.count({
    where: { topicId: id },
  });

  // Increment view count
  await prisma.topic.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  return {
    ...topic,
    viewCount: topic.viewCount || 0,
    replyCount,
  };
}

/**
 * Get forum comments for a specific topic
 * @param topicId The ID of the topic
 * @returns Comments for the topic
 */
export async function getForumCommentsByTopic(topicId: string): Promise<ForumCommentWithAuthor[]> {
  const comments = await prisma.comment.findMany({
    where: { topicId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Since we don't have a likes table yet, we'll return 0 for now
  return comments.map((comment: any) => ({
    ...comment,
    likes: 0,
  }));
}

/**
 * Create a new forum topic
 * @param data The topic data
 * @returns The created topic
 */
export async function createForumTopic(
  data: {
    title: string;
    content: string;
    forumId: string;
    authorId: string;
    tags?: string[];
  }
): Promise<ForumTopicWithDetails> {
  const topic = await prisma.topic.create({
    data: {
      title: data.title,
      content: data.content,
      forumId: data.forumId,
      authorId: data.authorId,
      tags: data.tags || [],
      viewCount: 0,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    ...topic,
    viewCount: 0,
    replyCount: 0,
  };
}

/**
 * Create a new forum comment
 * @param data The comment data
 * @returns The created comment
 */
export async function createForumComment(
  data: {
    content: string;
    topicId: string;
    authorId: string;
    parentId?: string;
  }
): Promise<ForumCommentWithAuthor> {
  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      topicId: data.topicId,
      authorId: data.authorId,
      parentId: data.parentId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    ...comment,
    likes: 0,
  };
}

/**
 * Get forum statistics
 * @returns Forum statistics
 */
export async function getForumStats(): Promise<ForumStats> {
  // Get topic count
  const topicsCount = await prisma.topic.count();

  // Get post count
  const postsCount = await prisma.comment.count();

  // Get member count (users who have posted or commented)
  const uniqueUsers = await prisma.user.count({
    where: {
      OR: [
        { topics: { some: {} } },
        { comments: { some: {} } },
      ],
    },
  });

  // Get newest member (most recently created user who has forum activity)
  const newestMember = await prisma.user.findFirst({
    where: {
      OR: [
        { topics: { some: {} } },
        { comments: { some: {} } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { name: true },
  });

  // Get most active members
  const activeMembers = await prisma.$queryRaw<{ name: string | null, posts: number }[]>`
    SELECT u."name", COUNT(c.id) as posts
    FROM "User" u
    LEFT JOIN "Comment" c ON u.id = c."authorId"
    GROUP BY u.id, u.name
    ORDER BY posts DESC
    LIMIT 5
  `;

  return {
    topics: topicsCount,
    posts: postsCount,
    members: uniqueUsers,
    newestMember: newestMember?.name || 'No members yet',
    activeMembers: activeMembers.map((member: { name: string | null; posts: any }) => ({
      name: member.name || 'Anonymous',
      posts: Number(member.posts),
    })),
  };
}

// Helper function to get topics with details
async function getTopicsWithDetails(where: Record<string, any> = {}): Promise<ForumTopicWithDetails[]> {
  const topics = await prisma.topic.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // For each topic, get the reply count
  const topicsWithDetails = await Promise.all(
    topics.map(async (topic: any) => {
      const replyCount = await prisma.comment.count({
        where: { topicId: topic.id },
      });

      return {
        ...topic,
        viewCount: topic.viewCount || 0,
        replyCount,
      };
    })
  );

  return topicsWithDetails;
}

// Helper function to format date as "X days ago"
function formatDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  
  return `${Math.floor(diffInDays / 30)} months ago`;
}
