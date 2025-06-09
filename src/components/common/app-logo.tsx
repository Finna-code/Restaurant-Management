
'use client';

import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/context/loading-context'; // Import useLoading

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AppLogo({ size = 'md', className }: AppLogoProps) {
  const { user, loading: authLoading } = useAuth();
  const { simulateQuickLoad } = useLoading(); // Get simulateQuickLoad from context
  const currentPathname = usePathname(); // Get current pathname
  const [dynamicHref, setDynamicHref] = useState<string>("/");
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (isClientMounted && !authLoading) {
      if (user) {
        if (user.role === 'admin') {
          setDynamicHref('/admin/dashboard');
        } else if (user.role === 'staff') {
          setDynamicHref('/staff/dashboard');
        } else { 
          setDynamicHref('/menu');
        }
      } else {
        setDynamicHref("/");
      }
    }
  }, [user, authLoading, isClientMounted]);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (dynamicHref === currentPathname) {
      // e.preventDefault(); // Optional: if you want to prevent NextLink's default for same-page
      simulateQuickLoad();
    }
    // Let NextLink handle navigation otherwise
  };

  if (!isClientMounted || authLoading) {
    const iconSizeClass = size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-7 w-7';
    const textSizeClass = size === 'sm' ? 'h-5 w-16' : size === 'md' ? 'h-6 w-20' : 'h-7 w-24';
    return (
      <div className={cn('flex items-center gap-2', sizeClasses[size], className)}>
        <Skeleton className={cn("rounded", iconSizeClass)} />
        <Skeleton className={cn("rounded", textSizeClass)} />
      </div>
    );
  }

  return (
    <Link
      href={dynamicHref} 
      onClick={handleLogoClick} // Add onClick handler
      className={cn(
        'flex items-center gap-2 font-headline font-bold text-primary',
        'transition-colors duration-150 ease-in-out hover:text-accent active:text-accent active:brightness-90',
        sizeClasses[size],
        className
      )}
    >
      <UtensilsCrossed className={size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-7 w-7'} />
      EatKwik
    </Link>
  );
}
