export const UserRole = {
  BUYER: "BUYER",
  SELLER: "SELLER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export const MessageStatus = {
  SENDING: "SENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  ERROR: "ERROR",
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];
export const NotificationType = {
  MESSAGE: "MESSAGE",
  MENTION: "MENTION",
  THREAD_REPLY: "THREAD_REPLY",
  GROUP_INVITATION: "GROUP_INVITATION",
  REACTION: "REACTION",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
