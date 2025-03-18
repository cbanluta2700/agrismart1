import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get community member metadata (skills, expertise, roles)
 * Used for filtering and displaying options in the UI
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

    // Get roles - all unique non-null roles from users
    const users = await db.user.findMany({
      select: { role: true },
      distinct: ["role"],
      where: { role: { not: null } },
    });
    const roles = users
      .map((user) => user.role)
      .filter((role): role is string => role !== null);

    // Get expertise - all unique expertise tags from user profiles
    const expertiseProfiles = await db.userProfile.findMany({
      select: { expertise: true },
    });
    const allExpertise = expertiseProfiles.flatMap(
      (profile) => profile.expertise || []
    );
    const expertise = [...new Set(allExpertise)];

    // Get skills - all unique skills from user profiles
    const skillProfiles = await db.userProfile.findMany({
      select: { skills: true },
    });
    const allSkills = skillProfiles.flatMap(
      (profile) => profile.skills || []
    );
    const skills = [...new Set(allSkills)];

    // Get community stats
    const totalMembers = await db.user.count();

    // Get new members in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newMembersLastMonth = await db.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get total connections
    const totalConnections = await db.userConnection.count({
      where: { status: "accepted" },
    });

    return NextResponse.json({
      roles,
      expertise,
      skills,
      stats: {
        totalMembers,
        newMembersLastMonth,
        totalConnections,
        averageConnectionsPerMember:
          totalMembers > 0 ? totalConnections / totalMembers : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching community metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch community metadata" },
      { status: 500 }
    );
  }
}
