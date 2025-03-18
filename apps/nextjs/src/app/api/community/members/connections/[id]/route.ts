import { auth } from "@/auth";
import { db } from "@saasfly/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: {
    id: string;
  };
}

/**
 * Get a specific connection by ID
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const connectionId = params.id;

    // Get the connection
    const connection = await db.userConnection.findUnique({
      where: { id: connectionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            UserProfile: {
              select: {
                headline: true,
                bio: true,
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
            UserProfile: {
              select: {
                headline: true,
                bio: true,
              },
            },
          },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Check if the user is part of this connection
    if (connection.userId !== session.user.id && connection.connectedToId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to view this connection" },
        { status: 403 }
      );
    }

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Error fetching connection:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection" },
      { status: 500 }
    );
  }
}

/**
 * Update a connection status (accept or reject)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const connectionId = params.id;
    const body = await req.json();

    // Validate the status update
    if (!body.status || !['accepted', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Get the connection
    const connection = await db.userConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Verify the user is the connection recipient
    if (connection.connectedToId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this connection" },
        { status: 403 }
      );
    }

    // Verify the connection is in pending state
    if (connection.status !== 'pending') {
      return NextResponse.json(
        { error: "This connection is not in pending state" },
        { status: 400 }
      );
    }

    // Update the connection status
    const updatedConnection = await db.userConnection.update({
      where: { id: connectionId },
      data: { status: body.status },
    });

    return NextResponse.json(updatedConnection);
  } catch (error) {
    console.error("Error updating connection:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 }
    );
  }
}

/**
 * Delete a connection
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const connectionId = params.id;

    // Get the connection
    const connection = await db.userConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Verify the user is part of this connection
    if (connection.userId !== session.user.id && connection.connectedToId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this connection" },
        { status: 403 }
      );
    }

    // Delete the connection
    await db.userConnection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json(
      { message: "Connection deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}
