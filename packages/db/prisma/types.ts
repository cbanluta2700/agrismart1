import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { UserRole, OrderStatus, MessageStatus, NotificationType } from "./enums";

export type Account = {
    id: Generated<string>;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
};
export type Article = {
    id: Generated<string>;
    title: string;
    slug: string;
    content: string;
    imageUrl: string | null;
    authorId: string;
    tags: string[];
    viewCount: Generated<number>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type CartItem = {
    id: Generated<string>;
    userId: string;
    productId: string;
    quantity: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Category = {
    id: Generated<string>;
    name: string;
    parentId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type ChatMessage = {
    id: Generated<string>;
    sessionId: string;
    role: string;
    content: string;
    promptTokens: number | null;
    completionTokens: number | null;
    createdAt: Generated<Timestamp>;
};
export type ChatSession = {
    id: Generated<string>;
    userId: string;
    title: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Comment = {
    id: Generated<string>;
    content: string;
    topicId: string;
    authorId: string;
    parentCommentId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Conversation = {
    id: Generated<string>;
    name: string | null;
    isGroup: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    creatorId: string | null;
    lastMessageAt: Generated<Timestamp>;
    groupAvatar: string | null;
    description: string | null;
    isArchived: Generated<boolean>;
    isPinned: Generated<boolean>;
};
export type ConversationParticipant = {
    id: Generated<string>;
    userId: string;
    conversationId: string;
    isAdmin: Generated<boolean>;
    joinedAt: Generated<Timestamp>;
    leftAt: Timestamp | null;
    hasNewMessages: Generated<boolean>;
    lastReadMessageId: string | null;
    notificationsEnabled: Generated<boolean>;
};
export type Course = {
    id: Generated<string>;
    title: string;
    slug: string;
    description: string;
    imageUrl: string | null;
    instructorId: string;
    level: Generated<string>;
    duration: number | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type CourseEnrollment = {
    id: Generated<string>;
    userId: string;
    courseId: string;
    progress: Generated<number>;
    isComplete: Generated<boolean>;
    startedAt: Generated<Timestamp>;
    completedAt: Timestamp | null;
};
export type Customer = {
    id: Generated<string>;
    userId: string;
    stripeId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Documentation = {
    id: Generated<string>;
    title: string;
    slug: string;
    content: string;
    parentId: string | null;
    authorId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Favorite = {
    id: Generated<string>;
    userId: string;
    productId: string;
    createdAt: Generated<Timestamp>;
};
export type Feedback = {
    id: Generated<string>;
    sessionId: string;
    userId: string;
    rating: number;
    comment: string | null;
    createdAt: Generated<Timestamp>;
};
export type Forum = {
    id: Generated<string>;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Group = {
    id: Generated<string>;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    privacy: Generated<string>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type GroupComment = {
    id: Generated<string>;
    content: string;
    postId: string;
    authorId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type GroupMember = {
    id: Generated<string>;
    groupId: string;
    userId: string;
    role: Generated<string>;
    joinedAt: Generated<Timestamp>;
    isAdmin: Generated<boolean>;
};
export type GroupPost = {
    id: Generated<string>;
    content: string;
    groupId: string;
    authorId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Lesson = {
    id: Generated<string>;
    title: string;
    content: string;
    videoUrl: string | null;
    duration: number | null;
    orderIndex: Generated<number>;
    courseId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Message = {
    id: Generated<string>;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    isRead: Generated<boolean>;
    isReplyToId: string | null;
    replyCount: Generated<number>;
    status: Generated<MessageStatus>;
    isEdited: Generated<boolean>;
    editedAt: Timestamp | null;
};
export type MessageAttachment = {
    id: Generated<string>;
    messageId: string;
    url: string;
    type: string;
    name: string;
    size: number;
    createdAt: Generated<Timestamp>;
    thumbnailUrl: string | null;
    processingStatus: string | null;
    mimeType: string | null;
};
export type MessageReaction = {
    id: Generated<string>;
    messageId: string;
    userId: string;
    emoji: string;
    createdAt: Generated<Timestamp>;
};
export type Notification = {
    id: Generated<string>;
    userId: string;
    type: NotificationType;
    message: string;
    read: Generated<boolean>;
    data: unknown | null;
    createdAt: Generated<Timestamp>;
};
export type Order = {
    id: Generated<string>;
    buyerId: string;
    status: Generated<OrderStatus>;
    total: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type OrderItem = {
    id: Generated<string>;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Organization = {
    id: Generated<string>;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    website: string | null;
    location: string | null;
    isVerified: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type OrganizationMember = {
    id: Generated<string>;
    organizationId: string;
    userId: string;
    role: Generated<string>;
    joinedAt: Generated<Timestamp>;
    isAdmin: Generated<boolean>;
};
export type Product = {
    id: Generated<string>;
    name: string;
    description: string | null;
    price: number;
    stock: Generated<number>;
    images: string[];
    sellerId: string;
    categoryId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type PromptTemplate = {
    id: Generated<string>;
    name: string;
    description: string | null;
    template: string;
    category: string;
    isActive: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Review = {
    id: Generated<string>;
    userId: string;
    productId: string;
    rating: number;
    comment: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Session = {
    id: Generated<string>;
    sessionToken: string;
    userId: string;
    expires: Timestamp;
};
export type Topic = {
    id: Generated<string>;
    title: string;
    slug: string;
    content: string;
    forumId: string;
    authorId: string;
    viewCount: Generated<number>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type User = {
    id: Generated<string>;
    name: string | null;
    email: string | null;
    emailVerified: Timestamp | null;
    image: string | null;
    password: string | null;
    role: Generated<UserRole>;
};
export type UserConnection = {
    id: Generated<string>;
    userId: string;
    connectedToId: string;
    status: Generated<string>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type UserProfile = {
    id: Generated<string>;
    userId: string;
    bio: string | null;
    headline: string | null;
    location: string | null;
    skills: string[];
    expertise: string[];
    experience: string | null;
    education: string | null;
    socialLinks: unknown | null;
    interests: string[];
    availability: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type DB = {
    Account: Account;
    Article: Article;
    CartItem: CartItem;
    Category: Category;
    ChatMessage: ChatMessage;
    ChatSession: ChatSession;
    Comment: Comment;
    Conversation: Conversation;
    ConversationParticipant: ConversationParticipant;
    Course: Course;
    CourseEnrollment: CourseEnrollment;
    Customer: Customer;
    Documentation: Documentation;
    Favorite: Favorite;
    Feedback: Feedback;
    Forum: Forum;
    Group: Group;
    GroupComment: GroupComment;
    GroupMember: GroupMember;
    GroupPost: GroupPost;
    Lesson: Lesson;
    Message: Message;
    MessageAttachment: MessageAttachment;
    MessageReaction: MessageReaction;
    Notification: Notification;
    Order: Order;
    OrderItem: OrderItem;
    Organization: Organization;
    OrganizationMember: OrganizationMember;
    Product: Product;
    PromptTemplate: PromptTemplate;
    Review: Review;
    Session: Session;
    Topic: Topic;
    User: User;
    UserConnection: UserConnection;
    UserProfile: UserProfile;
};
