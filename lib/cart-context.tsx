'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariants?: { [key: string]: string };
}

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addToCart: (product: any, selectedVariants?: { [key: string]: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  saveForLater: (cartItemId: string) => void;
  moveToCart: (cartItemId: string) => void;
  removeFromSaved: (cartItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }
    }
    return [];
  });

  const [savedItems, setSavedItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedForLater = localStorage.getItem('savedForLater');
      if (savedForLater) {
        try {
          return JSON.parse(savedForLater);
        } catch (e) {
          console.error('Failed to parse saved items', e);
        }
      }
    }
    return [];
  });

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Save saved items to localStorage on change
  useEffect(() => {
    localStorage.setItem('savedForLater', JSON.stringify(savedItems));
  }, [savedItems]);

  const generateCartItemId = (productId: string, variants?: { [key: string]: string }) => {
    if (!variants || Object.keys(variants).length === 0) return productId;
    const variantString = Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return `${productId}-${variantString}`;
  };

  const addToCart = (product: any, selectedVariants?: { [key: string]: string }) => {
    const cartItemId = generateCartItemId(product.id, selectedVariants);
    
    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        ...product, 
        id: cartItemId, 
        productId: product.id, // Keep track of original product ID
        quantity: 1, 
        selectedVariants 
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const saveForLater = (cartItemId: string) => {
    const itemToSave = items.find(item => item.id === cartItemId);
    if (itemToSave) {
      setItems(prev => prev.filter(item => item.id !== cartItemId));
      setSavedItems(prev => {
        const existing = prev.find(item => item.id === cartItemId);
        if (existing) return prev;
        return [...prev, itemToSave];
      });
    }
  };

  const moveToCart = (cartItemId: string) => {
    const itemToMove = savedItems.find(item => item.id === cartItemId);
    if (itemToMove) {
      setSavedItems(prev => prev.filter(item => item.id !== cartItemId));
      setItems(prev => {
        const existing = prev.find(item => item.id === cartItemId);
        if (existing) {
          return prev.map(item => 
            item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, itemToMove];
      });
    }
  };

  const removeFromSaved = (cartItemId: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater,
        moveToCart,
        removeFromSaved,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
