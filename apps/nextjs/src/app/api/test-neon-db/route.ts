import { NextRequest, NextResponse } from 'next/server';
import { db, dbInfo } from '@saasfly/db';

// Mark as a public route that doesn't require authentication
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    console.log('Database info:', JSON.stringify(dbInfo));
    
    // Simple query to test the connection
    const result = await db.selectFrom('User')
      .select(['id'])
      .select('email')
      .limit(3)
      .execute();
    
    console.log(`Found ${result.length} users`);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      dbInfo,
      userCount: result.length,
      firstUser: result.length > 0 ? {
        id: result[0]?.id ?? 'unknown',
        email: result[0]?.email ?? 'unknown',
      } : null,
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection test failed',
      message: error instanceof Error ? error.message : String(error),
      dbInfo,
    }, { status: 500 });
  }
}
