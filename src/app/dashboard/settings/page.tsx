
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { THEMES } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Palette, Trash2, Download, Upload, School, ToyBrick, Languages, VenetianMask, Check, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_POMODORO_DURATION = 25;
const DEFAULT_DAILY_GOAL = 3.5;

type CustomColors = {
  light: {
    primary: string;
    accent: string;
    background: string;
  };
  dark: {
    primary: string;
    accent: string;
    background: string;
  };
};

const DEFAULT_CUSTOM_COLORS: CustomColors = {
  light: {
    primary: '#7c00c7',
    accent: '#00c7c7',
    background: '#f9faff',
  },
  dark: {
    primary: '#c88aff',
    accent: '#33d9d9',
    background: '#1d1a26',
  },
};

const LOCAL_STORAGE_KEYS = [
  'subjects', 'analyticsData', 'notes', 'reminders', 'dailyProgress',
  'userPurpose', 'pomodoroDuration', 'dailyGoal', 'customFocusBackground',
  'focusTimerColor', 'selectedAmbientSound', 'customAmbientSounds', 'reminderRingtone', 'reminderRingtoneName',
  'userName', 'app-theme', 'custom-colors', 'diaryEntries', 'activeDiaryEntryId', 'customCharacters', 'chatHistory_michael'
];


