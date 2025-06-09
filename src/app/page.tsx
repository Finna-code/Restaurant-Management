
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BarChart2, ShoppingCart, UtensilsCrossed, Star } from "lucide-react"; // Added UtensilsCrossed, Star
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

function HomePageSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-12 py-8 md:py-16 animate-fade-in">
      <header className="text-center space-y-4">
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto" />
        <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        <div className="pt-4">
          <Skeleton className="h-12 w-32 mx-auto" />
        </div>
      </header>

      <section className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 order-2 md:order-1">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-3/4" /></li>
            <li className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-3/4" /></li>
            <li className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-3/4" /></li>
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <Skeleton className="rounded-lg shadow-xl aspect-video w-full h-[200px] md:h-[300px]" />
        </div>
      </section>

      <section className="w-full max-w-5xl text-center">
        <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-lg animate-fade-in">
              <CardHeader>
                <Skeleton className="h-12 w-12 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl text-center py-8">
        <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-5 w-full mb-6" />
        <Skeleton className="h-12 w-40 mx-auto" />
      </section>
    </div>
  );
}

export default function HomePage() {
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
    return <HomePageSkeleton />;
  }

  return (
    <div className="flex flex-col items-center space-y-12 py-8 md:py-16 animate-fade-in">
      <header className="text-center space-y-4">
        <UtensilsCrossed className="mx-auto h-20 w-20 text-primary" />
        <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tight">
          Optimize Your Restaurant with <span className="text-primary">EatKwik</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The all-in-one solution to manage orders, optimize kitchen workflow, and boost your restaurant's efficiency.
        </p>
        <div className="pt-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <section className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 order-2 md:order-1">
          <h2 className="text-3xl font-headline font-semibold">Efficient Operations, Satisfied Customers</h2>
          <p className="text-muted-foreground text-lg">
            EatKwik empowers your restaurant with tools to manage orders seamlessly, from input to delivery, ensuring a smooth experience for both your staff and customers.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Centralized order dashboard.</li>
            <li className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Real-time status updates.</li>
            <li className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Insightful performance analytics.</li>
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Restaurant staff using EatKwik order management system on a tablet"
            data-ai-hint="restaurant management software"
            width={600}
            height={400}
            className="rounded-lg shadow-xl object-cover aspect-video"
          />
        </div>
      </section>

      <section className="w-full max-w-5xl text-center">
        <h2 className="text-3xl font-headline font-semibold mb-8">Key Features for Your Restaurant</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-accent mx-auto mb-2" />
              <CardTitle className="font-headline">1. Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Easily input, track, and manage all customer orders from placement to completion in one centralized dashboard.</CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader>
              <Settings className="h-12 w-12 text-accent mx-auto mb-2" />
              <CardTitle className="font-headline">2. Menu & Kitchen Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Update menu items, availability, and manage kitchen views for efficient food preparation and workflow.</CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
            <CardHeader>
              <BarChart2 className="h-12 w-12 text-accent mx-auto mb-2" />
              <CardTitle className="font-headline">3. Analytics & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Gain insights into sales trends, popular items, and peak hours to optimize your restaurant's performance.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="w-full max-w-2xl text-center py-8">
        <h2 className="text-3xl font-headline font-semibold mb-4">Ready to Boost Your Restaurant's Efficiency?</h2>
        <p className="text-muted-foreground mb-6">
          Take control of your orders and operations with EatKwik. Sign up to access the dashboard.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/login">Access Dashboard</Link>
        </Button>
      </section>
    </div>
  );
}
