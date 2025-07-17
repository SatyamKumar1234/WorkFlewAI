
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Subject, AnalyticsData, Note, DailyProgress } from "@/lib/types";
import {
  Book,
  BrainCircuit,
  Calendar,
  PlusCircle,
  Clock,
  BarChart2,
  Zap,
  Trash2,
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Pencil,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import PlantAnimation from "@/components/plant-animation";
import Image from "next/image";

const ICONS = {
  Book,
  BrainCircuit,
  Calendar,
  Clock,
};

const initialSubjects: Subject[] = [];

const initialAnalytics: AnalyticsData = {
  daily: [],
  weekly: [],
};

const DEFAULT_POMODORO_DURATION = 25;
const DEFAULT_DAILY_GOAL = 3.5;
const FULL_GROWTH_DURATION_SECONDS = 3600; // 1 hour
const DEFAULT_TIMER_COLOR = '#FFFFFF';
const DEFAULT_VOLUME = 0.5;

const getIcon = (iconName: keyof typeof ICONS) => {
    return ICONS[iconName] || Clock;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialAnalytics);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dailyProgress, setDailyProgress] = useState<Record<string, DailyProgress>>({});
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectGoal, setNewSubjectGoal] = useState("");
  const [manualNoteContent, setManualNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const [pomodoroDuration, setPomodoroDuration] = useState(DEFAULT_POMODORO_DURATION * 60);
  const [timer, setTimer] = useState(pomodoroDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [timerColor, setTimerColor] = useState(DEFAULT_TIMER_COLOR);

  const [ambientSoundSrc, setAmbientSoundSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loopStartTimeRef = useRef(0);
  const [userPurpose, setUserPurpose] = useState<'student' | 'hobby' | null>(null);

  const fetchUserPurpose = useCallback(() => {
    try {
        const storedPurpose = localStorage.getItem("userPurpose") as 'student' | 'hobby' | null;
        setUserPurpose(storedPurpose);
    } catch(e) { console.error(e) }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      if (audioRef.current.currentTime >= audioRef.current.duration - 0.5) {
        audioRef.current.currentTime = loopStartTimeRef.current;
        audioRef.current.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Loop replay failed", e);
        });
      }
    }
  }, []);

  const handleAudioMetadata = useCallback(() => {
    if (audioRef.current) {
        // Set loop start time to be in the middle to avoid intros/outros
        loopStartTimeRef.current = audioRef.current.duration / 2;
        audioRef.current.currentTime = loopStartTimeRef.current;
    }
  }, []);

  // Set up audio element and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleAudioMetadata);
    }
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleAudioMetadata);
      }
    };
  }, [handleTimeUpdate, handleAudioMetadata]);


  // Load data from localStorage on mount
  useEffect(() => {
    try {
      fetchUserPurpose();
      window.addEventListener('storage', fetchUserPurpose);

      const storedSubjects = localStorage.getItem("subjects");
      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects));
      }

      const storedAnalytics = localStorage.getItem("analyticsData");
      if (storedAnalytics) {
        setAnalyticsData(JSON.parse(storedAnalytics));
      }

      const storedNotes = localStorage.getItem("notes");
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
      
      const storedDailyProgress = localStorage.getItem("dailyProgress");
      if (storedDailyProgress) {
        setDailyProgress(JSON.parse(storedDailyProgress));
      }

      const storedPomodoroDuration = localStorage.getItem("pomodoroDuration");
      const durationInMinutes = storedPomodoroDuration ? parseInt(storedPomodoroDuration, 10) : DEFAULT_POMODORO_DURATION;
      const durationInSeconds = durationInMinutes * 60;
      setPomodoroDuration(durationInSeconds);
      setTimer(durationInSeconds); // Initialize timer with loaded duration
      
      const storedDailyGoal = localStorage.getItem("dailyGoal");
      setDailyGoal(storedDailyGoal ? parseFloat(storedDailyGoal) : DEFAULT_DAILY_GOAL);

      const storedBg = localStorage.getItem('customFocusBackground');
      if (storedBg) {
        setCustomBackground(storedBg);
      }
      
      const storedColor = localStorage.getItem('focusTimerColor');
      if (storedColor) {
        setTimerColor(storedColor);
      }

    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        // In case of error, you might want to reset to defaults, but we'll leave current state for now
    } finally {
      setIsLoading(false);
    }
    return () => {
      window.removeEventListener('storage', fetchUserPurpose);
    }
  }, [fetchUserPurpose]);

  const text = useMemo(() => {
    const isStudent = userPurpose !== 'hobby';
    return {
        totalHoursTitle: isStudent ? "Total Hours Studied" : "Total Hours Utilised",
        totalGoalHours: isStudent ? "total goal hours" : "total goal hours",
        subjectsTitle: isStudent ? "My Subjects" : "My Activities",
        subjectsDescription: isStudent ? "Manage your subjects and track your progress." : "Manage your activities and track your progress.",
        addSubjectButton: isStudent ? "Add Subject" : "Add Activity",
        addSubjectDialogTitle: isStudent ? "Add New Subject" : "Add New Activity",
        addSubjectDialogDescription: isStudent ? "What new topic are you mastering?" : "What new activity are you mastering?",
        startPomodoro: isStudent ? "Start Pomodoro" : "Start Session",
        deleteSubjectTitle: isStudent ? "Are you sure?" : "Delete this activity?",
        deleteSubjectDescription: (name: string) => isStudent ? `This action will permanently delete the "${name}" subject and its progress.` : `This action will permanently delete the "${name}" activity and its progress.`,
        activePomodoroPlaceholder: isStudent ? "Start a subject to begin" : "Start an activity to begin",
        notesDescription: isStudent ? "Quick notes for your study sessions." : "Quick notes for your sessions.",
        sessionInProgress: isStudent ? "Session in progress" : "Activity in progress",
        anotherSessionActive: isStudent ? "Another study session is already active." : "Another activity is already active.",
        studying: isStudent ? "Studying" : "Focusing on",
        sessionStarted: isStudent ? "Session Started!" : "Session Started!",
        sessionStartedDescription: (duration: number, name: string) => isStudent ? `Timer set for ${duration} minutes for ${name}.` : `Timer set for ${duration} minutes on ${name}.`,
        sessionComplete: isStudent ? "Session Complete!" : "Session Complete!",
        sessionCompleteDescription: (duration: number) => isStudent ? `Great job! You've completed a ${duration}-minute study session.` : `Great job! You've completed a ${duration}-minute session.`,
        sessionEndedEarly: isStudent ? "Session Ended Early" : "Session Ended Early",
        sessionEndedEarlyDescription: (duration: number) => `Your progress of ${duration} minute(s) has been saved.`,
        sessionCancelled: isStudent ? "Session Cancelled" : "Session Cancelled",
        sessionCancelledDescription: "The timer has been stopped and reset.",
        cancelDialogTitle: "Are you sure you want to cancel?",
        cancelDialogDescription: isStudent ? "Your progress for this session will be saved. Are you sure you want to end the session early?" : "Your progress for this session will be saved. Are you sure you want to end the session early?",
        cancelDialogCancel: isStudent ? "Keep Studying" : "Keep Focusing",
        cancelDialogConfirm: "End Session",
        subjectDeleted: isStudent ? "Subject Deleted" : "Activity Deleted",
        subjectDeletedDescription: isStudent ? "The subject has been successfully deleted." : "The activity has been successfully deleted.",
    };
  }, [userPurpose]);

  // Reset timer if duration changes and timer is not running
  useEffect(() => {
    if (!isTimerRunning) {
        setTimer(pomodoroDuration);
    }
  }, [pomodoroDuration]);

  // Save data to localStorage on change, only after initial load is complete
  useEffect(() => {
    if (isLoading) return;
    try {
        localStorage.setItem("subjects", JSON.stringify(subjects));
    } catch (error) {
        console.error("Failed to save subjects to localStorage", error);
    }
  }, [subjects, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    try {
        localStorage.setItem("analyticsData", JSON.stringify(analyticsData));
    } catch (error) {
        console.error("Failed to save analytics to localStorage", error);
    }
  }, [analyticsData, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    try {
        localStorage.setItem("notes", JSON.stringify(notes));
    } catch (error) {
        console.error("Failed to save notes to localStorage", error);
    }
  }, [notes, isLoading]);
  
  useEffect(() => {
    if (isLoading) return;
    try {
        localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
    } catch (error) {
        console.error("Failed to save daily progress to localStorage", error);
    }
  }, [dailyProgress, isLoading]);


  const updateDailyProgress = useCallback((minutesStudied: number) => {
    const today = new Date().toISOString().split('T')[0];
    setDailyProgress(prev => {
        const newProgress = { ...prev };
        const dayData = newProgress[today] || { minutesStudied: 0, dailyGoalInMinutes: dailyGoal * 60 };
        dayData.minutesStudied += minutesStudied;
        dayData.dailyGoalInMinutes = dailyGoal * 60; // ensure goal is up to date
        newProgress[today] = dayData;
        return newProgress;
    });
  }, [dailyGoal]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timer === 0) {
      setIsTimerRunning(false);
      setIsFocusMode(false);
      const studiedMinutes = Math.floor(pomodoroDuration / 60);
      if (activeSubject) {
        setSubjects(
          subjects.map((s) =>
            s.id === activeSubject.id
              ? { ...s, timeStudied: s.timeStudied + studiedMinutes }
              : s
          )
        );
        updateDailyProgress(studiedMinutes);
      }
      setActiveSubject(null);
      toast({
        title: text.sessionComplete,
        description: text.sessionCompleteDescription(studiedMinutes),
      });
      setTimer(pomodoroDuration);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer, activeSubject, subjects, toast, pomodoroDuration, updateDailyProgress, text]);

  useEffect(() => {
    if (isFocusMode) {
      document.body.style.overflow = 'hidden';
      if (audioRef.current && isTimerRunning) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    } else {
      document.body.style.overflow = 'auto';
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    return () => {
      document.body.style.overflow = 'auto';
       if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isFocusMode, isTimerRunning]);

  const handleAddSubject = () => {
    if (newSubjectName && newSubjectGoal) {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name: newSubjectName,
        timeGoal: parseInt(newSubjectGoal, 10) * 60, // Store goal in minutes
        timeStudied: 0,
        iconName: "Clock",
      };
      setSubjects([...subjects, newSubject]);
      setNewSubjectName("");
      setNewSubjectGoal("");
    }
  };
  
  const handleDeleteSubject = (id: string) => {
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    setSubjects(updatedSubjects);
    toast({
        title: text.subjectDeleted,
        description: text.subjectDeletedDescription,
    });
  };

  const handleResetAnalytics = () => {
    setAnalyticsData(initialAnalytics);
    toast({
        title: "Analytics Reset",
        description: "Your study analytics have been cleared.",
    });
  };
  
  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    toast({
        title: "Note deleted",
        description: "The note has been removed.",
    });
  };

  const startTimer = (subject: Subject) => {
    if (isTimerRunning) {
      toast({
        title: text.sessionInProgress,
        description: text.anotherSessionActive,
        variant: "destructive",
      });
      return;
    }
    // Refresh settings from local storage before starting
    const storedBg = localStorage.getItem('customFocusBackground');
    setCustomBackground(storedBg);
    const storedColor = localStorage.getItem('focusTimerColor');
    setTimerColor(storedColor || DEFAULT_TIMER_COLOR);

    const storedSound = localStorage.getItem('selectedAmbientSound');
    if (storedSound && storedSound !== 'none') {
        setAmbientSoundSrc(storedSound);
    } else {
        setAmbientSoundSrc(null);
    }
    
    setIsMuted(false);
    if (audioRef.current) {
        audioRef.current.volume = DEFAULT_VOLUME;
        audioRef.current.muted = false;
    }

    setActiveSubject(subject);
    setTimer(pomodoroDuration);
    setIsTimerRunning(true);
    setIsFocusMode(true);
    toast({
      title: text.sessionStarted,
      description: text.sessionStartedDescription(Math.floor(pomodoroDuration / 60), subject.name),
    });
  };
  
  const toggleTimer = () => {
      setIsTimerRunning(prev => {
          if (audioRef.current) {
              if (prev) { // if it was running, now it's paused
                  audioRef.current.pause();
              } else { // if it was paused, now it's resuming
                  audioRef.current.play().catch(e => console.error("Audio play failed", e));
              }
          }
          return !prev;
      });
  }
  
  const toggleMute = () => {
    if (audioRef.current) {
        const currentlyMuted = !isMuted;
        audioRef.current.muted = currentlyMuted;
        setIsMuted(currentlyMuted);
    }
  }

  const cancelTimer = () => {
    const timeElapsedSeconds = pomodoroDuration - timer;
    const studiedMinutes = Math.floor(timeElapsedSeconds / 60);

    if (activeSubject && studiedMinutes > 0) {
      setSubjects(
        subjects.map((s) =>
          s.id === activeSubject.id
            ? { ...s, timeStudied: s.timeStudied + studiedMinutes }
            : s
        )
      );
      updateDailyProgress(studiedMinutes);
      toast({
        title: text.sessionEndedEarly,
        description: text.sessionEndedEarlyDescription(studiedMinutes),
      });
    } else {
       toast({
        title: text.sessionCancelled,
        description: text.sessionCancelledDescription,
    });
    }
    
    setIsTimerRunning(false);
    setIsFocusMode(false);
    setActiveSubject(null);
    setTimer(pomodoroDuration);
  };

  const addNote = (content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotes([newNote, ...notes]);
  };

  const handleManualAddNote = () => {
    if (manualNoteContent.trim()) {
      addNote(manualNoteContent.trim());
      setManualNoteContent("");
      toast({
        title: "Note Added",
        description: "Your note has been saved.",
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditingNoteContent(note.content);
  };
  
  const handleSaveNote = () => {
    if (!editingNote) return;

    const updatedNotes = notes.map((note) =>
      note.id === editingNote.id
        ? { ...note, content: editingNoteContent, timestamp: new Date().toLocaleTimeString() }
        : note
    );
    setNotes(updatedNotes);
    setEditingNote(null);
    setEditingNoteContent("");
    toast({
      title: "Note Updated",
      description: "Your note has been successfully saved.",
    });
  };
  
  const totalHoursStudied = useMemo(() => {
    return subjects.reduce((total, s) => total + s.timeStudied, 0) / 60;
  }, [subjects]);

  const totalGoalHours = useMemo(() => {
    const total = subjects.reduce((total, s) => total + s.timeGoal, 0) / 60;
    return total > 0 ? total : 1; // Avoid division by zero
  }, [subjects]);
  
  const todayProgress = useMemo(() => {
    const todayString = new Date().toISOString().split('T')[0];
    return (dailyProgress[todayString]?.minutesStudied || 0) / 60;
  }, [dailyProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  
  const growthPercentage = useMemo(() => {
    if (pomodoroDuration === 0) return 0;
    const timeElapsed = pomodoroDuration - timer;
    const growthMultiplier = FULL_GROWTH_DURATION_SECONDS / pomodoroDuration;
    const effectiveTimeElapsed = timeElapsed * growthMultiplier;
    const percentage = (effectiveTimeElapsed / FULL_GROWTH_DURATION_SECONDS) * 100;
    return Math.min(percentage, 100);
  }, [timer, pomodoroDuration]);

  return (
    <>
      <div
        className={cn(
          "grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 transition-opacity duration-500",
          isFocusMode ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{text.totalHoursTitle}</CardDescription>
                <CardTitle className="text-4xl">
                  {totalHoursStudied.toFixed(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Out of {totalGoalHours > 1 ? totalGoalHours.toFixed(1) : '0.0'} {text.totalGoalHours}
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={(totalHoursStudied / totalGoalHours) * 100} />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Daily Goal</CardDescription>
                <CardTitle className="text-4xl">{dailyGoal.toFixed(1)}h</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground h-4">
                  {todayProgress.toFixed(1)}h completed today
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={(todayProgress / dailyGoal) * 100} />
              </CardFooter>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle>{text.subjectsTitle}</CardTitle>
                <CardDescription>
                  {text.subjectsDescription}
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4" />
                    {text.addSubjectButton}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{text.addSubjectDialogTitle}</DialogTitle>
                    <DialogDescription>
                      {text.addSubjectDialogDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="name" className="text-left sm:text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="col-span-1 sm:col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="goal" className="text-left sm:text-right">
                        Goal (hours)
                      </Label>
                      <Input
                        id="goal"
                        type="number"
                        min="0"
                        value={newSubjectGoal}
                        onChange={(e) => setNewSubjectGoal(e.target.value)}
                        className="col-span-1 sm:col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onClick={handleAddSubject} type="submit">
                        Save
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                  {subjects.map((subject) => {
                      const Icon = getIcon(subject.iconName as keyof typeof ICONS);
                      return (
                      <Card key={subject.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                          {subject.name}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete subject</span>
                              </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>{text.deleteSubjectTitle}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                  {text.deleteSubjectDescription(subject.name)}
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                  className={buttonVariants({ variant: "destructive" })}
                                  onClick={() => handleDeleteSubject(subject.id)}
                                  >
                                  Delete
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">
                          {(subject.timeStudied / 60).toFixed(1)}h /{" "}
                          {(subject.timeGoal / 60).toFixed(1)}h
                          </div>
                          <Progress
                          value={(subject.timeStudied / subject.timeGoal) * 100}
                          className="mt-2"
                          />
                      </CardContent>
                      <CardFooter>
                          <Button
                          className="w-full"
                          onClick={() => startTimer(subject)}
                          disabled={isTimerRunning}
                          >
                          <Zap className="mr-2 h-4 w-4" /> {text.startPomodoro}
                          </Button>
                      </CardFooter>
                      </Card>
                  )})}
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground p-8">
                      No activities yet. Add one to get started!
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle>My Notes</CardTitle>
                <CardDescription>
                  {text.notesDescription}
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1 w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a Manual Note</DialogTitle>
                    <DialogDescription>
                      Jot down anything you need to remember.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Textarea
                      placeholder="Type your note here..."
                      value={manualNoteContent}
                      onChange={(e) => setManualNoteContent(e.target.value)}
                      className="col-span-4"
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        onClick={handleManualAddNote}
                        disabled={!manualNoteContent.trim()}
                      >
                        Save Note
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[50vh] lg:h-[calc(100vh-250px)] scrollbar-hide">
                <div className="space-y-4">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="flex items-start justify-between rounded-lg border bg-card p-3 gap-2">
                          <div className="flex-1">
                            <p className="text-sm">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {note.timestamp}
                            </p>
                          </div>
                          <div className="flex items-center">
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => handleEditNote(note)}
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit note</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete note</span>
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={() => deleteNote(note.id)}
                                    >
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      No notes yet. Add one manually or ask the AI!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={!!editingNote} onOpenChange={(isOpen) => !isOpen && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Make changes to your note here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editingNoteContent}
              onChange={(e) => setEditingNoteContent(e.target.value)}
              className="col-span-4"
              rows={4}
            />
          </div>
          <DialogFooter>
             <Button onClick={() => setEditingNote(null)} variant="outline">Cancel</Button>
             <Button onClick={handleSaveNote} disabled={!editingNoteContent.trim()}>
                Save Changes
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500",
          isFocusMode ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {customBackground && (
          <Image
            src={customBackground}
            alt="Custom focus background"
            layout="fill"
            objectFit="cover"
            className="-z-10"
          />
        )}
        {ambientSoundSrc && (
          <audio ref={audioRef} src={ambientSoundSrc} />
        )}
        {activeSubject && (
            <div className="w-full h-full flex flex-col overflow-hidden p-4">
                <div className="absolute top-4 right-4">
                  {ambientSoundSrc && (
                      <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white/70 hover:text-white hover:bg-white/10">
                          {isMuted ? <VolumeX /> : <Volume2 />}
                          <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                      </Button>
                  )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <p className="text-lg sm:text-xl font-medium" style={{color: timerColor, opacity: 0.8}}>{text.studying}</p>
                  <h1 className="text-4xl sm:text-5xl font-bold font-headline mt-2" style={{color: timerColor}}>{activeSubject.name}</h1>
                  <p className="font-mono text-8xl md:text-9xl font-bold my-8 tracking-tighter" style={{color: timerColor}}>{formatTime(timer)}</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Button onClick={toggleTimer} className="w-48 h-14 text-lg">
                          {isTimerRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                          {isTimerRunning ? 'Pause' : 'Resume'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-48 h-14 text-lg">
                            <X className="mr-2"/>
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{text.cancelDialogTitle}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {text.cancelDialogDescription}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{text.cancelDialogCancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={cancelTimer}
                              className={buttonVariants({ variant: "destructive" })}
                            >
                              {text.cancelDialogConfirm}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                   <p className="text-base sm:text-lg font-semibold tracking-widest mt-6 animate-pulse" style={{color: timerColor, opacity: 0.6}}>
                      YOU CAN DO IT!
                   </p>
              </div>
              {!customBackground && (
                 <div className="w-full h-32 sm:h-48 relative">
                    <PlantAnimation growthPercentage={growthPercentage} />
                 </div>
              )}
            </div>
        )}
      </div>
    </>
  );
}
