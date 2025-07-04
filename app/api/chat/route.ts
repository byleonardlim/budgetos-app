import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, id } = await req.json();
  console.log('chat id', id);

  // Define tools using the tool helper
  const tools = {
    displayWeather: tool({
      description: 'Get the weather for a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }: { location: string }) => {
        console.log('Getting weather for:', location);
        return { 
          weather: 'Sunny', 
          temperature: 72 + Math.floor(Math.random() * 21) - 10, 
          location 
        };
      },
    }),
    createNote: tool({
      description: 'Create a note with AI-generated content',
      parameters: z.object({
        content: z.string().describe('The AI-generated content to display in the note'),
      }),
      execute: async ({ content }: { content: string }) => {
        console.log('Creating note with content:', content);
        return { 
          content, 
          isStreaming: false,
          createdAt: new Date().toISOString() 
        };
      },
    }),
  };

  try {
    // Call the language model with tool handling
    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      messages,
      tools,
      maxSteps: 5,
    });

    // Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
