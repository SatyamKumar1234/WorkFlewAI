
'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from '@/components/ui/skeleton';

function HeaderContent() {
  const [name, setName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchName = () => {
      try {
        const storedName = localStorage.getItem('userName');
        setName(storedName);
      } catch (error) {
        console.error("Failed to read name from localStorage", error);
      }
    };

    fetchName();

    window.addEventListener('storage', fetchName);

    return () => {
      window.removeEventListener('storage', fetchName);
    };
  }, []);

  if (!isMounted) {
    return (
      <>
        <div className="w-full flex-1">
          <div className="flex items-center h-full">
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-10" />
      </>
    );
  }

  return (
    <>
      <div className="w-full flex-1">
        {name && (
          <div className="flex items-center h-full">
            <h1 className="text-lg font-semibold text-foreground">
                Hi, {name}!
            </h1>
          </div>
        )}
      </div>
      <ThemeToggle />
    </>
  );
}

export function DashboardHeaderClient() {
  return <HeaderContent />;
}
