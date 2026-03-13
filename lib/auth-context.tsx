'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          const newProfile = {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            role: 'customer',
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: { name?: string; photoURL?: string }) => {
    if (!auth.currentUser) return;

    // Update Firebase Auth
    await updateProfile(auth.currentUser, {
      displayName: data.name,
      photoURL: data.photoURL
    });

    // Update Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      name: data.name,
      photoURL: data.photoURL
    });

    // Update local state
    setProfile((prev: any) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateUserProfile }}>
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
