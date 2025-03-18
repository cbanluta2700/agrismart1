import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messagesRouter = createTRPCRouter({
  // Get thread replies for a specific message
  getThreadReplies: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { messageId } = input;
        const { prisma, session } = ctx;

        // Verify that the user has access to this message
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: {
            conversation: {
              include: {
                participants: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        });

        // Check if the message exists and the user is a participant in the conversation
        if (!message || message.conversation.participants.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Message not found or you don't have access to it",
          });
        }

        // Get all thread replies for this message
        const replies = await prisma.message.findMany({
          where: {
            isReplyToId: messageId,
          },
          include: {
            attachments: true,
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        return replies;
      } catch (error) {
        console.error("Error getting thread replies:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get thread replies",
        });
      }
    }),

  // Create a new thread reply
  createThreadReply: protectedProcedure
    .input(
      z.object({
        parentMessageId: z.string(),
        conversationId: z.string(),
        content: z.string(),
        attachments: z
          .array(
            z.object({
              url: z.string(),
              type: z.string(),
              name: z.string(),
              size: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { parentMessageId, conversationId, content, attachments = [] } = input;
        const { prisma, session } = ctx;

        // Verify that the user has access to this conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            participants: {
              where: {
                userId: session.user.id,
              },
            },
          },
        });

        if (!conversation || conversation.participants.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found or you don't have access to it",
          });
        }

        // Verify that the parent message exists and belongs to the conversation
        const parentMessage = await prisma.message.findUnique({
          where: {
            id: parentMessageId,
            conversationId,
          },
        });

        if (!parentMessage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent message not found",
          });
        }

        // Create the reply message
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: session.user.id,
            content,
            isReplyToId: parentMessageId,
            attachments: {
              createMany: {
                data: attachments.map((att) => ({
                  url: att.url,
                  type: att.type,
                  name: att.name,
                  size: att.size,
                })),
              },
            },
          },
          include: {
            attachments: true,
            reactions: true,
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        // Increment the replyCount of the parent message
        await prisma.message.update({
          where: {
            id: parentMessageId,
          },
          data: {
            replyCount: {
              increment: 1,
            },
          },
        });

        // Update the conversation's lastMessageAt
        await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            lastMessageAt: new Date(),
          },
        });

        // Create notification for thread reply (for all participants except the sender)
        const participants = await prisma.conversationParticipant.findMany({
          where: {
            conversationId,
            userId: {
              not: session.user.id, // Exclude the sender
            },
          },
          select: {
            userId: true,
          },
        });

        // Create notifications for all other participants
        await prisma.notification.createMany({
          data: participants.map((participant) => ({
            userId: participant.userId,
            type: "THREAD_REPLY",
            message: `${session.user.name || "Someone"} replied to a thread`,
            data: {
              conversationId,
              messageId: message.id,
              parentMessageId,
            },
          })),
        });

        return message;
      } catch (error) {
        console.error("Error creating thread reply:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create thread reply",
        });
      }
    }),

  // Mark thread replies as read
  markThreadAsRead: protectedProcedure
    .input(
      z.object({
        parentMessageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { parentMessageId } = input;
        const { prisma, session } = ctx;

        // Get the conversation ID for the parent message
        const parentMessage = await prisma.message.findUnique({
          where: { id: parentMessageId },
          select: { conversationId: true },
        });

        if (!parentMessage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent message not found",
          });
        }

        // Verify user has access to the conversation
        const conversationAccess = await prisma.conversationParticipant.findUnique({
          where: {
            userId_conversationId: {
              userId: session.user.id,
              conversationId: parentMessage.conversationId,
            },
          },
        });

        if (!conversationAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this conversation",
          });
        }

        // Mark all unread replies as read
        const result = await prisma.message.updateMany({
          where: {
            isReplyToId: parentMessageId,
            isRead: false,
            senderId: {
              not: session.user.id, // Only mark messages from others as read
            },
          },
          data: {
            isRead: true,
          },
        });

        return { count: result.count };
      } catch (error) {
        console.error("Error marking thread as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark thread as read",
        });
      }
    }),
});
