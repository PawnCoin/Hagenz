'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Loader2, CheckCircle2, Info, Package, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

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
  order: 'text-blue-500 bg-blue-50',
  ticket: 'text-amber-500 bg-amber-50',
  system: 'text-stone-500 bg-stone-50',
  reward: 'text-emerald-500 bg-emerald-50'
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
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

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-stone-50 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-10 flex flex-col items-center justify-center space-y-3">
                    <Loader2 size={20} className="text-stone-200 animate-spin" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-300">Syncing...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {notifications.map((notif) => {
                      const Icon = TYPE_ICONS[notif.type] || Info;
                      return (
                        <div 
                          key={notif.id}
                          className={`p-5 hover:bg-stone-50 transition-colors relative ${!notif.read ? 'bg-stone-50/50' : ''}`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${TYPE_COLORS[notif.type]}`}>
                              <Icon size={14} />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-[10px] font-bold text-stone-900 uppercase tracking-tight truncate pr-4">{notif.title}</h4>
                                <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest whitespace-nowrap">
                                  {notif.createdAt ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : ''}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-500 leading-relaxed mb-2 line-clamp-2">{notif.message}</p>
                              {notif.link && (
                                <Link 
                                  href={notif.link}
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setIsOpen(false);
                                  }}
                                  className="text-[9px] font-bold text-stone-900 uppercase tracking-widest hover:underline"
                                >
                                  View Details
                                </Link>
                              )}
                            </div>
                            {!notif.read && (
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link 
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block p-4 text-center bg-stone-50 text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors border-t border-stone-100"
              >
                View All Notifications
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
