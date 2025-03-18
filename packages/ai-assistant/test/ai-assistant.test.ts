import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  aiLanguageModels, 
  chatCompletionPrompt, 
  rateLimitRequest,
  createChat, 
  saveMessage,
  getUserChats,
  getChatMessages
} from '../index';

// Mock DB
vi.mock('@saasfly/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'test-chat-id' }]),
    query: {
      messages: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'test-message-id',
            content: 'Test message content',
            role: 'user',
            createdAt: new Date()
          }
        ]),
      },
      chats: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'test-chat-id',
            title: 'Test chat',
            userId: 'test-user-id',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]),
      },
      votes: {
        findFirst: vi.fn().mockResolvedValue(null),
      }
    },
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  }
}));

// Mock Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    // Redis mock implementation
  }))
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 86400000
    }),
    slidingWindow: vi.fn()
  })),
}));

describe('AI Assistant Package', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Models', () => {
    it('should export language models', () => {
      expect(aiLanguageModels).toBeDefined();
      expect(aiLanguageModels['chat-model-small']).toBeDefined();
      expect(aiLanguageModels['chat-model-large']).toBeDefined();
    });
  });

  describe('Prompts', () => {
    it('should export chat completion prompt', () => {
      expect(chatCompletionPrompt).toBeDefined();
      expect(typeof chatCompletionPrompt).toBe('string');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests when rate limit is not exceeded', async () => {
      const result = await rateLimitRequest('test-user-id');
      expect(result.success).toBe(true);
    });
  });

  describe('Database Operations', () => {
    it('should create a new chat', async () => {
      const chat = await createChat({
        title: 'Test Chat',
        userId: 'test-user-id',
        model: 'chat-model-small'
      });
      expect(chat).toBeDefined();
      expect(chat.id).toBe('test-chat-id');
    });

    it('should save a message', async () => {
      const message = await saveMessage({
        chatId: 'test-chat-id',
        content: 'Test message',
        role: 'user'
      });
      expect(message).toBeDefined();
    });

    it('should get chat messages', async () => {
      const messages = await getChatMessages('test-chat-id');
      expect(messages).toBeDefined();
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should get user chats', async () => {
      const chats = await getUserChats('test-user-id');
      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
    });
  });
});
