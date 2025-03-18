/**
 * Neon Database Utilities
 * 
 * This module provides utility functions for working with Neon PostgreSQL
 * using the @neondatabase/serverless driver, which is optimized for
 * serverless environments like Vercel functions and Next.js server components.
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

// Configure Neon with WebSockets for better performance in serverless environments
neonConfig.webSocketConstructor = globalThis.WebSocket;
// Configure the fetch endpoint
neonConfig.fetchEndpoint = (host: string, port: string | number) => {
  // Create fully qualified URL
  return `https://${host}${typeof port === 'string' ? port : `:${port}`}`;
};

// Initialize connection
let sqlInstance: NeonQueryFunction | null = null;

/**
 * Get or create a Neon SQL query function
 * This ensures we're reusing the connection across requests
 */
export function getSql(): NeonQueryFunction {
  if (!sqlInstance) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }
    
    sqlInstance = neon(connectionString);
  }
  
  return sqlInstance;
}

/**
 * Generate a UUID for database records
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generic database error handler
 */
export function handleDbError(error: unknown, operation: string): never {
  console.error(`Database error during ${operation}:`, error);
  
  // Determine if this is a known error type
  if (error instanceof Error) {
    throw new Error(`Database operation failed: ${error.message}`);
  }
  
  throw new Error(`Unknown database error during ${operation}`);
}

/**
 * Create a record in the specified table
 */
export async function createRecord<T extends Record<string, any>>(
  table: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> {
  const sql = getSql();
  const id = generateId();
  
  try {
    // Create column names and values strings for the query
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    // Add id to columns and values
    columns.push('id');
    values.push(id);
    
    // Build the query
    const columnsStr = columns.map(c => `"${c}"`).join(', ');
    const placeholders = Array.from({ length: values.length }, (_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO "${table}" (${columnsStr})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    // Execute query
    const result = await sql.raw(query, ...values);
    return result.rows[0] as T;
  } catch (error) {
    return handleDbError(error, `creating record in ${table}`);
  }
}

/**
 * Get a record by ID from the specified table
 */
export async function getRecordById<T>(
  table: string,
  id: string
): Promise<T | null> {
  const sql = getSql();
  
  try {
    const query = `
      SELECT * FROM "${table}"
      WHERE id = $1
    `;
    
    const result = await sql.raw(query, id);
    return result.rows.length > 0 ? (result.rows[0] as T) : null;
  } catch (error) {
    return handleDbError(error, `getting record from ${table}`);
  }
}

/**
 * Get multiple records from the specified table with optional filters
 */
export async function getRecords<T>(
  table: string,
  {
    filters = {},
    orderBy = 'createdAt',
    orderDirection = 'DESC',
    limit = 100,
    offset = 0
  }: {
    filters?: Record<string, any>,
    orderBy?: string,
    orderDirection?: 'ASC' | 'DESC',
    limit?: number,
    offset?: number
  } = {}
): Promise<T[]> {
  const sql = getSql();
  
  try {
    // Build WHERE clause if filters are provided
    const filterKeys = Object.keys(filters);
    const whereClause = filterKeys.length > 0
      ? `WHERE ${filterKeys.map((key, index) => `"${key}" = $${index + 1}`).join(' AND ')}`
      : '';
    
    const query = `
      SELECT * FROM "${table}"
      ${whereClause}
      ORDER BY "${orderBy}" ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const filterValues = filterKeys.map(key => filters[key]);
    const result = await sql.raw(query, ...filterValues);
    
    return result.rows as T[];
  } catch (error) {
    return handleDbError(error, `getting records from ${table}`);
  }
}

/**
 * Update a record in the specified table
 */
export async function updateRecord<T>(
  table: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<T> {
  const sql = getSql();
  
  try {
    // Create set clause for update
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    if (columns.length === 0) {
      throw new Error('No data provided for update');
    }
    
    // Build SET clause
    const setClause = columns
      .map((col, index) => `"${col}" = $${index + 1}`)
      .join(', ');
    
    // Add updatedAt
    const updatedAt = new Date();
    columns.push('updatedAt');
    values.push(updatedAt);
    
    // Add id to values (will be the last parameter)
    values.push(id);
    
    const query = `
      UPDATE "${table}"
      SET ${setClause}, "updatedAt" = $${columns.length}
      WHERE id = $${columns.length + 1}
      RETURNING *
    `;
    
    const result = await sql.raw(query, ...values);
    
    if (result.rows.length === 0) {
      throw new Error(`Record with id ${id} not found in ${table}`);
    }
    
    return result.rows[0] as T;
  } catch (error) {
    return handleDbError(error, `updating record in ${table}`);
  }
}

/**
 * Delete a record from the specified table
 */
export async function deleteRecord(
  table: string,
  id: string
): Promise<boolean> {
  const sql = getSql();
  
  try {
    const query = `
      DELETE FROM "${table}"
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await sql.raw(query, id);
    return result.rows.length > 0;
  } catch (error) {
    return handleDbError(error, `deleting record from ${table}`);
  }
}

/**
 * Count records in a table with optional filters
 */
export async function countRecords(
  table: string,
  filters: Record<string, any> = {}
): Promise<number> {
  const sql = getSql();
  
  try {
    // Build WHERE clause if filters are provided
    const filterKeys = Object.keys(filters);
    const whereClause = filterKeys.length > 0
      ? `WHERE ${filterKeys.map((key, index) => `"${key}" = $${index + 1}`).join(' AND ')}`
      : '';
    
    const query = `
      SELECT COUNT(*) as count FROM "${table}"
      ${whereClause}
    `;
    
    const filterValues = filterKeys.map(key => filters[key]);
    const result = await sql.raw(query, ...filterValues);
    
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    return handleDbError(error, `counting records in ${table}`);
  }
}

/**
 * Execute a raw SQL query
 * Use this for complex queries that can't be expressed with the other utility functions
 */
export async function executeRawQuery<T>(
  query: string,
  ...params: any[]
): Promise<T[]> {
  const sql = getSql();
  
  try {
    const result = await sql.raw(query, ...params);
    return result.rows as T[];
  } catch (error) {
    return handleDbError(error, 'executing raw query');
  }
}

/**
 * Execute a transaction with multiple queries
 */
export async function executeTransaction<T>(
  callback: (sql: NeonQueryFunction) => Promise<T>
): Promise<T> {
  const sql = getSql();
  
  try {
    await sql.raw('BEGIN');
    const result = await callback(sql);
    await sql.raw('COMMIT');
    return result;
  } catch (error) {
    await sql.raw('ROLLBACK');
    return handleDbError(error, 'executing transaction');
  }
}
