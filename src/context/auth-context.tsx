
'use client';

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthContext] Initializing: Checking for stored user...');
    const storedUser = localStorage.getItem('eatkwik-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log('[AuthContext] User restored from localStorage:', parsedUser);
    } else {
      console.log('[AuthContext] No user found in localStorage.');
    }
    setLoading(false);
    console.log('[AuthContext] Initial loading complete. Loading state:', false);
  }, []);

  const login = (email: string, role: UserRole) => {
    const mockUser: User = { id: 'mock-user-id', email, role, name: email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('eatkwik-user', JSON.stringify(mockUser));
    console.log('[AuthContext] User logged in:', mockUser);
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'staff') {
      router.push('/staff/dashboard');
    } else {
      router.push('/menu');
    }
  };

  const logout = () => {
    const previousUser = user;
    setUser(null);
    localStorage.removeItem('eatkwik-user');
    console.log('[AuthContext] User logged out. Previous user:', previousUser);
    router.push('/login');
  };

  // Log user and loading state changes
  useEffect(() => {
    console.log('[AuthContext] State update: User:', user, 'Loading:', loading);
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
