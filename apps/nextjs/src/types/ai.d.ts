declare module 'ai' {
  export type ChatCompletionOptions = {
    messages: Array<{ role: string; content: string }>;
    model: string;
    temperature?: number;
    maxTokens?: number;
    system?: string;
  };

  export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: Date;
  };

  export type ChatResponse = {
    toStream: () => ReadableStream;
    on: (event: string, callback: (delta: string, snapshot: string) => void) => void;
  };

  export function customProvider(config: {
    languageModels?: Record<string, any>;
    imageModels?: Record<string, any>;
  }): {
    chat: (options: ChatCompletionOptions) => Promise<ChatResponse>;
  };

  export function extractReasoningMiddleware(options: { tagName: string }): any;
  export function wrapLanguageModel(options: { model: any; middleware: any }): any;

  export class StreamingTextResponse extends Response {
    constructor(
      stream: ReadableStream,
      options?: ResponseInit,
      data?: StreamData
    );
  }

  export class StreamData {
    append(data: Record<string, any>): void;
  }

  export namespace useChat {
    export type Message = {
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
    };
  }

  export function useChat(options?: {
    api?: string;
    id?: string;
    initialMessages?: Message[];
    onError?: (error: Error) => void;
    onFinish?: (message: Message) => void;
    onResponse?: (response: Response) => void;
  }): {
    messages: Message[];
    input: string;
    setInput: (input: string) => void;
    handleInputChange: (event: any) => void;
    handleSubmit: (event: any) => void;
    isLoading: boolean;
    error: Error | null;
    append: (message: Message) => void;
    reload: () => void;
    stop: () => void;
    setMessages: (messages: Message[]) => void;
  };
}
