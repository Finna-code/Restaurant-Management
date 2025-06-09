
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/common/app-logo';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Skeleton className="h-10 w-32 mx-auto mb-2" /> {/* AppLogo Skeleton */}
          <Skeleton className="h-7 w-1/2 mx-auto mb-1" /> {/* CardTitle Skeleton */}
          <Skeleton className="h-5 w-3/4 mx-auto" /> {/* CardDescription Skeleton */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label Skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" /> {/* Label Skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
          </div>
          <Skeleton className="h-10 w-full" /> {/* Button Skeleton */}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'staff') {
        router.replace('/staff/dashboard');
      } else {
        router.replace('/menu');
      }
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return <LoginPageSkeleton />;
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <AppLogo size="lg" className="justify-center mb-2" />
          <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in to manage your restaurant or orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
