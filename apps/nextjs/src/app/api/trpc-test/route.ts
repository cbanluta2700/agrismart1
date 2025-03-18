import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Return a simple JSON response for testing
  return NextResponse.json(
    { ok: true, message: "API route working" },
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    // Try to parse the body
    const body = await req.json();
    
    // Echo it back
    return NextResponse.json(
      { ok: true, received: body },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
