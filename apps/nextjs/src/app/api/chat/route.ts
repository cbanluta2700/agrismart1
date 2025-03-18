import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { rateLimit } from '@/lib/rate-limit';

// Create an OpenAI API client
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Rate limit check
    const ip = req.headers.get('x-forwarded-for');
    const limiter = await rateLimit.check(ip || 'anonymous', 20, '1 m'); // 20 requests per minute
    
    if (!limiter.success) {
      return new Response('Too many requests. Please try again later.', { status: 429 });
    }
    
    const { messages } = await req.json();
    
    // Customize the assistant's behavior
    const systemPrompt = {
      role: 'system',
      content: `You are an AI agricultural assistant for the AgriSmart platform. Your role is to:
1. Answer questions about farming techniques, crop care, and sustainable agriculture
2. Provide information about products available on the AgriSmart marketplace
3. Help users navigate the platform and make product recommendations
4. Explain how to use platform features
5. Assist with questions related to agricultural communities within AgriSmart

Be helpful, concise, and friendly. If you don't know the answer, admit it and suggest where they might find the information.
Current date: ${new Date().toISOString().split('T')[0]}`
    };
    
    // Add system prompt to messages
    const apiMessages = [systemPrompt, ...messages];
    
    // Request the OpenAI API for the response
    const response = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      stream: true,
      messages: apiMessages,
    });
    
    // Convert the response into a text-stream
    const stream = OpenAIStream(response);
    
    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('An error occurred during your request.', { status: 500 });
  }
}
