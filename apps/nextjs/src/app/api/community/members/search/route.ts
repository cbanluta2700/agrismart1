import { auth } from "@/auth";
import { prisma } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const skill = searchParams.get("skill") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    // Add skill filter if provided
    if (skill) {
      where.userProfile = {
        skills: {
          has: skill,
        },
      };
    }

    // Add role filter if provided
    if (role) {
      where.role = role;
    }

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Get the members
    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        userProfile: {
          select: {
            bio: true,
            location: true,
            skills: true,
            title: true,
            company: true,
            website: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Return the members and pagination info
    return NextResponse.json({
      members,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error searching members:", error);
    return NextResponse.json(
      { error: "Failed to search members" },
      { status: 500 }
    );
  }
}
