
import React from 'react';

export default function WriteDiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-background">
        {children}
    </div>
  );
}
