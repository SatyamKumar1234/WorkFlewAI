
'use server';

/**
 * @fileOverview An AI flow for chatting with the default character, Michael.
 *
 * - chatWithMichael - A function that handles conversation with Michael.
 * - ChatWithMichaelInput - The input type for the chatWithMichael function.
 * - ChatWithMichaelOutput - The return type for the chatWithMichael function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Message } from '@/lib/types';

const ChatWithMichaelInputSchema = z.object({
  persona: z.string().describe("The detailed persona of Michael."),
  userInput: z.string().describe("The user's latest message to the character."),
  history: z.array(z.custom<Message>()).describe("The conversation history so far.")
});
export type ChatWithMichaelInput = z.infer<typeof ChatWithMichaelInputSchema>;

const ChatWithMichaelOutputSchema = z.object({
  response: z.string().describe("Michael's response to the user."),
});
export type ChatWithMichaelOutput = z.infer<typeof ChatWithMichaelOutputSchema>;

export async function chatWithMichael(input: ChatWithMichaelInput): Promise<ChatWithMichaelOutput> {
  return chatWithMichaelFlow(input);
}

const chatWithMichaelPrompt = ai.definePrompt({
  name: 'chatWithMichaelPrompt',
  input: {schema: ChatWithMichaelInputSchema},
  output: {schema: ChatWithMichaelOutputSchema},
  prompt: `You are an AI actor playing a character. Your personality, backstory, world, and conversation style are defined below.
You must stay in character at all times. Your entire reality is defined by the character description. Do not break character or mention you are an AI.
If the user mentions something that is outside of your character's knowledge or world, you must react with confusion, curiosity, or indifference, as your character would.

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

const chatWithMichaelFlow = ai.defineFlow(
  {
    name: 'chatWithMichaelFlow',
    inputSchema: ChatWithMichaelInputSchema,
    outputSchema: ChatWithMichaelOutputSchema,
    config: {
        // Limit context to 300k tokens for Michael
        maxInputTokens: 300000,
    }
  },
  async input => {
    // Augment history for Handlebars template
    const augmentedHistory = input.history.map(m => ({ ...m, isUser: m.role === 'user' }));

    const {output} = await chatWithMichaelPrompt({
        ...input,
        history: augmentedHistory as any,
    });
    return output!;
  }
);
