'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Clock, AlertCircle, ChevronRight, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'closed': return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-rose-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-stone-900 font-display uppercase">Support Matrix Control</h1>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest mt-2">Manage and respond to customer technical inquiries.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-stone-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text"
            placeholder="Search by subject, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 focus:ring-1 focus:ring-stone-900 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center space-x-2 bg-stone-50 p-1 rounded-2xl border border-stone-100">
          {(['all', 'open', 'in-progress', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center border border-stone-100 shadow-sm">
          <MessageSquare size={48} className="mx-auto mb-6 text-stone-200" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2 font-display uppercase tracking-tight">No Tickets Found</h2>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">The support matrix is currently clear of matching signals.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link 
                  href={`/admin/tickets/${ticket.id}`}
                  className="block bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-widest font-mono ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                          {ticket.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-stone-700 transition-colors uppercase tracking-tight">{ticket.subject}</h3>
                      <div className="flex items-center space-x-4 text-stone-400 font-mono text-[9px] uppercase tracking-widest">
                        <span>{ticket.userName} ({ticket.userEmail})</span>
                        <span>•</span>
                        <span>{ticket.updatedAt?.toDate ? format(ticket.updatedAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden md:block">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Responses</p>
                        <p className="text-sm font-black text-stone-900">{ticket.responses?.length || 0}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
