
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Image as ImageIcon, Palette } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const DEFAULT_TIMER_COLOR = '#FFFFFF';

export default function BackgroundPage() {
  const { toast } = useToast();
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timerColor, setTimerColor] = useState(DEFAULT_TIMER_COLOR);
  const [savedTimerColor, setSavedTimerColor] = useState(DEFAULT_TIMER_COLOR);

  useEffect(() => {
    try {
      const storedBg = localStorage.getItem('customFocusBackground');
      if (storedBg) {
        setCustomBackground(storedBg);
        setPreviewUrl(storedBg);
      }
      const storedColor = localStorage.getItem('focusTimerColor');
       if (storedColor) {
        setTimerColor(storedColor);
        setSavedTimerColor(storedColor);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: 'File Too Large',
          description: `Please select an image smaller than ${MAX_FILE_SIZE_MB}MB.`,
          variant: 'destructive',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
            title: 'Invalid File Type',
            description: 'Please select a valid image file (e.g., JPG, PNG, GIF).',
            variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveBackground = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        try {
          localStorage.setItem('customFocusBackground', base64String);
          setCustomBackground(base64String);
          toast({
            title: 'Background Saved',
            description: 'Your new background will be shown in Focus Mode.',
          });
        } catch (error) {
            console.error('Failed to save background to localStorage', error);
            toast({
                title: 'Error Saving Background',
                description: 'Could not save the image. The file might be too large for local storage.',
                variant: 'destructive',
            });
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveBackground = () => {
    try {
        localStorage.removeItem('customFocusBackground');
        setCustomBackground(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast({
            title: 'Background Removed',
            description: 'The custom background has been cleared.',
        });
    } catch (error) {
        console.error('Failed to remove background from localStorage', error);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleSaveColor = () => {
    try {
        localStorage.setItem('focusTimerColor', timerColor);
        setSavedTimerColor(timerColor);
        toast({
            title: 'Color Saved',
            description: 'The new timer color will be used in Focus Mode.',
        });
    } catch (error) {
        console.error('Failed to save color to localStorage', error);
    }
  };

   const handleRemoveColor = () => {
    try {
        localStorage.removeItem('focusTimerColor');
        setTimerColor(DEFAULT_TIMER_COLOR);
        setSavedTimerColor(DEFAULT_TIMER_COLOR);
        toast({
            title: 'Color Reset',
            description: 'The timer color has been reset to default.',
        });
    } catch (error) {
        console.error('Failed to remove color from localStorage', error);
    }
  };

  const previewBackgroundColor = timerColor.toUpperCase() === DEFAULT_TIMER_COLOR ? '#000000' : '#FFFFFF';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Focus Mode Customization</CardTitle>
          <CardDescription>
            Personalize your study sessions by uploading a custom background and changing the timer color.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Background Image Section */}
          <div>
            <Label className="text-lg font-medium flex items-center gap-2 mb-2"><ImageIcon className="h-5 w-5" /> Background Image</Label>
            <Card className="aspect-video w-full max-w-2xl mx-auto flex items-center justify-center bg-muted/30 border-2 border-dashed">
                {previewUrl ? (
                <Image
                    src={previewUrl}
                    alt="Background preview"
                    width={1920}
                    height={1080}
                    className="object-contain w-full h-full rounded-md"
                />
                ) : (
                <div className="text-center text-muted-foreground p-4">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2">No custom background selected</p>
                    <p className="text-xs">Your preview will appear here.</p>
                </div>
                )}
            </Card>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Button variant="outline" onClick={triggerFileSelect}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                </Button>
                {customBackground && (
                    <Button variant="destructive" onClick={handleRemoveBackground}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Background
                    </Button>
                )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveBackground} disabled={!selectedFile}>
                Save Background
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
         <CardHeader>
             <Label className="text-lg font-medium flex items-center gap-2"><Palette className="h-5 w-5" /> Timer Color</Label>
             <CardDescription>
                 Change the color of the timer digits in Focus Mode.
             </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className='flex items-center gap-4'>
                <Label htmlFor='timer-color'>Color</Label>
                <Input id='timer-color' type='color' value={timerColor} onChange={(e) => setTimerColor(e.target.value)} className='w-20 p-1' />
            </div>
            <div>
              <Label>Preview</Label>
               <div
                className="w-full max-w-xs rounded-md p-4 text-center border transition-colors"
                style={{ backgroundColor: previewBackgroundColor }}
              >
                <span className="font-mono text-4xl font-bold tracking-tighter" style={{ color: timerColor }}>
                  12:34
                </span>
              </div>
            </div>
         </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-between">
            <Button onClick={handleSaveColor}>
                Save Color
            </Button>
            {savedTimerColor !== DEFAULT_TIMER_COLOR && (
                <Button variant="outline" onClick={handleRemoveColor}>
                    Reset Color
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
