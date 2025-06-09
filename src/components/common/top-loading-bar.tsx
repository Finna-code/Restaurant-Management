
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TopLoadingBarProps {
  isLoading: boolean;
}

export function TopLoadingBar({ isLoading }: TopLoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setVisible(true);
      setProgress(0); // Reset progress
      // Simulate progress
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress += 20; // Adjust increment for speed
        if (currentProgress >= 90) { // Don't let it hit 100% too early
          clearInterval(timer);
        }
        setProgress(currentProgress);
      }, 100); // Adjust interval for speed
    } else {
      // Complete the progress and then hide
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
      }, 300); // Keep it visible for a bit after hitting 100%
    }

    return () => {
      clearInterval(timer);
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 z-50 transition-opacity duration-300 ease-in-out',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-200 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