export default function SettingsPage() {
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [pomodoroDuration, setPomodoroDuration] = useState(DEFAULT_POMODORO_DURATION.toString());
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL.toString());
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_CUSTOM_COLORS);
  const [isMounted, setIsMounted] = useState(false);
  const [userPurpose, setUserPurpose] = useState<'student' | 'hobby' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedName = localStorage.getItem('userName');
      if (storedName) setUserName(storedName);
      
      const storedPurpose = localStorage.getItem('userPurpose') as 'student' | 'hobby' | null;
      if (storedPurpose) setUserPurpose(storedPurpose);

      const storedDuration = localStorage.getItem('pomodoroDuration');
      if (storedDuration) setPomodoroDuration(storedDuration);
      
      const storedGoal = localStorage.getItem('dailyGoal');
      if (storedGoal) setDailyGoal(storedGoal);
      
      const storedTheme = localStorage.getItem('app-theme');
      if (storedTheme && (THEMES.find((t) => t.name === storedTheme) || storedTheme === 'custom')) {
        setSelectedTheme(storedTheme);
      }
      
      const storedCustomColors = localStorage.getItem('custom-colors');
      if (storedCustomColors) {
        setCustomColors(JSON.parse(storedCustomColors));
      }

    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
  }, []);

  const handleThemeChange = (themeName: string) => {
    try {
      localStorage.setItem('app-theme', themeName);
      setSelectedTheme(themeName);

      if (themeName === 'custom') {
        window.dispatchEvent(new Event('custom-theme-update'));
        toast({
          title: 'Theme Updated',
          description: 'Switched to your custom theme.',
        });
      } else {
        document.documentElement.setAttribute('data-theme', themeName);
        window.dispatchEvent(new Event('custom-theme-update')); // to remove custom styles
        toast({
          title: 'Theme Updated',
          description: `Switched to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme.`,
        });
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const handleSaveName = () => {
    const trimmedName = userName.trim();
    if (!trimmedName) {
      toast({
        title: 'Invalid Name', description: 'Please enter a valid name.', variant: 'destructive',
      });
      return;
    }
    try {
      localStorage.setItem('userName', trimmedName);
      window.dispatchEvent(new Event('storage'));
      toast({
        title: 'Name Saved', description: `Your name has been updated to ${trimmedName}.`,
      });
    } catch (error) {
      console.error('Failed to save name:', error);
      toast({
        title: 'Error', description: 'Could not save your name. Please try again.', variant: 'destructive',
      });
    }
  };

  const handleSavePomodoro = () => {
    try {
      const duration = parseInt(pomodoroDuration, 10);
      if (isNaN(duration) || duration <= 0) {
        toast({
          title: 'Invalid Duration', description: 'Please enter a valid number of minutes.', variant: 'destructive',
        });
        return;
      }
      localStorage.setItem('pomodoroDuration', duration.toString());
      toast({
        title: 'Settings Saved', description: `Pomodoro duration set to ${duration} minutes.`,
      });
    } catch (error) {
      console.error('Failed to save pomodoro duration:', error);
      toast({
        title: 'Error', description: 'Could not save settings. Please try again.', variant: 'destructive',
      });
    }
  };

  const handleSaveDailyGoal = () => {
    try {
      const goal = parseFloat(dailyGoal);
      if (isNaN(goal) || goal < 0) {
        toast({
          title: 'Invalid Goal', description: 'Please enter a valid number of hours.', variant: 'destructive',
        });
        return;
      }
      localStorage.setItem('dailyGoal', goal.toString());
      toast({
        title: 'Settings Saved', description: `Daily goal set to ${goal} hours.`,
      });
    } catch (error) {
      console.error('Failed to save daily goal:', error);
      toast({
        title: 'Error', description: 'Could not save daily goal. Please try again.', variant: 'destructive',
      });
    }
  };

  const handleResetData = () => {
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (LOCAL_STORAGE_KEYS.includes(key) || key.startsWith('chatHistory_'))) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
      
      toast({
        title: 'Application Data Reset',
        description: 'All your data has been cleared. The app will now reload.',
      });

       setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('Failed to reset data:', error);
      toast({
        title: 'Error', description: 'Could not reset all data. Please try again.', variant: 'destructive',
      });
    }
  };

  const handleCustomColorChange = (mode: 'light' | 'dark', type: keyof CustomColors['light'], value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [type]: value,
      }
    }));
  };

  const handleSaveCustomTheme = () => {
    try {
      localStorage.setItem('custom-colors', JSON.stringify(customColors));
      window.dispatchEvent(new Event('custom-theme-update'));
      toast({
        title: 'Custom Theme Saved',
        description: 'Your new color palette has been saved.',
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'Could not save your custom theme.',
        variant: 'destructive',
      });
    }
  };

  const handleClearCustomTheme = () => {
    localStorage.removeItem('custom-colors');
    setCustomColors(DEFAULT_CUSTOM_COLORS);
    if (selectedTheme === 'custom') {
      handleThemeChange('default');
    }
    window.dispatchEvent(new Event('custom-theme-update'));
    toast({
      title: 'Custom Theme Cleared',
      description: 'Your custom theme has been removed.',
    });
  }

  const handlePurposeChange = (purpose: 'student' | 'hobby') => {
    try {
        localStorage.setItem('userPurpose', purpose);
        setUserPurpose(purpose);
        window.dispatchEvent(new Event('storage'));
        toast({
            title: 'Purpose Updated',
            description: `Experience has been set for a ${purpose}.`
        });
    } catch (e) {
        toast({ title: 'Error', description: 'Could not update your purpose.'});
    }
  };

  const handleDownloadData = () => {
    try {
        const data: { [key: string]: any } = {};
        const keysToBackup: string[] = [];

        // Collect all relevant keys from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (LOCAL_STORAGE_KEYS.includes(key) || key.startsWith('chatHistory_'))) {
                keysToBackup.push(key);
            }
        }

        keysToBackup.forEach(key => {
            data[key] = localStorage.getItem(key);
        });

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflew-ai-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
            title: 'Download Started',
            description: 'Your data backup is being downloaded.',
        });
    } catch (e) {
        console.error(e);
        toast({ title: 'Error', description: 'Could not download your data.' });
    }
  };

  const handleUploadData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
              throw new Error("File could not be read");
            }
            const data = JSON.parse(text);

            localStorage.clear();

            Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
            });
            
            toast({
                title: 'Upload Successful',
                description: 'Your data has been restored. The app will now reload.',
            });

            setTimeout(() => {
              window.location.reload();
            }, 1500);

        } catch (err) {
            console.error(err);
            toast({ title: 'Upload Failed', description: 'The backup file is invalid or corrupted.', variant: 'destructive' });
        }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };


  if (!isMounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full max-w-lg mt-2" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <Skeleton className="h-7 w-64" />
             <Skeleton className="h-4 w-full max-w-xl mt-2" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-48 w-full" />
          </CardContent>
          <CardFooter>
             <Skeleton className="h-10 w-48" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application. Select a preset or create your own theme.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Color Palette</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {THEMES.map((theme) => (
                <div key={theme.name} className="relative">
                  <Button
                    variant={'outline'}
                    className={cn(
                      'h-20 w-20 flex-col justify-center gap-2',
                      selectedTheme === theme.name && 'ring-2 ring-primary'
                    )}
                    onClick={() => handleThemeChange(theme.name)}
                  >
                    <div className="flex gap-1">
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: `hsl(${theme.light.primary})` }} />
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: `hsl(${theme.light.accent})` }} />
                    </div>
                    <span className="text-xs capitalize">{theme.name}</span>
                  </Button>
                </div>
              ))}
              <Button
                variant={'outline'}
                className={cn(
                  'h-20 w-20 flex-col justify-center gap-2',
                  selectedTheme === 'custom' && 'ring-2 ring-primary'
                )}
                onClick={() => handleThemeChange('custom')}
              >
                  <Palette className="h-6 w-6" />
                  <span className="text-xs">Custom</span>
              </Button>
            </div>
          </div>
          <div className='space-y-4'>
            <fieldset className='w-full max-w-sm p-4 border rounded-lg disabled:opacity-50' disabled>
               <legend className='px-1 text-sm font-medium text-muted-foreground'>More options coming soon</legend>
               <div className='grid gap-4'>
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="language">
                        <span className='flex items-center gap-2'><Languages/> Language</span>
                    </Label>
                    <Select defaultValue='en' disabled>
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English (Default)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="font-style">
                        <span className='flex items-center gap-2'><VenetianMask/> Font Style</span>
                    </Label>
                     <Select defaultValue='default' disabled>
                        <SelectTrigger id="font-style">
                            <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
               </div>
            </fieldset>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Theme Editor</CardTitle>
          <CardDescription>
            Create your own color palette. Click "Save" and then select "Custom" in the Appearance section above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Light Mode</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="light-primary">Primary</Label>
                <Input id="light-primary" type="color" value={customColors.light.primary} onChange={(e) => handleCustomColorChange('light', 'primary', e.target.value)} className="w-20 p-1"/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="light-accent">Accent</Label>
                <Input id="light-accent" type="color" value={customColors.light.accent} onChange={(e) => handleCustomColorChange('light', 'accent', e.target.value)} className="w-20 p-1"/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="light-background">Background</Label>
                <Input id="light-background" type="color" value={customColors.light.background} onChange={(e) => handleCustomColorChange('light', 'background', e.target.value)} className="w-20 p-1"/>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dark Mode</h3>
               <div className="flex items-center justify-between">
                <Label htmlFor="dark-primary">Primary</Label>
                <Input id="dark-primary" type="color" value={customColors.dark.primary} onChange={(e) => handleCustomColorChange('dark', 'primary', e.target.value)} className="w-20 p-1"/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-accent">Accent</Label>
                <Input id="dark-accent" type="color" value={customColors.dark.accent} onChange={(e) => handleCustomColorChange('dark', 'accent', e.target.value)} className="w-20 p-1"/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-background">Background</Label>
                <Input id="dark-background" type="color" value={customColors.dark.background} onChange={(e) => handleCustomColorChange('dark', 'background', e.target.value)} className="w-20 p-1"/>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex flex-col sm:flex-row items-center gap-2 justify-between">
          <Button onClick={handleSaveCustomTheme}>Save Custom Theme</Button>
          <Button variant="ghost" onClick={handleClearCustomTheme} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4"/> Clear Custom Theme
          </Button>
        </CardFooter>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Account & Data</CardTitle>
          <CardDescription>
            Manage your personal information, purpose, and application data.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Your Name</Label>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  id="name"
                  placeholder="e.g., Jane Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <Button onClick={handleSaveName}>
                    <Save className="mr-2 h-4 w-4" /> Save
                </Button>
            </div>
          </div>
          <div>
            <Label>App Purpose</Label>
            <div className='flex flex-col sm:flex-row gap-2 mt-2'>
              <Button variant={userPurpose === 'student' ? 'default' : 'outline'} onClick={() => handlePurposeChange('student')} className='w-full justify-start sm:w-auto'>
                <School className='mr-2'/> For School
              </Button>
              <Button variant={userPurpose === 'hobby' ? 'default' : 'outline'} onClick={() => handlePurposeChange('hobby')} className='w-full justify-start sm:w-auto'>
                <ToyBrick className='mr-2' /> For Hobbies
              </Button>
            </div>
          </div>
          <div>
            <Label>Backup & Restore</Label>
            <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                <input type="file" ref={fileInputRef} onChange={handleUploadData} className="hidden" accept=".json"/>
                <Button onClick={handleDownloadData} variant='outline' className='w-full justify-start sm:w-auto'>
                    <Download className='mr-2' /> Download Data
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant='outline' className='w-full justify-start sm:w-auto'>
                    <Upload className='mr-2' /> Upload Backup
                </Button>
            </div>
            <p className='text-xs text-muted-foreground mt-2'>Save all your data to a file or restore it from a backup.</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pomodoro Timer</CardTitle>
          <CardDescription>
            Customize the length of your study sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="duration">Session Duration (minutes)</Label>
            <Input
              type="number"
              id="duration"
              placeholder="e.g., 25"
              value={pomodoroDuration}
              onChange={(e) => setPomodoroDuration(e.target.value)}
              min="1"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSavePomodoro}>Save Settings</Button>
        </CardFooter>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Daily Study Goal</CardTitle>
          <CardDescription>
            Set your target for daily study hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="daily-goal">Goal (hours)</Label>
            <Input
              type="number"
              id="daily-goal"
              placeholder="e.g., 3.5"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              min="0"
              step="0.5"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveDailyGoal}>Save Goal</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            This action is permanent and cannot be undone. Be absolutely sure before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset All Application Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data, including your name, subjects, study progress, themes, and notes. The application will restart. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={handleResetData}
                  >
                    Yes, delete all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
