import { NextResponse } from "next/server";
import { auth } from "@saasfly/auth/auth.server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in to access this endpoint" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json({ user: session.user }, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
