
'use client';

import Link from 'next/link';
import { AppLogo } from './app-logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Menu as MenuIcon, UserCircle, LogOut, LayoutDashboard, KeyRound, ConciergeBell } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLoading } from '@/context/loading-context'; // Import useLoading

const navLinks = [
  { href: '/menu', label: 'Menu' },
  { href: '/orders/track', label: 'Track Order' },
];

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  );
};


export function SiteHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { simulateQuickLoad } = useLoading(); // Get simulateQuickLoad

  const getDashboardLink = () => {
    if (!user) return null;
    return user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
  };

  const handleLogout = () => {
    simulateQuickLoad();
    logout();
  };

  const handleDashboardClick = () => {
    const dashboardLink = getDashboardLink();
    if (dashboardLink && dashboardLink === pathname) {
      simulateQuickLoad();
    }
    // If not on the same page, NextLink's navigation will trigger the loading bar via RootLayout
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user?.role !== 'admin' && user?.role !== 'staff' && (
              <AvatarImage src={`https://placehold.co/100x100.png?text=${user?.email?.[0]?.toUpperCase() ?? 'U'}`} alt={user?.name ?? user?.email} data-ai-hint="user avatar" />
            )}
            <AvatarFallback>
              {user?.role === 'admin' ? <KeyRound className="h-4 w-4" /> :
               user?.role === 'staff' ? <ConciergeBell className="h-4 w-4" /> :
               user?.email?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name ?? user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email} ({user?.role})
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {getDashboardLink() && (
           <Link href={getDashboardLink()!}>
            <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <AppLogo />
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(link => <NavLink key={link.href} {...link} />)}
        </nav>
        <div className="flex items-center space-x-4">
          {user ? (
            <UserMenu />
          ) : (
            <Button asChild variant="ghost" className="hover:bg-accent/50">
              <Link href="/login">
                <UserCircle className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                       pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr/>
                {user && getDashboardLink() && (
                  <Link
                    href={getDashboardLink()!}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                       pathname === getDashboardLink() ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
