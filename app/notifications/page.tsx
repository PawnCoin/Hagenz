'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Loader2, CheckCircle2, Info, Package, MessageSquare, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import Link from 'next/link';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'ticket' | 'system' | 'reward';
  link?: string;
  read: boolean;
  createdAt: any;
}

const TYPE_ICONS = {
  order: Package,
  ticket: MessageSquare,
  system: Info,
  reward: CheckCircle2
};

const TYPE_COLORS = {
  order: 'text-blue-500 bg-blue-50 border-blue-100',
  ticket: 'text-amber-500 bg-amber-50 border-amber-100',
  system: 'text-stone-500 bg-stone-50 border-stone-100',
  reward: 'text-emerald-500 bg-emerald-50 border-emerald-100'
};

export default function NotificationsPage() {
  const { user, login } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const clearAll = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      batch.delete(doc(db, 'notifications', n.id));
    });
    await batch.commit();
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fdfcf8] flex items-center justify-center pt-24">
        <Navbar />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Please log in to view notifications</h2>
          <button onClick={() => login()} className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs">
            Log In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-light text-stone-900 font-display italic leading-tight">Notifications</h1>
            <p className="text-stone-500 mt-2 font-medium">Stay updated with your orders and account activity.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
            >
              Mark all read
            </button>
            <button 
              onClick={clearAll}
              className="text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 size={40} className="text-stone-200 animate-spin" />
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Syncing notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-stone-100 shadow-sm">
            <div className="w-20 h-20 bg-stone-50 text-stone-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Bell size={40} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">All Caught Up</h2>
            <p className="text-stone-500 mb-10 max-w-md mx-auto">
              You don't have any notifications at the moment. We'll let you know when something important happens.
            </p>
            <Link 
              href="/shop"
              className="inline-block bg-stone-900 text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, index) => {
              const Icon = TYPE_ICONS[notif.type] || Info;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-white rounded-[2rem] p-8 border transition-all relative ${!notif.read ? 'border-stone-900 shadow-md' : 'border-stone-100 shadow-sm'}`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${TYPE_COLORS[notif.type]}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{notif.type}</span>
                          <span className="w-1 h-1 bg-stone-200 rounded-full" />
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {notif.createdAt ? format(notif.createdAt.toDate(), 'MMM d, h:mm a') : ''}
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="bg-stone-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 font-display uppercase tracking-tight mb-2">{notif.title}</h3>
                      <p className="text-stone-500 text-sm leading-relaxed mb-4">{notif.message}</p>
                      
                      <div className="flex items-center space-x-6">
                        {notif.link && (
                          <Link 
                            href={notif.link}
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] font-bold text-stone-900 uppercase tracking-widest hover:underline flex items-center"
                          >
                            View Details
                          </Link>
                        )}
                        {!notif.read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="absolute top-8 right-8 text-stone-200 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
