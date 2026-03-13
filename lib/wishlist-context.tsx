'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from './auth-context';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: Timestamp;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        setWishlist([]);
        setLoading(false);
      }, 0);
      return;
    }

    const q = query(
      collection(db, 'wishlist'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      setWishlist(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // Handle unauthenticated user (e.g., redirect to login or show modal)
      return;
    }

    const existingItem = wishlist.find(item => item.productId === productId);

    try {
      if (existingItem) {
        await deleteDoc(doc(db, 'wishlist', existingItem.id));
      } else {
        await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          productId,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
