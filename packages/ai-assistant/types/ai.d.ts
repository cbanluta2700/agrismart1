declare module 'ai' {
  export type ChatCompletionOptions = {
    messages: Array<{ role: string; content: string }>;
    model: string;
    temperature?: number;
    maxTokens?: number;
    system?: string;
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
}

declare module '@ai-sdk/openai' {
  export function openai(model: string): any;
  export namespace openai {
    export function image(model: string): any;
  }
}

declare module '@ai-sdk/fireworks' {
  export function fireworks(model: string): any;
}
