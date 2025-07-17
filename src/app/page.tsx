
'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpenCheck, School, ToyBrick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WelcomePage() {
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
        console.error("Failed to access localStorage", error);
        setIsLoading(false);
    }
  }, [router]);

  const handleNameContinue = () => {
    if (name.trim()) {
      setStep(2);
    }
  };
  
  const handlePurposeSelect = (purpose: 'student' | 'hobby') => {
    const trimmedName = name.trim();
    if (trimmedName) {
      try {
        localStorage.setItem('userName', trimmedName);
        localStorage.setItem('userPurpose', purpose);
        router.push('/dashboard');
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameContinue();
    }
  };

  if (isLoading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background/80 backdrop-blur-sm" />
             <Card className="w-full max-w-sm border-2 border-primary/20 shadow-2xl shadow-primary/10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                    </div>
                     <Skeleton className="h-8 w-48 mx-auto" />
                     <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-16" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full !mt-6" />
                    </div>
                </CardContent>
             </Card>
        </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-sm border-2 border-primary/20 shadow-2xl shadow-primary/10">
        {step === 1 && (
            <>
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex items-center justify-center rounded-full bg-primary p-3">
                    <BookOpenCheck className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="font-headline text-3xl font-bold text-primary">
                    Welcome to WorkFlewAI
                </CardTitle>
                <CardDescription className="pt-2">
                    Let's get started. What should we call you?
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="name"
                        required
                    />
                    </div>
                    <Button className="w-full !mt-6" onClick={handleNameContinue} disabled={!name.trim()}>
                    Continue
                    </Button>
                </div>
            </CardContent>
            </>
        )}
        {step === 2 && (
             <>
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl font-bold">
                    How are you using WorkFlewAI?
                </CardTitle>
                <CardDescription className="pt-2">
                    This will help us personalize your experience.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePurposeSelect('student')}>
                        <School className="h-8 w-8 text-primary" />
                        <span>For School</span>
                    </Button>
                     <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handlePurposeSelect('hobby')}>
                        <ToyBrick className="h-8 w-8 text-accent" />
                        <span>For Hobbies / Personal Projects</span>
                    </Button>
                </div>
            </CardContent>
            </>
        )}
      </Card>
      <footer className="mt-8 text-center text-sm text-foreground/60">
        <p>Your AI-powered productivity partner.</p>
      </footer>
    </main>
  );
}
