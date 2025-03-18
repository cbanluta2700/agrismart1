/**
 * This file contains functions for interacting with discussion groups in the database.
 * In a real implementation, these would connect to your Prisma models.
 */

interface DiscussionGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  privacy: 'public' | 'private' | 'secret';
  memberCount: number;
  postCount: number;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  topics: string[];
  recentActivity?: {
    type: 'post' | 'member' | 'event';
    date: Date;
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    content: string;
  }[];
}

interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  groupId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: Date;
}

interface GroupPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: {
    id: string;
    type: 'image' | 'document' | 'link';
    url: string;
    name: string;
  }[];
  likes: number;
  comments: number;
}

interface GroupComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
}

// Mock data for discussion groups
const MOCK_GROUPS: DiscussionGroup[] = [
  {
    id: "group1",
    name: "Sustainable Farming Collective",
    slug: "sustainable-farming-collective",
    description: "A group dedicated to sharing sustainable farming practices, regenerative agriculture techniques, and soil health strategies. Join us to discuss permaculture design, no-till methods, cover cropping, and holistic management approaches.",
    coverImage: "/images/community/sustainable-farming.jpg",
    privacy: "public",
    memberCount: 128,
    postCount: 342,
    createdAt: new Date("2023-06-15"),
    createdBy: {
      id: "user3",
      name: "David Wilson"
    },
    topics: ["sustainable farming", "regenerative agriculture", "soil health", "permaculture"],
    recentActivity: [
      {
        type: "post",
        date: new Date("2023-12-04T14:30:00"),
        user: {
          id: "user3",
          name: "David Wilson",
          avatarUrl: "https://i.pravatar.cc/150?u=david"
        },
        content: "Just published a new guide on winter cover crop selection for different climate zones!"
      },
      {
        type: "member",
        date: new Date("2023-12-03T10:15:00"),
        user: {
          id: "user8",
          name: "Emily Parker",
          avatarUrl: "https://i.pravatar.cc/150?u=emily"
        },
        content: "Emily Parker joined the group"
      }
    ]
  },
  {
    id: "group2",
    name: "Small-Scale Market Gardeners",
    slug: "small-scale-market-gardeners",
    description: "A supportive community for small-scale farmers who sell directly to consumers through farmers markets, CSAs, and farm stands. Share marketing strategies, pricing insights, and customer engagement tactics.",
    coverImage: "/images/community/market-garden.jpg",
    privacy: "public",
    memberCount: 94,
    postCount: 216,
    createdAt: new Date("2023-07-22"),
    createdBy: {
      id: "user5",
      name: "James Taylor"
    },
    topics: ["market gardening", "direct sales", "CSA", "farmers markets"],
    recentActivity: [
      {
        type: "post",
        date: new Date("2023-12-05T09:45:00"),
        user: {
          id: "user5",
          name: "James Taylor"
        },
        content: "Has anyone tried using QR codes at market stands? Sharing my experience with them this season."
      }
    ]
  },
  {
    id: "group3",
    name: "AgTech Innovators",
    slug: "agtech-innovators",
    description: "Exploring technology solutions for agricultural challenges. Discuss IoT sensors, automation, drones, data analytics, and software tools that can help farmers improve efficiency and sustainability.",
    coverImage: "/images/community/agtech.jpg",
    privacy: "public",
    memberCount: 76,
    postCount: 183,
    createdAt: new Date("2023-08-10"),
    createdBy: {
      id: "user9",
      name: "Alex Thompson",
      avatarUrl: "https://i.pravatar.cc/150?u=alex"
    },
    topics: ["agtech", "precision agriculture", "farm software", "iot", "automation"]
  },
  {
    id: "group4",
    name: "New Farmer Support Network",
    slug: "new-farmer-support",
    description: "A welcoming space for beginning farmers to ask questions, find mentorship, and share the challenges and triumphs of starting a farming operation.",
    coverImage: "/images/community/new-farmers.jpg",
    privacy: "public",
    memberCount: 142,
    postCount: 395,
    createdAt: new Date("2023-05-03"),
    createdBy: {
      id: "user8",
      name: "Emily Parker",
      avatarUrl: "https://i.pravatar.cc/150?u=emily"
    },
    topics: ["beginning farmers", "farm planning", "startup", "mentorship"]
  },
  {
    id: "group5",
    name: "Livestock Management & Grazing",
    slug: "livestock-grazing",
    description: "For farmers and ranchers focused on livestock production. Topics include rotational grazing, pasture health, animal welfare, heritage breeds, and integrated crop-livestock systems.",
    coverImage: "/images/community/livestock.jpg",
    privacy: "public",
    memberCount: 89,
    postCount: 241,
    createdAt: new Date("2023-09-05"),
    createdBy: {
      id: "user7",
      name: "Thomas Wright"
    },
    topics: ["livestock", "rotational grazing", "pasture management", "animal welfare"]
  }
];

