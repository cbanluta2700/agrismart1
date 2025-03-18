/**
 * Chat UI Components
 * 
 * This module exports all the UI components needed for the chat interface.
 */

export { ChatContainer } from './ChatContainer';
export { ConversationList } from './ConversationList';
export { MessagePanel } from './MessagePanel';
export { EmptyState } from './EmptyState';
export { SearchMessages } from './SearchMessages';
export { CreateGroupDialog } from './CreateGroupDialog';
export { ConversationInfo } from './ConversationInfo';
export { EditGroupDialog } from './EditGroupDialog';
export { ManageGroupMembers } from './ManageGroupMembers';
export { ConversationHeader } from './ConversationHeader';
export { UserAvatar } from './UserAvatar';
export { MessageBubble } from './MessageBubble';
export { MessageInput } from './MessageInput';
export { MessageList } from './MessageList';
export { MessageSearch } from './MessageSearch';
export { AttachmentPreview, type AttachmentType } from './AttachmentPreview';
export { ThreadPanel } from './ThreadPanel';
export { NotificationCenter } from './NotificationCenter';
export { ThreadRepliesExample } from './ThreadRepliesExample';
export { MessageReactions, type MessageReaction } from './MessageReactions';
export { 
  convertToThreadMessageType, 
  getThreadReplies, 
  createThreadReply 
} from './message-utils';
export { useMessageThreads } from './hooks/useMessageThreads';
export { useChat } from './hooks/useChat';
export { useSocketNotifications } from './hooks/useSocketNotifications';
export type { ThreadMessageType } from './ThreadPanel';
