import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get community member statistics
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

    // Get total members count
    const totalMembers = await db.user.count();

    // Get new members joined this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newMembersThisMonth = await db.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Get most active members (by post count)
    const activeMembers = await db.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
    });

    // Get connection statistics
    const connectionCount = await db.userConnection.count({
      where: {
        status: "accepted",
      },
    });
    
    // Get user profile completion rates
    const profilesWithBio = await db.userProfile.count({
      where: {
        bio: {
          not: null,
        },
      },
    });
    
    const profilesWithExpertise = await db.userProfile.count({
      where: {
        expertise: {
          isEmpty: false,
        },
      },
    });
    
    const profilesWithSkills = await db.userProfile.count({
      where: {
        skills: {
          isEmpty: false,
        },
      },
    });
    
    // Get member growth by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const usersByMonth = await db.user.groupBy({
      by: [
        {
          createdAt: {
            month: true,
            year: true,
          },
        },
      ],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: [{
        createdAt: {
          year: "asc",
        },
      }, {
        createdAt: {
          month: "asc",
        },
      }],
    });
    
    // Format the monthly data
    const memberGrowth = usersByMonth.map((entry) => ({
      month: `${entry.createdAt.year}-${String(entry.createdAt.month).padStart(2, '0')}`,
      count: entry._count.id,
    }));

    return NextResponse.json({
      totalMembers,
      newMembersThisMonth,
      mostActiveMembers: activeMembers.map((member) => ({
        id: member.id,
        name: member.name || "Unknown",
        avatarUrl: member.image,
        postCount: member._count?.posts || 0,
      })),
      connectionStats: {
        totalConnections: connectionCount,
        averageConnectionsPerMember: totalMembers > 0 ? connectionCount / totalMembers : 0,
      },
      profileCompletionStats: {
        profilesWithBio,
        profilesWithExpertise,
        profilesWithSkills,
        completionRate: totalMembers > 0 ? {
          bio: (profilesWithBio / totalMembers) * 100,
          expertise: (profilesWithExpertise / totalMembers) * 100,
          skills: (profilesWithSkills / totalMembers) * 100,
        } : { bio: 0, expertise: 0, skills: 0 },
      },
      memberGrowth,
    });
  } catch (error) {
    console.error("Error fetching member statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch member statistics" },
      { status: 500 }
    );
  }
}
