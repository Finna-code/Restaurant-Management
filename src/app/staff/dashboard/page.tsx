
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLACEHOLDER_ORDERS } from "@/lib/placeholder-data";
import type { OrderStatus } from "@/lib/types";
import { ClipboardList, Utensils, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

function KPICardSkeleton() {
  return (
    <Card className="shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/5" /> {/* CardTitle Skeleton */}
        <Skeleton className="h-5 w-5 rounded-sm" /> {/* Icon Skeleton */}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/5" /> {/* Value Skeleton */}
      </CardContent>
    </Card>
  );
}

function StaffDashboardSkeleton() {
  return (
    <div className="space-y-8 p-1 animate-fade-in">
      <Skeleton className="h-9 w-1/3 mb-1" /> {/* Page Title */}
      <Skeleton className="h-5 w-1/2" /> {/* Page Description */}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, index) => <KPICardSkeleton key={index} />)}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" /> {/* CardTitle Skeleton */}
            <Skeleton className="h-4 w-1/2" /> {/* CardDescription Skeleton */}
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-1" /> {/* CardTitle Skeleton */}
            <Skeleton className="h-4 w-3/4" /> {/* CardDescription Skeleton */}
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3 mt-4" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


export default function StaffDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const orders = PLACEHOLDER_ORDERS; 

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setIsLoading(false), 750);
    return () => clearTimeout(timer);
  }, []);

  const getOrderCountByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
  };

  const dashboardStats = [
    { title: "Pending Orders", value: getOrderCountByStatus('Placed') + getOrderCountByStatus('In Preparation'), icon: Clock, color: "text-yellow-500" },
    { title: "Ready for Pickup/Delivery", value: getOrderCountByStatus('Ready for Pickup') + getOrderCountByStatus('Out for Delivery'), icon: Utensils, color: "text-blue-500" },
    { title: "Completed Today (Placeholder)", value: "15", icon: CheckCircle2, color: "text-green-500" }, 
    { title: "Total Active Orders", value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, icon: ClipboardList, color: "text-primary" },
  ];

  const quickLinks = [
    { href: "/staff/orders?status=Placed", label: "View New Orders" },
    { href: "/staff/orders?status=In Preparation", label: "View Orders In Progress" },
    { href: "/staff/orders", label: "View All Orders" },
  ];

  if (isLoading) {
    return <StaffDashboardSkeleton />;
  }

  return (
    <div className="space-y-8 p-1 animate-fade-in">
      <h1 className="text-3xl font-headline font-bold">Staff Dashboard</h1>
      <p className="text-muted-foreground">Welcome! Here's a quick overview of today's operations.</p>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Quick Actions</CardTitle>
            <CardDescription>Jump directly to key order views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map(link => (
              <Button key={link.href} asChild variant="outline" className="w-full justify-start">
                <Link href={link.href}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Activity (Placeholder)</CardTitle>
            <CardDescription>Latest order updates and system notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Order #EK005 status changed to "In Preparation".</li>
              <li>New order #EK006 received.</li>
              <li>Order #EK003 marked as "Delivered".</li>
              <li>Low stock warning for "Mozzarella Cheese". (Admin view)</li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">This is a placeholder for real-time updates.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
