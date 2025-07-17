
import type { LucideIcon } from "lucide-react";

export type Subject = {
  id: string;
  name: string;
  timeGoal: number; // in minutes
  timeStudied: number; // in minutes
  iconName: string;
};

export type AnalyticsData = {
  daily: { name: string; total: number }[];
  weekly: { name: string; total: number }[];
};

export type Note = {
  id: string;
  content: string;
  timestamp: string;
};

export type Reminder = {
  id: string;
  content: string;
  remindAt: string; // ISO 8601 string
};

export type Sound = {
    id: string;
    name: string;
    src: string;
    icon?: LucideIcon;
    isCustom?: boolean;
}

export type DailyProgress = {
    minutesStudied: number;
    dailyGoalInMinutes: number;
}

export type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  date: string; // ISO 8601 string
};

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  persona: string; // This will be the detailed, AI-generated prompt
  isDefault?: boolean;
}
