import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get user profile by ID or current user's profile
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
    const userId = searchParams.get("userId") || session.user.id;

    // Get the user profile
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        UserProfile: true,
        _count: {
          select: {
            ConnectedFrom: { where: { status: "accepted" } },
            ConnectedTo: { where: { status: "accepted" } },
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Format the response
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.image,
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
        socialLinks: user.UserProfile.socialLinks,
        interests: user.UserProfile.interests,
        availability: user.UserProfile.availability,
      } : null,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 */
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Prepare data for update or creation
    const profileData = {
      bio: body.bio,
      headline: body.headline,
      location: body.location,
      skills: body.skills || [],
      expertise: body.expertise || [],
      experience: body.experience,
      education: body.education,
      socialLinks: body.socialLinks,
      interests: body.interests || [],
      availability: body.availability,
    };

    // Update or create the profile
    let updatedProfile;
    if (existingProfile) {
      updatedProfile = await db.userProfile.update({
        where: { userId: session.user.id },
        data: profileData,
      });
    } else {
      updatedProfile = await db.userProfile.create({
        data: {
          userId: session.user.id,
          ...profileData,
        },
      });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
