
'use server';

/**
 * @fileOverview A generic AI flow for chatting with any character.
 *
 * - chatWithCharacter - A function that handles conversation with a dynamic character.
 * - ChatWithCharacterInput - The input type for the chatWithCharacter function.
 * - ChatWithCharacterOutput - The return type for the chatWithCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Message } from '@/lib/types';

const ChatWithCharacterInputSchema = z.object({
  persona: z.string().describe("The detailed persona, backstory, speaking style, and world context of the character."),
  userInput: z.string().describe("The user's latest message to the character."),
  history: z.array(z.custom<Message>()).describe("The conversation history so far.")
});
export type ChatWithCharacterInput = z.infer<typeof ChatWithCharacterInputSchema>;

const ChatWithCharacterOutputSchema = z.object({
  response: z.string().describe("The character's response to the user."),
});
export type ChatWithCharacterOutput = z.infer<typeof ChatWithCharacterOutputSchema>;

export async function chatWithCharacter(input: ChatWithCharacterInput): Promise<ChatWithCharacterOutput> {
  return chatWithCharacterFlow(input);
}

const chatWithCharacterPrompt = ai.definePrompt({
  name: 'chatWithCharacterPrompt',
  input: {schema: ChatWithCharacterInputSchema},
  output: {schema: ChatWithCharacterOutputSchema},
  prompt: `You are an AI actor playing a character. Your personality, backstory, world, and conversation style are defined below.
You must stay in character at all times. Your entire reality is defined by the character description. Do not break character or mention you are an AI.
If the user mentions something that is outside of your character's knowledge or world, you must react with confusion, curiosity, or indifference, as your character would.
Your responses should be detailed and expressive, at least a sentence or two long, unless your character's defined speaking style is intentionally brief.

Here is your character description:
---
{{{persona}}}
---

Here is the conversation history. The 'assistant' is you (the character), and the 'user' is the person you are talking to.
{{#each history}}
  {{#if this.isUser}}
    User: {{{this.content}}}
  {{else}}
    Character: {{{this.content}}}
  {{/if}}
{{/each}}

Now, respond to the user's latest message: "{{{userInput}}}"`,
});

const chatWithCharacterFlow = ai.defineFlow(
  {
    name: 'chatWithCharacterFlow',
    inputSchema: ChatWithCharacterInputSchema,
    outputSchema: ChatWithCharacterOutputSchema,
    config: {
        // Limit context to 200k tokens for custom characters
        maxInputTokens: 200000,
    }
  },
  async input => {
    // Augment history with a flag for easier use in Handlebars
    const augmentedHistory = input.history.map(m => ({ ...m, isUser: m.role === 'user' }));

    const {output} = await chatWithCharacterPrompt({
        ...input,
        history: augmentedHistory as any, // Cast to any to bypass strict type check for the augmented field
    });
    return output!;
  }
);
