import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get user connections
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
    const status = searchParams.get("status") || "accepted";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the where clause for getting connections
    const where = {
      OR: [
        { userId, status },
        { connectedToId: userId, status },
      ],
    };

    // Get total count for pagination
    const totalCount = await db.userConnection.count({ where });

    // Get connections with user details
    const connections = await db.userConnection.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            UserProfile: {
              select: {
                headline: true,
                bio: true,
                expertise: true,
              },
            },
          },
        },
        connectedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            UserProfile: {
              select: {
                headline: true,
                bio: true,
                expertise: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format the connections data
    const formattedConnections = connections.map((connection) => {
      const isInitiator = connection.userId === userId;
      const connectedUser = isInitiator ? connection.connectedTo : connection.user;

      return {
        id: connection.id,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        initiatedByMe: isInitiator,
        user: {
          id: connectedUser.id,
          name: connectedUser.name,
          email: connectedUser.email,
          avatarUrl: connectedUser.image,
          role: connectedUser.role,
          headline: connectedUser.UserProfile?.headline || null,
          bio: connectedUser.UserProfile?.bio || null,
          expertise: connectedUser.UserProfile?.expertise || [],
        },
      };
    });

    return NextResponse.json({
      connections: formattedConnections,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

/**
 * Create a new connection request
 */
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

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.connectedToId) {
      return NextResponse.json(
        { error: "Connected user ID is required" },
        { status: 400 }
      );
    }

    // Check if the users are the same
    if (session.user.id === body.connectedToId) {
      return NextResponse.json(
        { error: "Cannot connect to yourself" },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existingConnection = await db.userConnection.findFirst({
      where: {
        OR: [
          {
            userId: session.user.id,
            connectedToId: body.connectedToId,
          },
          {
            userId: body.connectedToId,
            connectedToId: session.user.id,
          },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection already exists", connection: existingConnection },
        { status: 409 }
      );
    }

    // Create the connection
    const connection = await db.userConnection.create({
      data: {
        userId: session.user.id,
        connectedToId: body.connectedToId,
        status: "pending",
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}
