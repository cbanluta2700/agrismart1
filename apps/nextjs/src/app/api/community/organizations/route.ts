import { auth } from "@/auth";
import { createOrganization } from "@/lib/community/organizations";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  logo: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
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
    const result = organizationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Create the organization in the database
    const organization = await createOrganization({
      ...result.data,
      createdById: session.user.id,
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
