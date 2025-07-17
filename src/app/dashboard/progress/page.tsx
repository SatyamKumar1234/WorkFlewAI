
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DailyProgress } from '@/lib/types';
import { CheckCircle2, XCircle, Goal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgressHistoryPage() {
  const [progressHistory, setProgressHistory] = useState<Record<string, DailyProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userPurpose, setUserPurpose] = useState<'student' | 'hobby' | null>(null);

  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem('dailyProgress');
      if (storedProgress) {
        setProgressHistory(JSON.parse(storedProgress));
      }
      const storedPurpose = localStorage.getItem("userPurpose") as 'student' | 'hobby' | null;
      setUserPurpose(storedPurpose);
    } catch (error) {
      console.error('Failed to load progress from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const text = useMemo(() => {
    const isStudent = userPurpose !== 'hobby';
    return {
        pageTitle: isStudent ? "Progress History" : "Activity History",
        pageDescription: isStudent ? "A log of your daily study sessions. Keep up the great work!" : "A log of your daily sessions. Keep up the great work!",
        progressText: (minutes: string) => isStudent ? `You studied for ${minutes}.` : `You were active for ${minutes}.`,
        noHistoryTitle: isStudent ? "No study history found." : "No activity history found.",
        noHistoryDescription: isStudent ? "Complete a study session to see your progress here." : "Complete a session to see your progress here.",
    };
  }, [userPurpose]);

  const sortedDates = Object.keys(progressHistory).sort((a, b) => b.localeCompare(a));

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.pageTitle}</CardTitle>
        <CardDescription>
          {text.pageDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <div className="space-y-4">
            {sortedDates.length > 0 ? (
              sortedDates.map((dateString) => {
                const progress = progressHistory[dateString];
                const goalMet = progress.minutesStudied >= progress.dailyGoalInMinutes;
                const formattedDate = format(parseISO(dateString), 'EEEE, MMMM do, yyyy');

                return (
                  <div
                    key={dateString}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {goalMet ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold">{formattedDate}</p>
                        <p className="text-sm text-muted-foreground">
                          {text.progressText(formatMinutes(progress.minutesStudied))}
                        </p>
                      </div>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground pl-12 sm:pl-0">
                        <Goal className="h-4 w-4" />
                        <span>Goal: {formatMinutes(progress.dailyGoalInMinutes)}</span>
                      </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <p>{text.noHistoryTitle}</p>
                <p className="text-sm">{text.noHistoryDescription}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
