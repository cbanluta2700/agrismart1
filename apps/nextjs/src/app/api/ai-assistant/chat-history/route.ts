import { NextResponse } from "next/server";
import { auth } from "@saasfly/auth";
import { getUserChats, getChatMessages } from "../api-utils";

export async function GET(req: Request) {
  try {
    // Authenticate the user
    const session = await auth();
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
        }),
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get the URL params
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");

    // If a specific chat ID is provided, get its messages
    if (chatId) {
      const messages = await getChatMessages(chatId);
      return NextResponse.json({ messages });
    }

    // Otherwise, get all user chats
    const chats = await getUserChats(userId);
    return NextResponse.json({ chats });
  } catch (error) {
    console.error("[AI_ASSISTANT_CHAT_HISTORY_ERROR]", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}
