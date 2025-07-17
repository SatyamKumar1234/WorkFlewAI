
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, PlusCircle, Trash2, AlertTriangle, Music } from 'lucide-react';
import type { Reminder } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function RemindersPage() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderContent, setNewReminderContent] = useState('');
  const [newReminderHour, setNewReminderHour] = useState('');
  const [newReminderMinute, setNewReminderMinute] = useState('');
  const [newReminderAmPm, setNewReminderAmPm] = useState('pm');
  const [isMounted, setIsMounted] = useState(false);
  
  const loadReminders = useCallback(() => {
    try {
      const storedReminders = localStorage.getItem('reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error('Failed to load reminders from localStorage', error);
    }
  }, []);
  
  useEffect(() => {
    setIsMounted(true);
    loadReminders();

    window.addEventListener('storage', loadReminders);

    return () => {
      window.removeEventListener('storage', loadReminders);
    };
  }, [loadReminders]);

  const handleAddReminder = () => {
    const hour = parseInt(newReminderHour, 10);
    const minute = parseInt(newReminderMinute, 10);

    if (!newReminderContent.trim() || isNaN(hour) || isNaN(minute)) {
      toast({
        title: 'Missing Information',
        description: 'Please provide content and a valid time.',
        variant: 'destructive',
      });
      return;
    }
    
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
         toast({
            title: 'Invalid Time',
            description: 'Please enter a valid hour (1-12) and minute (0-59).',
            variant: 'destructive',
        });
        return;
    }

    let hour24 = hour;
    if (newReminderAmPm === 'pm' && hour < 12) {
      hour24 += 12;
    } else if (newReminderAmPm === 'am' && hour === 12) { // Midnight case
      hour24 = 0;
    }

    const today = new Date();
    const reminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour24, minute);

    // If the time is in the past for today, schedule it for tomorrow
    if (reminderDate < new Date()) {
        reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      content: newReminderContent.trim(),
      remindAt: reminderDate.toISOString(),
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    try {
        localStorage.setItem('reminders', JSON.stringify(updatedReminders));
        toast({
            title: 'Reminder Set',
            description: 'Your new reminder has been saved.',
        });
    } catch (error) {
        console.error('Failed to save reminder', error);
    }
    
    setNewReminderContent('');
    setNewReminderHour('');
    setNewReminderMinute('');
    setNewReminderAmPm('pm');
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter((r) => r.id !== id);
    setReminders(updatedReminders);
    try {
        localStorage.setItem('reminders', JSON.stringify(updatedReminders));
        toast({
            title: 'Reminder Deleted',
            description: 'The reminder has been removed.',
        });
    } catch(error) {
        console.error('Failed to delete reminder', error);
    }
  };

  const sortedReminders = reminders.sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
              <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Reminders
              </CardTitle>
              <CardDescription>
              Manage your upcoming reminders here.
              </CardDescription>
          </div>
          <Dialog>
              <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 w-full sm:w-auto">
                      <PlusCircle className="h-4 w-4" />
                      Add Reminder
                  </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add a new reminder</DialogTitle>
                  <DialogDescription>
                      What do you need to be reminded about?
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label htmlFor="content">Remind me to...</Label>
                      <Input
                          id="content"
                          value={newReminderContent}
                          onChange={(e) => setNewReminderContent(e.target.value)}
                          placeholder="e.g., Call the library"
                      />
                  </div>
                  <div className="grid gap-2">
                      <Label>Time</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                          <Input
                              id="hour"
                              type="number"
                              value={newReminderHour}
                              onChange={(e) => setNewReminderHour(e.target.value)}
                              placeholder="Hour"
                              min="1"
                              max="12"
                              className="flex-1"
                          />
                          <span className="font-bold">:</span>
                          <Input
                              id="minute"
                              type="number"
                              value={newReminderMinute}
                              onChange={(e) => setNewReminderMinute(e.target.value)}
                              placeholder="Min"
                              min="0"
                              max="59"
                              className="flex-1"
                          />
                          <Select value={newReminderAmPm} onValueChange={setNewReminderAmPm}>
                              <SelectTrigger className="flex-1 sm:flex-none sm:w-[80px]">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="am">AM</SelectItem>
                                  <SelectItem value="pm">PM</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                  <Button onClick={handleAddReminder} type="submit">
                      Save Reminder
                  </Button>
                  </DialogClose>
              </DialogFooter>
              </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              For reminders to work, this app must be open in a browser tab. Notifications will not be delivered if the app is closed.
              You can set a custom reminder sound in the <Link href="/dashboard/sounds" className="font-semibold underline">Sounds</Link> page.
            </AlertDescription>
          </Alert>
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="space-y-4 pr-4">
                {sortedReminders.length > 0 ? (
                    sortedReminders.map(reminder => (
                        <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg gap-4">
                            <div className='flex-1'>
                                <p className="font-semibold">{reminder.content}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(reminder.remindAt), "MMMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete reminder</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this reminder?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={() => deleteReminder(reminder.id)}
                                    >
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <p>You don't have any reminders set.</p>
                        <p className="text-sm">
                            Use the button above or ask the AI to set a reminder for you.
                        </p>
                    </div>
                )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
