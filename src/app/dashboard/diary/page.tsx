
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotebookPen, PlusCircle, Trash2, CalendarIcon, BookText, Pencil } from 'lucide-react';
import type { DiaryEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DiaryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryDate, setNewEntryDate] = useState<Date | undefined>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedEntries = localStorage.getItem('diaryEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Failed to load diary entries from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('diaryEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save diary entries to localStorage', error);
    }
  }, [entries, isMounted]);

  const handleStartWriting = () => {
    if (!newEntryTitle.trim() || !newEntryDate) {
      toast({
        title: 'Incomplete Entry',
        description: 'Please provide a title and date.',
        variant: 'destructive',
      });
      return;
    }

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      title: newEntryTitle.trim(),
      content: '', // Start with empty content
      date: newEntryDate.toISOString(),
    };
    
    try {
      const storedEntries = localStorage.getItem('diaryEntries');
      const currentEntries = storedEntries ? JSON.parse(storedEntries) : [];
      const updatedEntries = [newEntry, ...currentEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
      localStorage.setItem('activeDiaryEntryId', newEntry.id);
      
      setNewEntryTitle('');
      setNewEntryDate(new Date());
      setIsNewEntryDialogOpen(false);
      
      router.push('/diary/write');

    } catch(error) {
      console.error("Failed to create new diary entry", error);
      toast({
        title: "Error",
        description: "Could not create a new diary entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    setIsViewDialogOpen(false);
    setSelectedEntry(null);
    toast({
      title: 'Entry Deleted',
      description: 'The diary entry has been removed.',
    });
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    try {
      localStorage.setItem('activeDiaryEntryId', entry.id);
      setIsViewDialogOpen(false);
      router.push('/diary/write');
    } catch (error) {
       console.error("Failed to set active entry for editing", error);
       toast({
        title: "Error",
        description: "Could not start editing session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openViewDialog = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };
  
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline">
              <NotebookPen className="h-6 w-6" />
              My Diary
            </CardTitle>
            <CardDescription>
              A private space for your thoughts, reflections, and ideas.
            </CardDescription>
          </div>
           <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => setIsNewEntryDialogOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Write New Entry
           </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)]">
            <div className="space-y-4 pr-4">
              {sortedEntries.length > 0 ? (
                sortedEntries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                    onClick={() => openViewDialog(entry)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <CardDescription>{format(new Date(entry.date), 'MMMM do, yyyy')}</CardDescription>
                    </CardHeader>
                     {entry.content && (
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">{entry.content}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                  <p>Your diary is empty.</p>
                  <p className="text-sm">Click "Write New Entry" to start your first journal.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* New Entry Details Dialog */}
      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
                <BookText className="h-6 w-6" />
                New Diary Entry
            </DialogTitle>
             <DialogDescription>
                Give your new entry a title and a date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base">Title</Label>
              <Input
                id="title"
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                placeholder="A title for your entry"
                className="text-lg h-12"
              />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="date" className="text-base">Date</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[280px] justify-start text-left font-normal h-12 text-base",
                      !newEntryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEntryDate ? format(newEntryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newEntryDate}
                    onSelect={setNewEntryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className='flex-col-reverse sm:flex-row gap-2'>
            <Button variant="outline" onClick={() => setIsNewEntryDialogOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleStartWriting} 
                disabled={!newEntryTitle.trim() || !newEntryDate}
            >
              Start Writing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[80vw] lg:max-w-[60vw] xl:max-w-[800px]">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">{selectedEntry.title}</DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedEntry.date), 'EEEE, MMMM do, yyyy')}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] my-4">
                  <div className="text-base whitespace-pre-wrap pr-6">
                      {selectedEntry.content || <span className='text-muted-foreground'>This entry is empty.</span>}
                  </div>
              </ScrollArea>
              <DialogFooter className='flex-col-reverse sm:flex-row sm:justify-between gap-2'>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                           <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this diary entry.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className={buttonVariants({ variant: "destructive" })}
                                onClick={() => handleDeleteEntry(selectedEntry.id)}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className='flex justify-end gap-2'>
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                  <Button onClick={() => handleEditEntry(selectedEntry)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
