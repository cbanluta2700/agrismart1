/**
 * AI Assistant Database Utilities
 * 
 * Provides type-safe functions for interacting with the AI Assistant database schema.
 */

import { executeRawQuery, createRecord, getRecordById, getRecords, updateRecord, deleteRecord } from './neon-db';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface AISession {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: Date;
}

export interface AIFeedback {
  id: string;
  sessionId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Table names with proper quotation for PostgreSQL
const AI_SESSION_TABLE = '"AISession"';
const AI_MESSAGE_TABLE = '"AIMessage"';
const AI_FEEDBACK_TABLE = '"AIFeedback"';
const AI_PROMPT_TEMPLATE_TABLE = '"AIPromptTemplate"';

/**
 * Create a new AI assistant session
 */
export async function createAISession(userId: string, title?: string): Promise<AISession> {
  // Using any to bypass TypeScript's strict checking for the record creation
  return createRecord<AISession>(AI_SESSION_TABLE, {
    id: uuidv4(),
    userId,
    title: title || 'New Chat',
    createdAt: new Date(),
    updatedAt: new Date()
  } as any);
}

/**
 * Get an AI session by ID
 */
export async function getAISessionById(id: string): Promise<AISession | null> {
  return getRecordById<AISession>(AI_SESSION_TABLE, id);
}

/**
 * Get AI sessions for a user
 */
export async function getUserAISessions(userId: string, limit = 20): Promise<AISession[]> {
  return getRecords<AISession>(AI_SESSION_TABLE, {
    filters: { userId },
    orderBy: '"updatedAt"',
    orderDirection: 'DESC',
    limit,
  });
}

/**
 * Update an AI session's title
 */
export async function updateAISessionTitle(id: string, title: string): Promise<AISession> {
  // Using any to bypass TypeScript's strict checking for the record update
  return updateRecord<AISession>(AI_SESSION_TABLE, id, { title, updatedAt: new Date() } as any);
}

/**
 * Delete an AI session and all its messages and feedback
 */
export async function deleteAISession(id: string): Promise<boolean> {
  return deleteRecord(AI_SESSION_TABLE, id);
}

/**
 * Add a message to an AI session
 */
export async function addAIMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  promptTokens?: number,
  completionTokens?: number
): Promise<AIMessage> {
  // Update the session's updatedAt timestamp
  await executeRawQuery(
    `UPDATE ${AI_SESSION_TABLE} SET "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1`,
    sessionId
  );
  
  // Using any to bypass TypeScript's strict checking for the record creation
  return createRecord<AIMessage>(AI_MESSAGE_TABLE, {
    id: uuidv4(),
    sessionId,
    role,
    content,
    promptTokens,
    completionTokens,
    createdAt: new Date()
  } as any);
}

/**
 * Get all messages for an AI session
 */
export async function getAISessionMessages(sessionId: string): Promise<AIMessage[]> {
  return getRecords<AIMessage>(AI_MESSAGE_TABLE, {
    filters: { sessionId },
    orderBy: '"createdAt"',
    orderDirection: 'ASC',
  });
}

/**
 * Add feedback for an AI session
 */
export async function addAIFeedback(
  sessionId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<AIFeedback> {
  // Using any to bypass TypeScript's strict checking for the record creation
  return createRecord<AIFeedback>(AI_FEEDBACK_TABLE, {
    id: uuidv4(),
    sessionId,
    userId,
    rating,
    comment,
    createdAt: new Date()
  } as any);
}

/**
 * Get feedback for an AI session
 */
export async function getAISessionFeedback(sessionId: string): Promise<AIFeedback[]> {
  return getRecords<AIFeedback>(AI_FEEDBACK_TABLE, {
    filters: { sessionId },
    orderBy: '"createdAt"',
    orderDirection: 'DESC',
  });
}

/**
 * Get AI prompt templates by category
 */
export async function getAIPromptTemplatesByCategory(category: string): Promise<AIPromptTemplate[]> {
  return getRecords<AIPromptTemplate>(AI_PROMPT_TEMPLATE_TABLE, {
    filters: { category, isActive: true },
    orderBy: '"name"',
    orderDirection: 'ASC',
  });
}

/**
 * Get all active AI prompt templates
 */
export async function getAllActiveAIPromptTemplates(): Promise<AIPromptTemplate[]> {
  return getRecords<AIPromptTemplate>(AI_PROMPT_TEMPLATE_TABLE, {
    filters: { isActive: true },
    orderBy: '"category"',
    orderDirection: 'ASC',
  });
}

/**
 * Create a new AI prompt template
 */
export async function createAIPromptTemplate(template: Omit<AIPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIPromptTemplate> {
  // Using any to bypass TypeScript's strict checking for the record creation
  return createRecord<AIPromptTemplate>(AI_PROMPT_TEMPLATE_TABLE, {
    id: uuidv4(),
    ...template,
    createdAt: new Date(),
    updatedAt: new Date()
  } as any);
}

/**
 * Update an AI prompt template
 */
export async function updateAIPromptTemplate(
  id: string,
  updates: Partial<Omit<AIPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<AIPromptTemplate> {
  // Using any to bypass TypeScript's strict checking for the record update
  return updateRecord<AIPromptTemplate>(AI_PROMPT_TEMPLATE_TABLE, id, { ...updates, updatedAt: new Date() } as any);
}

/**
 * Apply an AI prompt template with variables
 * 
 * @param templateId The ID of the template to use
 * @param variables An object containing variables to replace in the template
 * @returns The processed template with variables replaced
 */
export async function applyAIPromptTemplate(
  templateId: string,
  variables: Record<string, string>
): Promise<string> {
  const template = await getRecordById<AIPromptTemplate>(AI_PROMPT_TEMPLATE_TABLE, templateId);
  
  if (!template) {
    throw new Error(`AI prompt template with ID ${templateId} not found`);
  }
  
  // Replace variables in the format {{variableName}} with their values
  let processedTemplate = template.template;
  
  for (const [key, value] of Object.entries(variables)) {
    processedTemplate = processedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return processedTemplate;
}
