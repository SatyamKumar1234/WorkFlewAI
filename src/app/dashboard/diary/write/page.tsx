
'use client';

// This file is intentionally left empty. 
// The route has been moved to /app/diary/write/page.tsx to enable a full-screen layout.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedWriteDiaryPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/diary');
    }, [router]);

    return null;
}
