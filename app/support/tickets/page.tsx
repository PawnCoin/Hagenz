'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2, LifeBuoy, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { format } from 'date-fns';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const STATUS_COLORS = {
  'open': 'bg-blue-50 text-blue-600 border-blue-100',
  'in-progress': 'bg-amber-50 text-amber-600 border-amber-100',
  'resolved': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'closed': 'bg-stone-50 text-stone-500 border-stone-100'
};

const STATUS_ICONS = {
  'open': Clock,
  'in-progress': Loader2,
  'resolved': CheckCircle2,
  'closed': AlertCircle
};

export default function MyTicketsPage() {
  const { user, login } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      setTickets(ticketData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fdfcf8] flex items-center justify-center pt-24">
        <Navbar />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Please log in to view your tickets</h2>
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/support" className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-6">
            <ArrowLeft size={14} className="mr-2" />
            Back to Support
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-light text-stone-900 font-display italic leading-tight">My Support Tickets</h1>
              <p className="text-stone-500 mt-2 font-medium">Track and manage your support requests.</p>
            </div>
            <Link 
              href="/support"
              className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl text-center"
            >
              New Ticket
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 size={40} className="text-stone-300 animate-spin" />
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-stone-100 shadow-sm">
            <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-8">
              <LifeBuoy size={40} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">No Tickets Found</h2>
            <p className="text-stone-500 mb-10 max-w-md mx-auto">
              You haven't submitted any support tickets yet. If you need help, our team is ready to assist.
            </p>
            <Link 
              href="/support"
              className="inline-block bg-stone-900 text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
            >
              Submit Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => {
              const StatusIcon = STATUS_ICONS[ticket.status] || Clock;
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                        <StatusIcon size={20} className={ticket.status === 'in-progress' ? 'animate-spin' : ''} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{ticket.category}</span>
                          <span className="w-1 h-1 bg-stone-200 rounded-full" />
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {format(ticket.createdAt.toDate(), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 font-display uppercase tracking-tight group-hover:text-stone-600 transition-colors">
                          {ticket.subject}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end space-x-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <ChevronRight size={20} className="text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all" />
                    </div>
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
