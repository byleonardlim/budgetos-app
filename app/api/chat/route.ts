import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools} from '@/ai/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, id } = await req.json();

  console.log('chat id', id); // can be used for persisting the chat

  // Call the language model
  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    messages,
    maxSteps: 5,
    tools,
    async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
      // implement your own logic here, e.g. for storing messages
      // or recording token usage
    },
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
