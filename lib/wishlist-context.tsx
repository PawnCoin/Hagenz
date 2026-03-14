'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { useAuth } from './auth-context';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: any;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: { id: string; name: string; price: number; image: string }) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      setWishlist(items);
      setLoading(false);
    }, (error) => {
      console.error('Wishlist error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const toggleWishlist = async (product: { id: string; name: string; price: number; image: string }) => {
    if (!user) {
      // Handle unauthenticated user - maybe redirect to login or show toast
      return;
    }

    const existingItem = wishlist.find(item => item.productId === product.id);

    try {
      if (existingItem) {
        await deleteDoc(doc(db, 'wishlist', existingItem.id));
      } else {
        await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          productId: product.id,
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
