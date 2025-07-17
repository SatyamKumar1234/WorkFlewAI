
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Icons } from "@/components/icons";
import Link from "next/link";
import {
  Home,
  Palette,
  Menu,
  Music,
  Settings,
  Sparkles,
  CalendarCheck,
  Bell,
  NotebookPen,
  MessageSquare,
} from "lucide-react";
import { DashboardHeaderClient } from "@/components/dashboard-header-client";
import type { Reminder } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/ai-chat", icon: Sparkles, label: "Ask AI" },
  { href: "/dashboard/reminders", icon: Bell, label: "Reminders" },
  { href: "/dashboard/diary", icon: NotebookPen, label: "Diary" },
  { href: "/dashboard/progress", icon: CalendarCheck, label: "Progress History" },
  { href: "/dashboard/personalisation", icon: Palette, label: "Personalisation" },
  { href: "/dashboard/sounds", icon: Music, label: "Ambient Sounds" },
  { href: "/dashboard/chat-with-characters", icon: MessageSquare, label: "Chat with Characters" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

let currentReminderAudio: HTMLAudioElement | null = null;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  const playReminderSound = useCallback(() => {
    try {
      if (currentReminderAudio) {
        currentReminderAudio.pause();
        currentReminderAudio = null;
      }

      let ringtoneSrc = localStorage.getItem('reminderRingtone');
      if (!ringtoneSrc) {
        // Use default bird sound if no custom ringtone is set
        ringtoneSrc = '/sounds/forest-birds.mp3';
      }
      
      currentReminderAudio = new Audio(ringtoneSrc);
      currentReminderAudio.play().catch(e => {
        console.error("Reminder sound playback failed:", e);
        // Fallback to vibration if sound fails
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
      });
      
    } catch(error) {
        console.error("Failed to play reminder sound:", error);
    }
  }, []);

  const checkReminders = useCallback(() => {
    try {
      const storedReminders = localStorage.getItem('reminders');
      if (!storedReminders) return;

      let reminders: Reminder[] = JSON.parse(storedReminders);
      const now = new Date();
      let hasChanged = false;

      const upcomingReminders = reminders.filter(r => {
        const reminderTime = new Date(r.remindAt);
        if (reminderTime <= now) {
          playReminderSound();
          toast({
            title: '🔔 Reminder!',
            description: r.content,
            duration: 10000, // Show for 10 seconds
            onOpenChange: (open) => {
              if (!open && currentReminderAudio) {
                currentReminderAudio.pause();
                currentReminderAudio = null;
              }
            },
          });
          hasChanged = true;
          return false; // Remove from list
        }
        return true; // Keep in list
      });

      if (hasChanged) {
        localStorage.setItem('reminders', JSON.stringify(upcomingReminders));
        // Manually dispatch storage event to update the reminders page if it's open
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error("Failed to check reminders:", error);
    }
  }, [toast, playReminderSound]);

  useEffect(() => {
    // Check reminders immediately on mount
    checkReminders();
    
    // Then check every 30 seconds
    const interval = setInterval(checkReminders, 30000);

    // Also listen for storage events to check immediately when AI adds a reminder
    window.addEventListener('storage', checkReminders);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkReminders);
    };
  }, [checkReminders]);

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background/80 backdrop-blur-xl md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Icons.logo className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">WorkFlewAI</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col relative overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl lg:h-[60px] lg:px-6 shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-full sm:w-[280px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Select a page to navigate to.
                </SheetDescription>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                <SheetClose asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Icons.logo className="h-6 w-6 text-primary" />
                    <span className="font-headline">WorkFlewAI</span>
                  </Link>
                </SheetClose>
                {NAV_ITEMS.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <DashboardHeaderClient />
        </header>
        <main className="flex-1 overflow-auto bg-background/60 scrollbar-hide">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
