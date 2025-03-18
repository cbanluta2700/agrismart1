import { auth } from "@/auth";
import { createForumTopic } from "@/lib/community/forums";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const topicSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(5000),
  forumId: z.string(),
  tags: z.array(z.string()).optional(),
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
    const result = topicSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Create the topic in the database
    const topic = await createForumTopic({
      title: result.data.title,
      content: result.data.content,
      forumId: result.data.forumId,
      authorId: session.user.id,
      tags: result.data.tags,
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
