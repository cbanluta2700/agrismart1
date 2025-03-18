/**
 * Database Models Type Definitions
 * 
 * This file defines TypeScript interfaces for all database models
 * to ensure type safety when working with database records.
 */

// Base model with common fields
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Auth Models
export interface User extends BaseModel {
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: UserRole;
}

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export interface Account extends BaseModel {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session extends BaseModel {
  sessionToken: string;
  userId: string;
  expires: Date;
}

// Marketplace Models
export interface Product extends BaseModel {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  sellerId: string;
  categoryId: string | null;
}

export interface Category extends BaseModel {
  name: string;
  parentId: string | null;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order extends BaseModel {
  buyerId: string;
  status: OrderStatus;
  total: number;
}

export interface OrderItem extends BaseModel {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Review extends BaseModel {
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
}

export interface CartItem extends BaseModel {
  userId: string;
  productId: string;
  quantity: number;
}

export interface Favorite extends BaseModel {
  userId: string;
  productId: string;
}

// Community Models
export interface Organization extends BaseModel {
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface OrganizationMember extends BaseModel {
  organizationId: string;
  userId: string;
  role: MemberRole;
}

export interface Forum extends BaseModel {
  name: string;
  description: string | null;
  slug: string;
  organizationId: string | null;
  isPublic: boolean;
}

export interface Topic extends BaseModel {
  title: string;
  content: string;
  forumId: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
}

export interface Comment extends BaseModel {
  content: string;
  topicId: string;
  authorId: string;
  parentId: string | null;
}

export interface Group extends BaseModel {
  name: string;
  description: string | null;
  slug: string;
  logo: string | null;
  organizationId: string | null;
  isPrivate: boolean;
}

export interface GroupMember extends BaseModel {
  groupId: string;
  userId: string;
  role: MemberRole;
}

// Resources Models
export interface Article extends BaseModel {
  title: string;
  content: string;
  slug: string;
  authorId: string;
  categoryId: string | null;
  publishedAt: Date | null;
}

export interface Course extends BaseModel {
  title: string;
  description: string;
  slug: string;
  instructorId: string;
  thumbnail: string | null;
  price: number | null;
  isPublished: boolean;
}

export interface Lesson extends BaseModel {
  title: string;
  content: string;
  courseId: string;
  order: number;
}

export interface CourseEnrollment extends BaseModel {
  courseId: string;
  userId: string;
  progress: number;
  completedAt: Date | null;
}

export interface Documentation extends BaseModel {
  title: string;
  content: string;
  slug: string;
  parentId: string | null;
  order: number;
}