// Mock data for group members
const MOCK_GROUP_MEMBERS: GroupMember[] = [
  {
    id: "member1",
    userId: "user3",
    userName: "David Wilson",
    userAvatarUrl: "https://i.pravatar.cc/150?u=david",
    groupId: "group1",
    role: "owner",
    joinedAt: new Date("2023-06-15")
  },
  {
    id: "member2",
    userId: "user1",
    userName: "Michael Chen",
    groupId: "group1",
    role: "admin",
    joinedAt: new Date("2023-06-16")
  },
  {
    id: "member3",
    userId: "user4",
    userName: "Rebecca Martinez",
    userAvatarUrl: "https://i.pravatar.cc/150?u=rebecca",
    groupId: "group1",
    role: "moderator",
    joinedAt: new Date("2023-06-20")
  },
  {
    id: "member4",
    userId: "user8",
    userName: "Emily Parker",
    userAvatarUrl: "https://i.pravatar.cc/150?u=emily",
    groupId: "group1",
    role: "member",
    joinedAt: new Date("2023-12-03")
  }
];

// Mock data for group posts
const MOCK_GROUP_POSTS: GroupPost[] = [
  {
    id: "post1",
    content: "I'm excited to share our latest results from implementing no-till practices on our vegetable farm. After three years, we've seen a 30% reduction in labor costs related to bed preparation and weed management, along with measurable improvements in soil organic matter and water retention.\n\nOur most successful technique has been using tarps for occultation between crop cycles, combined with heavy mulching for long-season crops. The transition period was challenging (especially in year 2), but we're now seeing the benefits clearly reflected in both soil health metrics and our bottom line.\n\nI've attached some photos showing the difference between our soil structure now vs. when we started. The change is remarkable!\n\nHas anyone else measured specific results from no-till practices on their farm?",
    authorId: "user3",
    authorName: "David Wilson",
    authorAvatarUrl: "https://i.pravatar.cc/150?u=david",
    groupId: "group1",
    createdAt: new Date("2023-12-04T14:30:00"),
    updatedAt: new Date("2023-12-04T14:30:00"),
    attachments: [
      {
        id: "attach1",
        type: "image",
        url: "/images/community/soil-comparison.jpg",
        name: "Soil comparison - 3 year difference"
      },
      {
        id: "attach2",
        type: "document",
        url: "/documents/no-till-results.pdf",
        name: "No-Till Implementation Results.pdf"
      }
    ],
    likes: 24,
    comments: 8
  },
  {
    id: "post2",
    content: "Found this great resource on designing a water-harvesting earthworks system for small farms. The principles are applicable across different climate zones, with specific modifications suggested for each.\n\nThe key insight for me was thinking about the entire property as a connected water flow system, rather than trying to solve water issues in isolated areas.\n\nhttps://sustainablefarming.org/water-harvesting-guide",
    authorId: "user4",
    authorName: "Rebecca Martinez",
    authorAvatarUrl: "https://i.pravatar.cc/150?u=rebecca",
    groupId: "group1",
    createdAt: new Date("2023-11-28T09:15:00"),
    updatedAt: new Date("2023-11-28T09:15:00"),
    attachments: [
      {
        id: "attach3",
        type: "link",
        url: "https://sustainablefarming.org/water-harvesting-guide",
        name: "Water Harvesting Guide for Small Farms"
      }
    ],
    likes: 18,
    comments: 5
  }
];

// Mock data for group comments
const MOCK_GROUP_COMMENTS: GroupComment[] = [
  {
    id: "comment1",
    content: "This is incredibly helpful data, David! We're in year one of transitioning to no-till and those second-year challenges you mentioned are exactly what I'm worried about. Would you be willing to share more details about how you handled the increased weed pressure during that middle period?",
    authorId: "user8",
    authorName: "Emily Parker",
    authorAvatarUrl: "https://i.pravatar.cc/150?u=emily",
    postId: "post1",
    createdAt: new Date("2023-12-04T15:45:00"),
    updatedAt: new Date("2023-12-04T15:45:00"),
    likes: 3
  },
  {
    id: "comment2",
    content: "Those soil structure improvements are remarkable. Are you incorporating any specific cover crop mixes to achieve this, or is it primarily from the no-till practices and mulching alone?",
    authorId: "user1",
    authorName: "Michael Chen",
    postId: "post1",
    createdAt: new Date("2023-12-04T16:30:00"),
    updatedAt: new Date("2023-12-04T16:30:00"),
    likes: 2
  }
];

