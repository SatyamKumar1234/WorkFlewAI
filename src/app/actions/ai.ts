
"use server";

import {
  addNotesToScreen as addNotesToScreenFlow,
  type AddNotesToScreenInput,
  type AddNotesToScreenOutput,
} from "@/ai/flows/ai-add-notes";
import {
  createCharacter as createCharacterFlow,
  type CreateCharacterInput,
  type CreateCharacterOutput,
} from "@/ai/flows/create-character-flow";
import {
  chatWithCharacter as chatWithCharacterFlow,
  type ChatWithCharacterInput,
} from "@/ai/flows/chat-with-character-flow";
import {
  chatWithMichael as chatWithMichaelFlow,
  type ChatWithMichaelInput,
} from "@/ai/flows/chat-with-michael";
import type { Character } from "@/lib/types";

export async function addNoteToScreen(
  input: AddNotesToScreenInput
): Promise<AddNotesToScreenOutput> {
  return await addNotesToScreenFlow(input);
}

export async function createCharacter(
  input: CreateCharacterInput
): Promise<CreateCharacterOutput> {
  return await createCharacterFlow(input);
}

export async function chatWithCharacter(
  character: Character,
  chatInput: Omit<ChatWithCharacterInput, 'persona'>
) {
  if (character.isDefault) {
    // Use the flow with the larger context window for the default character
    const michaelInput: ChatWithMichaelInput = {
      ...chatInput,
      persona: character.persona,
    };
    return await chatWithMichaelFlow(michaelInput);
  } else {
    // Use the generic flow for custom characters
    const customCharInput: ChatWithCharacterInput = {
      ...chatInput,
      persona: character.persona,
    };
    return await chatWithCharacterFlow(customCharInput);
  }
}
