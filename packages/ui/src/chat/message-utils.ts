// Define types locally since we can't import from the db package directly
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  isReplyToId?: string | null;
  replyCount: number;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  url: string;
  type: string;
  name: string;
  size: number;
  createdAt: Date;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
  };
}

export interface ThreadMessageType {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  isRead: boolean;
  createdAt: string;
  isReplyToId?: string;
  replyCount: number;
  reactions?: {
    userId: string;
    emoji: string;
    createdAt: string;
  }[];
}

/**
 * Converts a database Message object to the ThreadMessageType format used by UI components
 */
export function convertToThreadMessageType(
  message: Message & {
    attachments?: MessageAttachment[];
    reactions?: MessageReaction[];
  }
): ThreadMessageType {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    attachments: message.attachments?.map((attachment: MessageAttachment) => ({
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      url: attachment.url,
    })),
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
    isReplyToId: message.isReplyToId || undefined,
    replyCount: message.replyCount,
    reactions: message.reactions?.map((reaction: MessageReaction) => ({
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt.toISOString(),
    })),
  };
}

/**
 * Gets thread replies for a specific message
 */
export async function getThreadReplies(
  messageId: string,
  prisma: any
): Promise<ThreadMessageType[]> {
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
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return replies.map(convertToThreadMessageType);
}

/**
 * Creates a new thread reply message
 */
export async function createThreadReply(
  parentMessageId: string,
  senderId: string,
  conversationId: string,
  content: string,
  attachments: { url: string; type: string; name: string; size: number }[] = [],
  prisma: any
): Promise<ThreadMessageType> {
  // Create reply message
  const message = await prisma.message.create({
    data: {
      senderId,
      conversationId,
      content,
      isReplyToId: parentMessageId,
      attachments: {
        createMany: {
          data: attachments.map(att => ({
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

  return convertToThreadMessageType(message);
}
