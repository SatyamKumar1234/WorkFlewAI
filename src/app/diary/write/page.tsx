
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { DiaryEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ChevronLeft, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function WriteDiaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const activeId = localStorage.getItem('activeDiaryEntryId');
      if (!activeId) {
        toast({ title: 'Error', description: 'Could not find the diary entry to edit.', variant: 'destructive' });
        router.push('/dashboard/diary');
        return;
      }
      
      const storedEntries = localStorage.getItem('diaryEntries');
      if (storedEntries) {
        const entries: DiaryEntry[] = JSON.parse(storedEntries);
        const activeEntry = entries.find(e => e.id === activeId);
        if (activeEntry) {
          setEntry(activeEntry);
          setContent(activeEntry.content);
        } else {
           toast({ title: 'Error', description: 'Could not find the diary entry to edit.', variant: 'destructive' });
           router.push('/dashboard/diary');
           return;
        }
      }
    } catch (error) {
      console.error("Failed to load active entry", error);
      toast({ title: 'Error', description: 'There was a problem loading your entry.', variant: 'destructive' });
      router.push('/dashboard/diary');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleSave = () => {
    if (!entry) return;

    try {
      const storedEntries = localStorage.getItem('diaryEntries');
      if (storedEntries) {
        let entries: DiaryEntry[] = JSON.parse(storedEntries);
        entries = entries.map(e => e.id === entry.id ? { ...e, content: content } : e);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        localStorage.removeItem('activeDiaryEntryId');
        
        toast({
          title: 'Entry Saved!',
          description: 'Your diary entry has been successfully saved.',
        });
        router.push('/dashboard/diary');
      }
    } catch (error) {
       console.error("Failed to save entry", error);
       toast({ title: 'Error', description: 'There was a problem saving your entry.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="p-4 border-b flex justify-between items-center shrink-0">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-muted/20">
            <div className="max-w-4xl mx-auto bg-background p-4 sm:p-8 rounded-lg shadow-lg h-full flex flex-col">
                <div className="mb-8 space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <Skeleton className="flex-1 w-full" />
            </div>
        </main>
      </div>
    );
  }
  
  if (!entry) {
    // This case handles if loading finishes but no entry is found,
    // though the effect hook should have redirected.
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
        <header className="p-4 border-b flex justify-between items-center shrink-0">
            <Button variant="outline" onClick={() => router.push('/dashboard/diary')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Diary
            </Button>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save and Finish
            </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-muted/20">
            <div className="max-w-4xl mx-auto bg-background p-4 sm:p-8 rounded-lg shadow-lg h-full flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline">{entry.title}</h1>
                    <p className="text-base sm:text-lg text-muted-foreground mt-2">
                        {format(new Date(entry.date), 'EEEE, MMMM do, yyyy')}
                    </p>
                </div>
                <Textarea
                    placeholder="Let your thoughts flow..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full text-base sm:text-lg leading-relaxed resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent"
                />
            </div>
        </main>
    </div>
  );
}
