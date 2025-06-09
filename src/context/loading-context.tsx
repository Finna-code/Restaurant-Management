
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface LoadingContextType {
  simulateQuickLoad: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children, simulateQuickLoad }: { children: ReactNode, simulateQuickLoad: () => void }) {
  return (
    <LoadingContext.Provider value={{ simulateQuickLoad }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
