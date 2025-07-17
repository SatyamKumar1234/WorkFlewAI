
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Character } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createCharacter } from '@/app/actions/ai';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';

const MAX_CUSTOM_CHARACTERS = 2;

const defaultCharacter: Character = {
  id: 'michael',
  name: 'Michael',
  description: 'Your friendly, motivating companion. He\'s always ready to listen.',
  persona: `You are Michael, a friendly and deeply motivating companion to the user. You are always ready to listen and offer thoughtful encouragement. Your personality is extremely friendly, empathetic, and supportive.
Your response style should be warm and engaging. Feel free to write more detailed responses, sharing your thoughts and asking insightful follow-up questions. Avoid very short, one-sentence replies. Aim to have a meaningful and supportive conversation.`,
  isDefault: true,
};

export default function ChatWithCharactersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([defaultCharacter]);
  const [isMounted, setIsMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const loadCharacters = useCallback(() => {
    try {
      const storedChars = localStorage.getItem('customCharacters');
      if (storedChars) {
        const customCharacters: Character[] = JSON.parse(storedChars);
        setCharacters([defaultCharacter, ...customCharacters]);
      }
    } catch (e) {
      console.error("Failed to load characters", e);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadCharacters();
  }, [loadCharacters]);

  const handleCreateCharacter = async () => {
    if (!newCharName.trim() || !newCharDesc.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and persona for your character.',
        variant: 'destructive',
      });
      return;
    }
    setIsCreateDialogOpen(false);
    setIsCreating(true);
    try {
      const result = await createCharacter({ name: newCharName, description: newCharDesc });
      
      const newCharacter: Character = {
        id: `custom-${Date.now()}`,
        name: newCharName,
        description: newCharDesc,
        persona: result.detailedPersona,
      };

      const storedChars = localStorage.getItem('customCharacters');
      const customCharacters = storedChars ? JSON.parse(storedChars) : [];
      const updatedChars = [...customCharacters, newCharacter];

      localStorage.setItem('customCharacters', JSON.stringify(updatedChars));
      setCharacters([defaultCharacter, ...updatedChars]);
      
      setNewCharName('');
      setNewCharDesc('');

      toast({
        title: 'Character Created!',
        description: `${newCharacter.name} is ready to chat.`,
      });

    } catch (error) {
      console.error("Failed to create character:", error);
      toast({
        title: 'Creation Failed',
        description: 'Could not create the character. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCharacter = (charId: string) => {
    try {
        const updatedChars = characters.filter(c => c.id !== charId && !c.isDefault);
        localStorage.setItem('customCharacters', JSON.stringify(updatedChars));
        setCharacters([defaultCharacter, ...updatedChars]);
        toast({
            title: "Character Deleted",
            description: "The character has been removed."
        });
    } catch (e) {
        console.error("Failed to delete character", e);
    }
  }

  const customCharacterCount = characters.filter(c => !c.isDefault).length;

  if (!isMounted) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Chat with Characters</h1>
            <p className="text-muted-foreground">Select a character to start a conversation.</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} disabled={customCharacterCount >= MAX_CUSTOM_CHARACTERS || isCreating}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Character ({customCharacterCount}/{MAX_CUSTOM_CHARACTERS})
          </Button>
        </div>

        {isCreating && (
            <Card className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Generating Character...</h2>
                <p className="text-muted-foreground max-w-md">
                    Our AI is crafting a unique personality and world for you. This might take a moment.
                </p>
            </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((char) => (
            <Card key={char.id} className="flex flex-col">
              <CardHeader className="flex-grow">
                <CardTitle className="flex items-center justify-between">
                    <span>{char.name}</span>
                    {!char.isDefault && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This will permanently delete {char.name}. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={() => handleDeleteCharacter(char.id)}
                                    >
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardTitle>
                <CardDescription className="line-clamp-3">{char.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/chat-with-characters/${char.id}`)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with {char.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a New Character</DialogTitle>
                <DialogDescription>
                    Bring a new personality to life. Describe their core traits and world, and our AI will do the rest.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="char-name">Name</Label>
                    <Input id="char-name" value={newCharName} onChange={(e) => setNewCharName(e.target.value)} placeholder="e.g., Captain Eva" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="char-desc">Persona & World</Label>
                    <Textarea id="char-desc" value={newCharDesc} onChange={(e) => setNewCharDesc(e.target.value)} placeholder="e.g., A sarcastic space pirate from a cyberpunk future who secretly has a heart of gold. Loves talking about old tech." />
                    <p className="text-xs text-muted-foreground">Describe their main personality, role, and the world they live in.</p>
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateCharacter} disabled={!newCharName.trim() || !newCharDesc.trim()}>Create Character</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
