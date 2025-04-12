import { tool as createTool } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const notesTool = createTool({
  description: 'Create a note with AI-generated content',
  parameters: z.object({
    content: z.string().describe('The AI-generated content to display in the note'),
  }),
  execute: async function ({ content }) {
    return { 
      content,
      isStreaming: false // We'll handle streaming at the component level
    };
  },
});

export const tools = {
  displayWeather: weatherTool,
  createNote: notesTool,
};