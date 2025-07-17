
import React from 'react';

export default function ChatWithCharacterLayout({
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
