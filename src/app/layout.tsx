
'use client'; 

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from '@/components/common/site-header';
import { AuthProvider } from '@/context/auth-context';
import { TopLoadingBar } from '@/components/common/top-loading-bar';
import { LoadingProvider } from '@/context/loading-context'; // Import LoadingProvider
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, [pathname]); 

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const simulateQuickLoad = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 300); // Quick 300ms flash
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>EatKwik - Delicious Food, Delivered Fast</title>
        <meta name="description" content="Order your favorite meals from EatKwik." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Changed PT Sans to Roboto */}
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <LoadingProvider simulateQuickLoad={simulateQuickLoad}> {/* Provide simulateQuickLoad */}
            <TopLoadingBar isLoading={isNavigating} />
            <SiteHeader />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
            <footer className="py-6 text-center text-sm text-muted-foreground border-t">
              © {currentYear ?? ''} EatKwik. All rights reserved.
            </footer>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
