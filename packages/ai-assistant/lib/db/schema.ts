import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Create pgTable with the custom schema name
const pgTable = pgTableCreator((name) => `ai_assistant_${name}`);

// Chat visibility enum
export const visibilityEnum = pgEnum("visibility", ["public", "private"]);

// Chat Table for storing chat sessions
export const chats = pgTable(
  "chats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    model: text("model").notNull().default("chat-model-small"),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    sharePath: text("share_path").unique(),
  },
  (table) => {
    return {
      userIdIdx: index("chats_user_id_idx").on(table.userId),
      sharePathIdx: index("chats_share_path_idx").on(table.sharePath),
    };
  }
);

// Chat relations
export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}));

// Messages Table for storing individual chat messages
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    role: text("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    model: text("model"),
    reasoning: text("reasoning"),
    metadata: json("metadata"),
  },
  (table) => {
    return {
      chatIdIdx: index("messages_chat_id_idx").on(table.chatId),
    };
  }
);

// Message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

// User feedback on chat messages
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    status: integer("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      messageIdIdx: index("votes_message_id_idx").on(table.messageId),
      userIdMessageIdIdx: index("votes_user_id_message_id_idx").on(
        table.userId,
        table.messageId
      ),
    };
  }
);

// Vote relations
export const votesRelations = relations(votes, ({ one }) => ({
  message: one(messages, {
    fields: [votes.messageId],
    references: [messages.id],
  }),
}));

// Export database schema types
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Vote = typeof votes.$inferSelect;
