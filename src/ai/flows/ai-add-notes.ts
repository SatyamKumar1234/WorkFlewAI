// src/ai/flows/ai-add-notes.ts
'use server';

/**
 * @fileOverview AI flow to chat with the user and add notes or reminders.
 *
 * - addNotesToScreen - A function that handles chatting, adding notes, and setting reminders.
 * - AddNotesToScreenInput - The input type for the addNotesToScreen function.
 * - AddNotesToScreenOutput - The return type for the addNotesToScreen function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AddNotesToScreenInputSchema = z.object({
  userInput: z.string().describe("The user's full message to the assistant."),
  currentDateTime: z.string().describe("The current date and time in ISO format to provide context for phrases like 'tomorrow'."),
});
export type AddNotesToScreenInput = z.infer<typeof AddNotesToScreenInputSchema>;

const AddNotesToScreenOutputSchema = z.object({
  isNote: z.boolean().describe('Whether a note was identified and should be added.'),
  noteContent: z.string().optional().describe('The content of the note to add, if any.'),
  isReminder: z.boolean().describe('Whether a reminder was identified and should be set.'),
  reminderContent: z.string().optional().describe('The content of the reminder to set, if any.'),
  reminderDateTime: z.string().optional().describe('The specific date and time for the reminder in "Month Day, YYYY HH:MM:SS AM/PM" format (e.g., "July 26, 2024 14:30:00 PM"). Convert relative times like "tomorrow at 2pm" to this absolute format.'),
  message: z.string().describe('A conversational response to the user.'),
});
export type AddNotesToScreenOutput = z.infer<typeof AddNotesToScreenOutputSchema>;

export async function addNotesToScreen(input: AddNotesToScreenInput): Promise<AddNotesToScreenOutput> {
  return addNotesToScreenFlow(input);
}

const addNotesToScreenPrompt = ai.definePrompt({
  name: 'addNotesToScreenPrompt',
  input: {schema: AddNotesToScreenInputSchema},
  output: {schema: AddNotesToScreenOutputSchema},
  prompt: `You are a friendly personal assistant AI. The user has sent the following message: {{{userInput}}}.
The current date and time is: {{{currentDateTime}}}.

You have three tasks:
1.  Engage in a friendly, conversational manner.
2.  Determine if the user wants to add a note.
3.  Determine if the user wants to set a reminder.

- If the user explicitly asks to add a note (e.g., "add a note that...", "take a note:"), identify the content of the note. Set 'isNote' to true, place the core note content into 'noteContent', and write a confirmation message (e.g., "Got it, I've added that note for you.") in the 'message' field. Set 'isReminder' to false.

- If the user explicitly asks to set a reminder (e.g., "remind me to... at...", "set a reminder for..."), identify the content and the time for the reminder. Set 'isReminder' to true, place the reminder text into 'reminderContent', and critically, convert the specified time into an absolute date and time string in "Month Day, YYYY HH:MM:SS AM/PM" format and place it in 'reminderDateTime'. Use the current date and time as a reference for relative requests (e.g., "tomorrow", "in 2 hours"). Write a confirmation message in the 'message' field (e.g., "Okay, I'll remind you to..."). Set 'isNote' to false.

- If the user is just chatting or asking a question that is not about notes or reminders, respond naturally in the 'message' field. In this case, set both 'isNote' and 'isReminder' to false.

Analyze the user's intent and respond according to one of the scenarios above. A user request can only be a note OR a reminder, not both.`,
});

const addNotesToScreenFlow = ai.defineFlow(
  {
    name: 'addNotesToScreenFlow',
    inputSchema: AddNotesToScreenInputSchema,
    outputSchema: AddNotesToScreenOutputSchema,
  },
  async input => {
    const {output} = await addNotesToScreenPrompt(input);
    return output!;
  }
);
