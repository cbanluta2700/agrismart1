import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // This follows the exact pattern from the Neon documentation
    const sql = neon(process.env.DATABASE_URL || '');
    const result = await sql`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
