declare module 'ai/react' {
  import { ReactNode } from 'react';
  
  export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: Date;
  }

  export interface UseChatOptions {
    api?: string;
    id?: string;
    initialMessages?: Message[];
    body?: Record<string, any>;
    headers?: Record<string, string>;
    onResponse?: (response: Response) => void;
    onFinish?: (message: Message) => void;
    onError?: (error: Error) => void;
  }

  export interface UseChatHelpers {
    messages: Message[];
    error: Error | null;
    append: (message: Message | { content: string; role: 'user' | 'assistant' | 'system' }) => Promise<void>;
    reload: () => Promise<void>;
    stop: () => void;
    isLoading: boolean;
    input: string;
    setInput: (input: string) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    data?: any;
  }

  export function useChat(options?: UseChatOptions): UseChatHelpers;
}

declare module 'react-markdown' {
  import { ReactNode } from 'react';
  
  interface ReactMarkdownProps {
    children: string;
    className?: string;
    components?: Record<string, React.ComponentType<any>>;
  }
  
  export default function ReactMarkdown(props: ReactMarkdownProps): JSX.Element;
}
