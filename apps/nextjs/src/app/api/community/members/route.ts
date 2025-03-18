import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get all community members with pagination and filtering
 */
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
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const expertiseParam = searchParams.get("expertise") || "";
    const skillsParam = searchParams.get("skills") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Parse array parameters
    const expertise = expertiseParam ? expertiseParam.split(",") : [];
    const skills = skillsParam ? skillsParam.split(",") : [];

    // Build the where clause for filtering
    const where: any = {};

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { UserProfile: { bio: { contains: search, mode: "insensitive" } } },
        { UserProfile: { headline: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Apply role filter
    if (role) {
      where.role = role;
    }

    // Apply expertise filter
    if (expertise.length > 0) {
      where.UserProfile = {
        ...where.UserProfile,
        expertise: {
          hasSome: expertise,
        },
      };
    }

    // Apply skills filter
    if (skills.length > 0) {
      where.UserProfile = {
        ...where.UserProfile,
        skills: {
          hasSome: skills,
        },
      };
    }

    // Get total count for pagination
    const totalCount = await db.user.count({ where });

    // Get the members
    const users = await db.user.findMany({
      where,
      include: {
        UserProfile: true,
        _count: {
          select: {
            posts: true,
            ConnectedFrom: { where: { status: "accepted" } },
            ConnectedTo: { where: { status: "accepted" } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format the members data
    const members = users.map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.image,
      email: user.email,
      role: user.role,
      joinedDate: user.createdAt,
      postCount: user._count?.posts || 0,
      connections: (user._count?.ConnectedFrom || 0) + (user._count?.ConnectedTo || 0),
      profile: user.UserProfile ? {
        bio: user.UserProfile.bio,
        headline: user.UserProfile.headline,
        location: user.UserProfile.location,
        skills: user.UserProfile.skills,
        expertise: user.UserProfile.expertise,
        experience: user.UserProfile.experience,
        education: user.UserProfile.education,
        interests: user.UserProfile.interests,
        availability: user.UserProfile.availability,
      } : null,
    }));

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
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
