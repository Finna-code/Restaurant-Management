
'use client';
import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/common/app-logo';
import { LayoutDashboard, ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const staffNavItems = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/orders', label: 'Order Processing', icon: ClipboardList },
];

function StaffLayoutSkeleton() {
  return (
    <div className="flex h-screen animate-fade-in">
      {/* Sidebar Skeleton */}
      <div className="w-16 md:w-64 border-r bg-sidebar p-2 flex flex-col">
        <div className="p-2 mb-2"> {/* SidebarHeader area */}
          <Skeleton className="h-8 w-24" /> {/* AppLogo skeleton */}
        </div>
        <Skeleton className="h-px w-full my-0" /> {/* Separator */}
        <div className="p-2 space-y-2 flex-grow"> {/* SidebarContent area */}
          {Array(2).fill(0).map((_, index) => ( // Staff has 2 nav items
            <div key={index} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" /> {/* Icon skeleton */}
              <Skeleton className="h-6 w-32 hidden md:block" /> {/* Label skeleton */}
            </div>
          ))}
        </div>
        <Skeleton className="h-px w-full my-0" /> {/* Separator */}
        <div className="p-2 mt-auto"> {/* SidebarFooter area */}
           <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" /> {/* Icon skeleton */}
              <Skeleton className="h-6 w-24 hidden md:block" /> {/* Label skeleton */}
            </div>
        </div>
      </div>
      {/* Content Area Skeleton */}
      <div className="flex-1 p-6 bg-background">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) { 
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'staff' && user.role !== 'admin')) {
    return <StaffLayoutSkeleton />;
  }
  
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <AppLogo size="md" />
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <Separator className="my-0 bg-sidebar-border"/>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {staffNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== '/staff/dashboard' && pathname.startsWith(item.href))}
                    tooltip={{ children: item.label, side: 'right', className: 'ml-2' }}
                    className="justify-start"
                  >
                    <item.icon className="h-5 w-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
         <Separator className="my-0 bg-sidebar-border"/>
        <SidebarHeader className="p-4 mt-auto">
           <Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:justify-center">
             <LogOut className="h-5 w-5 mr-3 group-data-[collapsible=icon]:mr-0" />
             <span className="group-data-[collapsible=icon]:hidden">Logout</span>
           </Button>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset className="bg-background">
         <div className="p-2 md:p-0"> 
            <div className="container mx-auto py-2 md:py-0"> 
             <header className="flex items-center justify-between py-4 md:hidden">
                <AppLogo size="sm"/>
                <SidebarTrigger />
             </header>
             <div className="md:py-6"> 
                {children}
             </div>
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
