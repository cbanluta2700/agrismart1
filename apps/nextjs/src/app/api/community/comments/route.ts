import { auth } from "@/auth";
import { createForumComment } from "@/lib/community/forums";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(5).max(1000),
  topicId: z.string(),
  parentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = commentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Create the comment in the database
    const comment = await createForumComment({
      content: result.data.content,
      topicId: result.data.topicId,
      authorId: session.user.id,
      parentId: result.data.parentId,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
