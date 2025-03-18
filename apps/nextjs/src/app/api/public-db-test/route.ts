import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Mark as a public route that doesn't require authentication
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const connectionUrl = process.env.POSTGRES_URL || 'not defined';
    console.log('Testing database connection...');
    console.log(`Connection URL: ${connectionUrl.replace(/:[^:]*@/, ':****@')}`);
    
    // Check database connection using Vercel Postgres
    const dbResult = await sql`
      SELECT current_database() as database, 
             current_user as user,
             version() as version
    `;
    
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const dbInfo = {
      isNeon: connectionUrl.includes('neon.tech'),
      connectionUrl: connectionUrl.replace(/:[^:]*@/, ':****@'),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      dbInfo,
      databaseInfo: dbResult.rows[0],
      tables: tablesResult.rows.map(row => row.table_name),
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection test failed',
      message: error instanceof Error ? error.message : String(error),
      connectionUrl: process.env.POSTGRES_URL ? 
        process.env.POSTGRES_URL.replace(/:[^:]*@/, ':****@') : 
        'not defined',
    }, { status: 500 });
  }
}
