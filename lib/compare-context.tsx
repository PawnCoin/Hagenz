'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  specifications?: { [key: string]: string };
  brand?: string;
  stock?: number;
}

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('compare_items');
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse compare items', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compare_items', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: Product) => {
    setCompareItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      if (prev.length >= 4) {
        alert('You can only compare up to 4 products at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId: string) => {
    return compareItems.some((item) => item.id === productId);
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
