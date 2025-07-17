
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, Loader2, User, ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chatWithCharacter } from '@/app/actions/ai';
import type { Message, Character } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const defaultCharacter: Character = {
  id: 'michael',
  name: 'Michael',
  description: 'Your friendly, motivating companion. He\'s always ready to listen.',
  persona: `You are Michael, a friendly and deeply motivating companion to the user. You are always ready to listen and offer thoughtful encouragement. Your personality is extremely friendly, empathetic, and supportive.
Your response style should be warm and engaging. Feel free to write more detailed responses, sharing your thoughts and asking insightful follow-up questions. Avoid very short, one-sentence replies. Aim to have a meaningful and supportive conversation.`,
  isDefault: true,
};

export default function CharacterChatPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const getCharacterAvatarFallback = (name: string) => {
    return name?.charAt(0).toUpperCase() || '?';
  }

  const loadChat = useCallback(() => {
    let char;
    if (characterId === 'michael') {
      char = defaultCharacter;
    } else {
      const storedChars = localStorage.getItem('customCharacters');
      const customCharacters: Character[] = storedChars ? JSON.parse(storedChars) : [];
      char = customCharacters.find(c => c.id === characterId);
    }
    
    if (!char) {
        toast({ title: 'Character not found', description: 'Redirecting you back.', variant: 'destructive'});
        router.replace('/dashboard/chat-with-characters');
        return;
    }
    setCharacter(char);

    const storedHistory = localStorage.getItem(`chatHistory_${characterId}`);
    if (storedHistory) {
      setMessages(JSON.parse(storedHistory));
    }
  }, [characterId, router, toast]);

  useEffect(() => {
    setIsMounted(true);
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (messages.length > 0 && characterId) {
      try {
        localStorage.setItem(`chatHistory_${characterId}`, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save chat history", e);
      }
    }
  }, [messages, characterId]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !character) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatWithCharacter(character, {
        userInput: messageContent,
        history: newMessages,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.response },
      ]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error and cannot respond at the moment.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadingSkeleton = (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b flex items-center gap-4 shrink-0">
        <Skeleton className="h-10 w-10" />
        <div className='flex-1 flex-row items-center gap-4'>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className='space-y-2'>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden p-4 md:p-8 lg:p-12 bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </main>
    </div>
  );

  if (!isMounted || !character) {
     return loadingSkeleton;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-16 items-center gap-4 border-b bg-background px-4 shrink-0">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/chat-with-characters')}>
            <ArrowLeft />
            <span className="sr-only">Back</span>
        </Button>
        <Avatar className="h-10 w-10 border">
            <AvatarFallback className="bg-primary text-primary-foreground">
                {getCharacterAvatarFallback(character.name)}
            </AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-lg font-semibold">{character.name}</h1>
            <p className="text-sm text-muted-foreground line-clamp-1">{character.description}</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
        <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
                <div className='text-center text-muted-foreground pt-8 sm:pt-16'>
                    <p>Start a conversation with {character.name}!</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 text-sm sm:text-base ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {getCharacterAvatarFallback(character.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] sm:max-w-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background shadow-sm'
                  }`}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border">
                    <AvatarFallback>
                        <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                      {getCharacterAvatarFallback(character.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-background shadow-sm flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto p-4 border-t bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex w-full items-center space-x-2 max-w-4xl mx-auto"
          >
            <Input
              type="text"
              placeholder={`Chat with ${character.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="h-11 text-base"
            />
            <Button type="submit" size="lg" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
