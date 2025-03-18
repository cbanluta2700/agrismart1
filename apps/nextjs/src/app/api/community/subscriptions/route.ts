import { auth } from "@/auth";
import { prisma } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const subscriptionSchema = z.object({
  type: z.enum(["FORUM", "TOPIC"]),
  targetId: z.string(),
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
    const result = subscriptionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Create or update the subscription
    const subscription = await prisma.forumSubscription.upsert({
      where: {
        userId_type_targetId: {
          userId: session.user.id,
          type: result.data.type,
          targetId: result.data.targetId,
        },
      },
      update: {}, // No updates needed for toggle
      create: {
        userId: session.user.id,
        type: result.data.type,
        targetId: result.data.targetId,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Error managing subscription:", error);
    return NextResponse.json(
      { error: "Failed to manage subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get parameters from URL
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const targetId = searchParams.get("targetId");

    if (!type || !targetId) {
      return NextResponse.json(
        { error: "Missing required parameters: type and targetId" },
        { status: 400 }
      );
    }

    if (type !== "FORUM" && type !== "TOPIC") {
      return NextResponse.json(
        { error: "Invalid subscription type" },
        { status: 400 }
      );
    }

    // Delete the subscription
    await prisma.forumSubscription.delete({
      where: {
        userId_type_targetId: {
          userId: session.user.id,
          type: type as "FORUM" | "TOPIC",
          targetId,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