/**
 * Get all discussion groups
 * @param userId Optional user ID to filter for groups the user is a member of
 * @returns All discussion groups or filtered groups
 */
export async function getDiscussionGroups(userId?: string): Promise<DiscussionGroup[]> {
  // In a real implementation, this would query the database for groups
  // If userId is provided, it would filter for groups the user is a member of
  if (userId) {
    const userMemberships = MOCK_GROUP_MEMBERS.filter((member) => member.userId === userId);
    const userGroupIds = userMemberships.map((member) => member.groupId);
    return MOCK_GROUPS.filter((group) => userGroupIds.includes(group.id));
  }
  
  return MOCK_GROUPS;
}

/**
 * Get discussion groups by topic
 * @param topic The topic to filter by
 * @returns Groups that include the specified topic
 */
export async function getDiscussionGroupsByTopic(topic: string): Promise<DiscussionGroup[]> {
  // In a real implementation, this would query the database for groups with the topic
  return MOCK_GROUPS.filter((group) => 
    group.topics.some((t) => t.toLowerCase().includes(topic.toLowerCase()))
  );
}

/**
 * Get a discussion group by ID
 * @param id The ID of the group
 * @returns The group or null if not found
 */
export async function getDiscussionGroupById(id: string): Promise<DiscussionGroup | null> {
  // In a real implementation, this would query the database for the group
  const group = MOCK_GROUPS.find((group) => group.id === id);
  return group || null;
}

/**
 * Get a discussion group by slug
 * @param slug The slug of the group
 * @returns The group or null if not found
 */
export async function getDiscussionGroupBySlug(slug: string): Promise<DiscussionGroup | null> {
  // In a real implementation, this would query the database for the group
  const group = MOCK_GROUPS.find((group) => group.slug === slug);
  return group || null;
}

/**
 * Create a new discussion group
 * @param data The group data
 * @returns The created group
 */
export async function createDiscussionGroup(data: {
  name: string;
  description: string;
  privacy: 'public' | 'private' | 'secret';
  topics: string[];
  createdBy: {
    id: string;
    name: string;
  };
}): Promise<DiscussionGroup> {
  // In a real implementation, this would create a new group in the database
  const slug = data.name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
  
  const newGroup: DiscussionGroup = {
    id: Math.random().toString(36).substring(2, 11),
    slug,
    memberCount: 1, // Creator is the first member
    postCount: 0,
    createdAt: new Date(),
    ...data,
  };
  
  // Add to mock data - in a real implementation, this would be saved to the database
  MOCK_GROUPS.push(newGroup);
  
  // Create the owner membership
  const membership: GroupMember = {
    id: Math.random().toString(36).substring(2, 11),
    userId: data.createdBy.id,
    userName: data.createdBy.name,
    groupId: newGroup.id,
    role: 'owner',
    joinedAt: new Date(),
  };
  
  // Add to mock data - in a real implementation, this would be saved to the database
  MOCK_GROUP_MEMBERS.push(membership);
  
  return newGroup;
}

/**
 * Get members of a discussion group
 * @param groupId The ID of the group
 * @returns Group members
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  // In a real implementation, this would query the database for group members
  return MOCK_GROUP_MEMBERS.filter((member) => member.groupId === groupId);
}

/**
 * Check if a user is a member of a group
 * @param userId The ID of the user
 * @param groupId The ID of the group
 * @returns True if the user is a member, false otherwise
 */
export async function isGroupMember(userId: string, groupId: string): Promise<boolean> {
  // In a real implementation, this would query the database
  return MOCK_GROUP_MEMBERS.some(
    (member) => member.userId === userId && member.groupId === groupId
  );
}

/**
 * Get a user's role in a group
 * @param userId The ID of the user
 * @param groupId The ID of the group
 * @returns The user's role or null if not a member
 */
export async function getUserGroupRole(userId: string, groupId: string): Promise<'owner' | 'admin' | 'moderator' | 'member' | null> {
  // In a real implementation, this would query the database
  const membership = MOCK_GROUP_MEMBERS.find(
    (member) => member.userId === userId && member.groupId === groupId
  );
  
  return membership ? membership.role : null;
}

