'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompareContextType {
  compareItems: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('compare');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing compare items:', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: any) => {
    if (compareItems.length >= 4) {
      alert('You can only compare up to 4 products at a time.');
      return;
    }
    if (!compareItems.find(item => item.id === product.id)) {
      setCompareItems([...compareItems, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems(compareItems.filter(item => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId: string) => {
    return compareItems.some(item => item.id === productId);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
