/**
 * Custom streaming implementation for the AI assistant
 * This file provides alternatives to the ai package's streaming functionality
 * while maintaining compatibility with the existing code
 */

/**
 * Custom StreamData implementation for metadata in streaming responses
 */
export class StreamData {
  private data: Record<string, any> = {};

  /**
   * Append metadata to the stream
   */
  append(data: Record<string, any>): void {
    this.data = { ...this.data, ...data };
  }

  /**
   * Get the current data
   */
  get(): Record<string, any> {
    return this.data;
  }
}

/**
 * Custom StreamingTextResponse that creates a Response with streaming text
 */
export class StreamingTextResponse extends Response {
  constructor(
    stream: ReadableStream,
    options?: ResponseInit,
    data?: StreamData
  ) {
    let headers = new Headers(options?.headers);
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    
    if (data) {
      headers.set('X-Stream-Data', JSON.stringify(data.get()));
    }

    super(stream, {
      ...options,
      headers,
    });
  }
}
