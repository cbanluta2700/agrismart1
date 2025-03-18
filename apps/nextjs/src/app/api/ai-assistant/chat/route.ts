import { NextResponse } from "next/server";
import { auth } from "@saasfly/auth";
import { 
  myProvider, 
  aiLanguageModels,
  chatCompletionPrompt,
  rateLimitRequest,
  createChat, 
  saveMessage
} from "../api-utils";
import { StreamingTextResponse, StreamData } from "../../../../utils/streaming";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const session = await auth();
    const userId = session?.user?.id;

    // Check rate limiting
    const rateLimitResult = await rateLimitRequest(userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // Parse the request body
    const json = await req.json();
    const { messages, chatId: existingChatId, modelName } = json;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Select the model
    const selectedModel = modelName && typeof modelName === 'string' && modelName in aiLanguageModels
      ? aiLanguageModels[modelName as keyof typeof aiLanguageModels] 
      : aiLanguageModels['chat-model-large'];

    // Create a new chat session if it doesn't exist
    const chatId = existingChatId || (await createChat({
      userId: userId as string,
      title: messages[0].content.substring(0, 100),
      model: modelName as string || 'chat-model-large'
    })).id;

    // Prepare the data for streaming metadata
    const data = new StreamData();

    // Save the user message to the database
    if (userId) {
      await saveMessage({
        chatId,
        content: messages[messages.length - 1].content,
        role: "user"
      });
    }

    // Create the chat completion
    const response = await myProvider.chat({
      messages,
      model: selectedModel,
      temperature: 0.7,
      maxTokens: 1000,
      system: chatCompletionPrompt,
    });

    // Save the assistant's message to the database
    if (userId) {
      // We'll save the message in a way that works with streaming
      // The exact implementation will depend on how the streaming is set up
      response.on("content", async (delta: string, snapshot: string) => {
        if (delta === "[DONE]") {
          await saveMessage({
            chatId,
            content: snapshot,
            role: "assistant"
          });
        }
      });
    }

    // Add the chat ID to the stream
    data.append({ id: chatId });

    // Return the streaming response
    return new StreamingTextResponse(response.toStream(), {}, data);
  } catch (error) {
    console.error("Error in AI chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
