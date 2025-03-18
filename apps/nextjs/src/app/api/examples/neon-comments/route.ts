import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Connect to Neon PostgreSQL
    const sql = neon(process.env.POSTGRES_URL || '');

    // Check if our comments table exists, if not create it
    await sql`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

    // Fetch all comments
    const comments = await sql`SELECT * FROM comments ORDER BY created_at DESC`;

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comments',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comment } = body;

    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Comment is required' },
        { status: 400 }
      );
    }

    // Connect to Neon PostgreSQL
    const sql = neon(process.env.POSTGRES_URL || '');

    // Make sure the comments table exists
    await sql`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

    // Insert the new comment
    const result = await sql`INSERT INTO comments (comment) VALUES (${comment}) RETURNING *`;

    return NextResponse.json({
      success: true,
      comment: result[0],
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add comment',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