/**
 * Add a user to a group
 * @param data The membership data
 * @returns The created membership
 */
export async function addGroupMember(data: {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  groupId: string;
  role?: 'admin' | 'moderator' | 'member';
}): Promise<GroupMember> {
  // In a real implementation, this would create a membership in the database
  const newMembership: GroupMember = {
    id: Math.random().toString(36).substring(2, 11),
    role: data.role || 'member',
    joinedAt: new Date(),
    ...data,
  };
  
  // Add to mock data - in a real implementation, this would be saved to the database
  MOCK_GROUP_MEMBERS.push(newMembership);
  
  // Update member count
  const group = MOCK_GROUPS.find((group) => group.id === data.groupId);
  if (group) {
    group.memberCount += 1;
  }
  
  return newMembership;
}

/**
 * Remove a member from a group
 * @param userId The ID of the user
 * @param groupId The ID of the group
 * @returns True if successful
 */
export async function removeGroupMember(userId: string, groupId: string): Promise<boolean> {
  // In a real implementation, this would delete the membership from the database
  const index = MOCK_GROUP_MEMBERS.findIndex(
    (member) => member.userId === userId && member.groupId === groupId
  );
  
  if (index === -1) {
    return false;
  }
  
  // Remove from mock data - in a real implementation, this would be deleted from the database
  MOCK_GROUP_MEMBERS.splice(index, 1);
  
  // Update member count
  const group = MOCK_GROUPS.find((group) => group.id === groupId);
  if (group) {
    group.memberCount -= 1;
  }
  
  return true;
}

/**
 * Get posts for a group
 * @param groupId The ID of the group
 * @returns Group posts
 */
export async function getGroupPosts(groupId: string): Promise<GroupPost[]> {
  // In a real implementation, this would query the database for group posts
  return MOCK_GROUP_POSTS.filter((post) => post.groupId === groupId);
}

/**
 * Get a group post by ID
 * @param id The ID of the post
 * @returns The post or null if not found
 */
export async function getGroupPostById(id: string): Promise<GroupPost | null> {
  // In a real implementation, this would query the database for the post
  const post = MOCK_GROUP_POSTS.find((post) => post.id === id);
  return post || null;
}

/**
 * Create a new group post
 * @param data The post data
 * @returns The created post
 */
export async function createGroupPost(data: {
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  groupId: string;
  attachments?: {
    type: 'image' | 'document' | 'link';
    url: string;
    name: string;
  }[];
}): Promise<GroupPost> {
  // In a real implementation, this would create a new post in the database
  const newPost: GroupPost = {
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    comments: 0,
    ...data,
    attachments: data.attachments?.map(attachment => ({
      id: Math.random().toString(36).substring(2, 11),
      ...attachment,
    })),
  };
  
  // Add to mock data - in a real implementation, this would be saved to the database
  MOCK_GROUP_POSTS.push(newPost);
  
  // Update post count
  const group = MOCK_GROUPS.find((group) => group.id === data.groupId);
  if (group) {
    group.postCount += 1;
  }
  
  return newPost;
}

/**
 * Get comments for a group post
 * @param postId The ID of the post
 * @returns Post comments
 */
export async function getGroupPostComments(postId: string): Promise<GroupComment[]> {
  // In a real implementation, this would query the database for post comments
  return MOCK_GROUP_COMMENTS.filter((comment) => comment.postId === postId);
}

/**
 * Create a new comment on a group post
 * @param data The comment data
 * @returns The created comment
 */
export async function createGroupComment(data: {
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  postId: string;
}): Promise<GroupComment> {
  // In a real implementation, this would create a new comment in the database
  const newComment: GroupComment = {
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    ...data,
  };
  
  // Add to mock data - in a real implementation, this would be saved to the database
  MOCK_GROUP_COMMENTS.push(newComment);
  
  // Increment comment count on the post
  const post = MOCK_GROUP_POSTS.find((post) => post.id === data.postId);
  if (post) {
    post.comments += 1;
  }
  
  return newComment;
}

/**
 * Get popular/trending discussion group topics
 * @returns Popular topics with group counts
 */
export async function getPopularGroupTopics(): Promise<{topic: string; count: number}[]> {
  // In a real implementation, this would analyze database data
  const allTopics = MOCK_GROUPS.flatMap((group) => group.topics);
  const topicCounts = allTopics.reduce<Record<string, number>>((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}
