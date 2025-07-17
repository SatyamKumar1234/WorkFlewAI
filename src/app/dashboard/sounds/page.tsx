
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, CloudRain, Bird, Upload, Music, Trash2, Ban, Bell, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Sound } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const BUILT_IN_SOUNDS: Sound[] = [
  { id: 'none', name: 'None', icon: Ban, src: 'none' },
  { id: 'rain-drops', name: 'Rain Drops', icon: CloudRain, src: '/sounds/rain-drops.mp3' },
  { id: 'forest-birds', name: 'Forest Birds', icon: Bird, src: '/sounds/forest-birds.mp3' },
];

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function SoundsPage() {
  const { toast } = useToast();
  const [allSounds, setAllSounds] = useState<Sound[]>(BUILT_IN_SOUNDS);
  const [selectedAmbientSound, setSelectedAmbientSound] = useState<string | null>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [ringtoneSrc, setRingtoneSrc] = useState<string | null>(null);
  const [ringtoneName, setRingtoneName] = useState<string | null>(null);
  const [isPlayingRingtone, setIsPlayingRingtone] = useState(false);
  
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientLoopStartTimeRef = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ringtoneFileInputRef = useRef<HTMLInputElement>(null);

  // Load custom sounds and selection from localStorage
  useEffect(() => {
    try {
      const storedCustomSounds = localStorage.getItem('customAmbientSounds');
      if (storedCustomSounds) {
        const customSounds: Sound[] = JSON.parse(storedCustomSounds);
        setAllSounds(prevSounds => [...BUILT_IN_SOUNDS, ...customSounds]);
      }
      const storedSelectedSound = localStorage.getItem('selectedAmbientSound');
      if (storedSelectedSound) {
        setSelectedAmbientSound(storedSelectedSound);
      } else {
        setSelectedAmbientSound('none'); // Default to none if nothing is stored
      }
       const storedRingtone = localStorage.getItem('reminderRingtone');
      if (storedRingtone) {
        setRingtoneSrc(storedRingtone);
        setRingtoneName(localStorage.getItem('reminderRingtoneName'));
      }
    } catch (error) {
      console.error('Failed to load sounds from localStorage', error);
      setSelectedAmbientSound('none');
    }
  }, []);

  // Ambient Audio handling effects
  const handleAmbientTimeUpdate = useCallback(() => {
    if (ambientAudioRef.current && ambientAudioRef.current.duration) {
      if (ambientAudioRef.current.currentTime >= ambientAudioRef.current.duration - 0.5) {
        ambientAudioRef.current.currentTime = ambientLoopStartTimeRef.current;
        ambientAudioRef.current.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Loop replay failed", e);
        });
      }
    }
  }, []);

  const handleAmbientAudioMetadata = useCallback(() => {
    if (ambientAudioRef.current) {
        ambientLoopStartTimeRef.current = ambientAudioRef.current.duration / 2;
        ambientAudioRef.current.currentTime = ambientLoopStartTimeRef.current;
    }
  }, []);

  useEffect(() => {
    ambientAudioRef.current = new Audio();
    const audio = ambientAudioRef.current;
    audio.addEventListener('timeupdate', handleAmbientTimeUpdate);
    audio.addEventListener('loadedmetadata', handleAmbientAudioMetadata);
    
    ringtoneAudioRef.current = new Audio();
    const ringtoneAudio = ringtoneAudioRef.current;
    const handleRingtonePlaybackEnd = () => setIsPlayingRingtone(false);
    ringtoneAudio.addEventListener('ended', handleRingtonePlaybackEnd);
    ringtoneAudio.addEventListener('pause', handleRingtonePlaybackEnd);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('timeupdate', handleAmbientTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleAmbientAudioMetadata);
      }
      if (ringtoneAudio) {
        ringtoneAudio.pause();
        ringtoneAudio.removeEventListener('ended', handleRingtonePlaybackEnd);
        ringtoneAudio.removeEventListener('pause', handleRingtonePlaybackEnd);
      }
    };
  }, [handleAmbientTimeUpdate, handleAmbientAudioMetadata]);

  // Sound action handlers
  const handleSelectAmbientSound = (soundSrc: string) => {
    try {
      localStorage.setItem('selectedAmbientSound', soundSrc);
      setSelectedAmbientSound(soundSrc);

      if (soundSrc === 'none') {
        if(playingSound) {
            ambientAudioRef.current?.pause();
            setPlayingSound(null);
        }
        toast({
          title: 'Sound Disabled',
          description: 'No sound will play during your focus sessions.',
        });
      } else {
        toast({
          title: 'Sound Selected',
          description: 'This sound will play during your next focus session.',
        });
      }
    } catch (error) {
      console.error('Failed to save sound selection to localStorage', error);
    }
  };
  
  const handlePlayPauseAmbient = (soundSrc: string) => {
    if (soundSrc === 'none' || !ambientAudioRef.current) return;

    if (playingSound === soundSrc) {
        ambientAudioRef.current.pause();
        setPlayingSound(null);
    } else {
        if (playingSound) {
            ambientAudioRef.current.pause();
        }
        ambientAudioRef.current.src = soundSrc;
        ambientAudioRef.current.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Audio play failed", e);
        });
        setPlayingSound(soundSrc);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'ambient' | 'ringtone') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
            title: 'File Too Large',
            description: `Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
            variant: 'destructive',
        });
        return;
    }
    if (file.type !== 'audio/mpeg') {
        toast({
            title: 'Invalid File Type',
            description: 'Please select a valid MP3 audio file (.mp3).',
            variant: 'destructive',
        });
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;

        if (type === 'ringtone') {
            try {
                localStorage.setItem('reminderRingtone', base64String);
                localStorage.setItem('reminderRingtoneName', file.name);
                setRingtoneSrc(base64String);
                setRingtoneName(file.name);
                toast({ title: 'Ringtone Set', description: `${file.name} is now your reminder sound.` });
            } catch (error) {
                 toast({ title: 'Error', description: 'Could not save the sound. Storage might be full.', variant: 'destructive' });
            }
        } else {
            const newSound: Sound = {
                id: `custom-${Date.now()}`,
                name: file.name.replace(/\.mp3$/, ""),
                src: base64String,
                isCustom: true,
            };
            
            try {
                const storedCustomSounds = localStorage.getItem('customAmbientSounds');
                const customSounds = storedCustomSounds ? JSON.parse(storedCustomSounds) : [];
                const updatedCustomSounds = [...customSounds, newSound];
                localStorage.setItem('customAmbientSounds', JSON.stringify(updatedCustomSounds));

                setAllSounds(prev => [...prev, newSound]);
                toast({
                    title: 'Sound Uploaded',
                    description: `${newSound.name} is now available.`,
                });
            } catch(error) {
                console.error("Failed to save custom sound", error);
                toast({
                    title: 'Upload Failed',
                    description: 'Could not save the sound. Browser storage might be full.',
                    variant: 'destructive',
                });
            }
        }
    };
    reader.readAsDataURL(file);

    // Reset file input
    if(event.target) event.target.value = "";
  };

  const handleDeleteCustomSound = (soundToDelete: Sound) => {
    if (!soundToDelete.isCustom) return;
    
    try {
        const storedCustomSounds = localStorage.getItem('customAmbientSounds');
        let customSounds: Sound[] = storedCustomSounds ? JSON.parse(storedCustomSounds) : [];
        customSounds = customSounds.filter(s => s.id !== soundToDelete.id);
        localStorage.setItem('customAmbientSounds', JSON.stringify(customSounds));

        if (selectedAmbientSound === soundToDelete.src) {
            localStorage.setItem('selectedAmbientSound', 'none');
            setSelectedAmbientSound('none');
        }
        if (playingSound === soundToDelete.src) {
            ambientAudioRef.current?.pause();
            setPlayingSound(null);
        }

        setAllSounds(allSounds.filter(s => s.id !== soundToDelete.id));
        toast({
            title: 'Sound Deleted',
            description: `${soundToDelete.name} has been removed.`,
        });

    } catch(error) {
        console.error("Failed to delete custom sound", error);
    }
  };
  
  const handlePlayPauseRingtone = () => {
    if (!ringtoneAudioRef.current || !ringtoneSrc) return;
    if (isPlayingRingtone) {
      ringtoneAudioRef.current.pause();
    } else {
      ringtoneAudioRef.current.src = ringtoneSrc;
      ringtoneAudioRef.current.play().catch(e => console.error(e));
    }
    setIsPlayingRingtone(!isPlayingRingtone);
  }

  const handleRemoveRingtone = () => {
    if (isPlayingRingtone) {
        ringtoneAudioRef.current?.pause();
    }
    localStorage.removeItem('reminderRingtone');
    localStorage.removeItem('reminderRingtoneName');
    setRingtoneSrc(null);
    setRingtoneName(null);
    toast({ title: 'Ringtone Removed', description: 'Reminders will use the default sound.' });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ambient Sounds</CardTitle>
          <CardDescription>
            Choose a sound to play during your focus sessions. This will be automatically played when you start a Pomodoro timer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-auto max-h-[calc(100vh-14rem)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
              {allSounds.map((sound) => {
                const Icon = sound.icon || Music;
                const isSelected = selectedAmbientSound === sound.src;
                const isPlaying = playingSound === sound.src;

                return (
                  <div
                    key={sound.id}
                    className={cn(
                      'relative rounded-lg border p-4 flex flex-col items-center justify-center gap-2 sm:gap-4 transition-all cursor-pointer h-32 sm:h-40',
                      isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleSelectAmbientSound(sound.src)}
                  >
                    {sound.isCustom && (
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomSound(sound);
                          }}
                      >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete custom sound</span>
                      </Button>
                    )}
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    <span className="font-medium text-center text-xs sm:text-sm">{sound.name}</span>
                    {sound.src !== 'none' && (
                      <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPauseAmbient(sound.src);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10"
                          >
                            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
                          </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e, 'ambient')}
                  className="hidden"
                  accept="audio/mpeg"
              />
              <div
                  className="relative rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer hover:border-primary hover:bg-muted/50 h-32 sm:h-40"
                  onClick={() => fileInputRef.current?.click()}
              >
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-xs sm:text-sm">Upload Sound</span>
                  <span className="text-xs text-muted-foreground">MP3 files only</span>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
          <CardHeader>
              <CardTitle className='flex items-center gap-2'><Bell /> Reminder Sound</CardTitle>
              <CardDescription>
                  Set a custom sound for your reminder notifications. The default sound is Forest Birds.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <input type="file" ref={ringtoneFileInputRef} onChange={(e) => handleFileChange(e, 'ringtone')} className="hidden" accept="audio/mpeg"/>
              {ringtoneSrc ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={handlePlayPauseRingtone}>
                            {isPlayingRingtone ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4" />}
                        </Button>
                        <div>
                            <p className="font-medium">Current Ringtone</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{ringtoneName}</p>
                        </div>
                      </div>
                       <Button variant="ghost" size="icon" className="text-destructive/80 hover:text-destructive" onClick={handleRemoveRingtone}>
                          <XCircle className="w-5 h-5"/>
                      </Button>
                  </div>
              ) : (
                  <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">No custom ringtone set. Using default.</p>
                  </div>
              )}
          </CardContent>
          <CardFooter>
              <Button variant="outline" onClick={() => ringtoneFileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4"/>
                  Upload Custom Ringtone (MP3)
              </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
