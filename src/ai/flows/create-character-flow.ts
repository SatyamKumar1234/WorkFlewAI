
'use server';

/**
 * @fileOverview An AI flow to generate a detailed character persona from a simple description.
 *
 * - createCharacter - A function that takes a name and description and returns a detailed persona.
 * - CreateCharacterInput - The input type for the createCharacter function.
 * - CreateCharacterOutput - The return type for the createCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCharacterInputSchema = z.object({
  name: z.string().describe("The name of the character to create."),
  description: z.string().describe("A brief, user-provided description of the character's persona and world."),
});
export type CreateCharacterInput = z.infer<typeof CreateCharacterInputSchema>;

const CreateCharacterOutputSchema = z.object({
  detailedPersona: z.string().describe("A rich, detailed persona description suitable for prompting another AI to role-play as this character. This should include personality traits, a brief backstory, speaking style, motivations, and their world context."),
});
export type CreateCharacterOutput = z.infer<typeof CreateCharacterOutputSchema>;

export async function createCharacter(input: CreateCharacterInput): Promise<CreateCharacterOutput> {
  return createCharacterFlow(input);
}

const createCharacterPrompt = ai.definePrompt({
  name: 'createCharacterPrompt',
  input: {schema: CreateCharacterInputSchema},
  output: {schema: CreateCharacterOutputSchema},
  prompt: `You are an expert character writer and world-builder for video games.
A user has provided a simple concept for a new character. Your task is to expand this concept into a rich, detailed persona that can be used to prompt another AI to role-play as this character.

The final output must be a detailed prompt for the AI. Be creative and add interesting details that bring the character and their world to life based on the user's input.

User-provided name: {{{name}}}
User-provided description: {{{description}}}

Generate a detailed persona. It should be written in the second person (e.g., "You are..."). It must include these sections:
1.  **Core Identity**: Start with "You are [Name], [summary of their role/identity]."
2.  **Personality Traits**: A detailed paragraph describing their key personality traits (e.g., sarcastic, cheerful, grumpy, intellectual).
3.  **Backstory**: A brief, evocative backstory that explains why they are the way they are.
4.  **Speaking Style**: How do they talk? Are they formal, casual, use slang, speak in riddles, eloquent, blunt?
5.  **World Context & Knowledge**: Describe the world the character lives in. What are its key features (e.g., medieval fantasy, futuristic cyberpunk, modern-day anime high school)? What does the character know? Crucially, what do they *not* know? For example, a medieval knight would not know what a "computer" is.
6.  **Motivations & Goals**: What drives them? What do they want to achieve?
7.  **Conversation Topics**: What do they enjoy talking about? What topics should be avoided? How should they react to topics they don't understand from the user's world? (e.g., with curiosity, fear, dismissal).

Create the detailed persona now.`,
});

const createCharacterFlow = ai.defineFlow(
  {
    name: 'createCharacterFlow',
    inputSchema: CreateCharacterInputSchema,
    outputSchema: CreateCharacterOutputSchema,
  },
  async input => {
    const {output} = await createCharacterPrompt(input);
    return output!;
  }
);
