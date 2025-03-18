# AgriSmart Chat System

This package provides a real-time chat system for the AgriSmart platform, enabling users to communicate directly, participate in group conversations, and interact with messages using reactions and thread replies.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **Group Conversations**: Create and manage group chats with multiple participants
- **Message Typing Indicators**: See when someone is typing a message
- **Read Receipts**: Know when messages have been read
- **Message Reactions**: React to messages with emojis
- **Thread Replies**: Create conversation threads from any message
- **Notifications**: Be alerted of new messages and mentions
- **Message Search**: Search through message history

## Architecture

The chat system consists of:

1. **Socket.io Server**: Handles real-time communication
2. **Client-side Hook**: Provides React components with chat functionality
3. **UI Components**: Chat interface components in the UI package
4. **Database Models**: Prisma models for persistent storage of messages and conversations

## Usage

### Server Integration

To integrate the chat server with your Next.js application, use the custom server implementation:

```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeSocketServer } = require('@saasfly/chat/server');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io server with the HTTP server
  initializeSocketServer(server);

  // Start the server
  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

Run the server with:

```bash
bun run dev:socket
```

### Client-side Integration

Use the `useChat` hook in your React components:

```tsx
import { useChat } from '@saasfly/chat';
import { useSession } from 'next-auth/react';

function ChatComponent() {
  const { data: session } = useSession();
  
  const {
    connected,
    activeConversation,
    conversations,
    messages,
    sendMessage,
    // ...other methods and state
  } = useChat(session?.accessToken);
  
  // Your component logic
}
```

## API Reference

### `useChat` Hook

The main hook for interacting with the chat system. Provides:

- Connection state (connected, connecting, error)
- Conversation management
- Message sending and receiving
- Typing indicators
- Read receipts
- Group chat functionality
- Thread replies
- Message reactions

### Socket.io Events

The chat system uses a set of predefined events for communication:

- Connection events (join_room, leave_room)
- Message events (send_message, receive_message)
- Typing events (typing, stop_typing)
- Group events (create_group, add_member, etc.)
- Thread events (create_thread_reply, receive_thread_reply)
- Reaction events (add_reaction, remove_reaction)

## UI Components

The UI package includes several components for building chat interfaces:

- `ChatContainer`: Main layout component
- `ConversationList`: Displays available conversations
- `MessagePanel`: Shows messages in a conversation
- `MessageBubble`: Renders individual messages
- `MessageInput`: Input for composing messages
- `ThreadPanel`: Interface for thread replies
- `SearchMessages`: Dialog for searching messages
- `CreateGroupDialog`: Interface for creating groups
- `NotificationCenter`: Displays chat notifications

## Configuration

The chat system can be configured via environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Used for CORS configuration in Socket.io
- `NEXTAUTH_SECRET`: JWT secret for authentication

## Examples

See the `/chat` page in the web application for a complete implementation example.

## License

Same as the AgriSmart project
