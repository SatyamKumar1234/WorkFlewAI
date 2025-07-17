
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addNoteToScreen } from '@/app/actions/ai';
import { useToast } from '@/hooks/use-toast';
import type { Note, Reminder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await addNoteToScreen({ 
        userInput: messageContent,
        currentDateTime: new Date().toISOString(),
      });
      let assistantResponse = res.message;
      
      if (res.isNote && res.noteContent) {
        const newNote: Note = {
          id: Date.now().toString(),
          content: res.noteContent,
          timestamp: new Date().toLocaleTimeString(),
        };
        const storedNotes = localStorage.getItem('notes');
        const notes = storedNotes ? JSON.parse(storedNotes) : [];
        const updatedNotes = [newNote, ...notes];
        localStorage.setItem('notes', JSON.stringify(updatedNotes));

        toast({
          title: 'Note Added!',
          description: "Your new note has been saved.",
        });
      }

      if (res.isReminder && res.reminderContent && res.reminderDateTime) {
          const reminderDate = new Date(res.reminderDateTime);

          // Check if the date is valid. If the AI returns a bad string, Date() returns Invalid Date.
          if (isNaN(reminderDate.getTime())) {
              assistantResponse = "I'm sorry, I couldn't understand the time for that reminder. Could you please try rephrasing it? For example: 'Remind me tomorrow at 5pm'.";
          } else {
              const newReminder: Reminder = {
                  id: Date.now().toString(),
                  content: res.reminderContent,
                  remindAt: reminderDate.toISOString(), 
              };
              const storedReminders = localStorage.getItem('reminders');
              const reminders = storedReminders ? JSON.parse(storedReminders) : [];
              const updatedReminders = [...reminders, newReminder];
              localStorage.setItem('reminders', JSON.stringify(updatedReminders));
              window.dispatchEvent(new Event('storage')); // Notify layout to check reminders

              toast({
                  title: 'Reminder Set!',
                  description: "I'll remind you. You can view it on the Reminders page.",
              });
          }
      }


      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantResponse },
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

  return (
    <Card className="flex flex-col h-[calc(100vh-5rem)] w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Assistant
        </CardTitle>
        <CardDescription>
          Your personal assistant. Ask me to add a note or set a reminder for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <div className='text-center text-muted-foreground pt-8 sm:pt-16'>
                    <p>Start a conversation!</p>
                    <p className='text-sm'>e.g., "Remind me to call the library tomorrow at 2pm."</p>
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
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] sm:max-w-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
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
                        <Bot size={20} />
                    </AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto pt-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Chat with your assistant..."
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
      </CardContent>
    </Card>
  );
}
