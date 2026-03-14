'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'motion/react';
import { ArrowLeft, Send, User, Shield, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'tickets', id as string), (docSnap) => {
      if (docSnap.exists()) {
        setTicket({ id: docSnap.id, ...docSnap.data() });
      } else {
        router.push('/admin/tickets');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const ticketRef = doc(db, 'tickets', id as string);
      await updateDoc(ticketRef, {
        responses: arrayUnion({
          senderId: user.uid,
          senderName: 'Luster Admin',
          message: newMessage.trim(),
          createdAt: new Date().toISOString(),
          isAdmin: true
        }),
        status: ticket.status === 'open' ? 'in-progress' : ticket.status,
        updatedAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const ticketRef = doc(db, 'tickets', id as string);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin/tickets"
            className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-4 font-mono"
          >
            <ArrowLeft size={14} />
            <span>Back to Matrix Control</span>
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
              ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              ticket.status === 'in-progress' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-stone-100 text-stone-500 border-stone-200'
            }`}>
              {ticket.status}
            </span>
            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest font-mono">
              ID: {ticket.id}
            </span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-display uppercase tracking-tight">{ticket.subject}</h1>
        </div>

        <div className="flex items-center space-x-3">
          {ticket.status !== 'closed' ? (
            <button 
              onClick={() => updateStatus('closed')}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center space-x-2 shadow-lg"
            >
              <CheckCircle size={14} />
              <span>Close Ticket</span>
            </button>
          ) : (
            <button 
              onClick={() => updateStatus('open')}
              className="bg-white text-stone-900 border border-stone-200 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center space-x-2 shadow-sm"
            >
              <RotateCcw size={14} />
              <span>Reopen Ticket</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Original Message */}
          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{ticket.userName}</p>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  {ticket.userEmail} • {ticket.createdAt?.toDate ? format(ticket.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Recently'}
                </p>
              </div>
            </div>
            <p className="text-stone-600 leading-relaxed font-medium whitespace-pre-wrap">
              {ticket.message}
            </p>
          </div>

          {/* Responses */}
          <div className="space-y-6">
            {ticket.responses?.map((resp: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${resp.isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-6 rounded-[1.5rem] ${
                  resp.isAdmin 
                    ? 'bg-stone-900 text-white rounded-tr-none shadow-xl' 
                    : 'bg-white border border-stone-100 text-stone-900 rounded-tl-none shadow-sm'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {resp.isAdmin ? <Shield size={12} className="text-stone-400" /> : <User size={12} className="text-stone-400" />}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${resp.isAdmin ? 'text-stone-500' : 'text-stone-400'}`}>
                      {resp.isAdmin ? 'Admin Response' : resp.senderName}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                    {resp.message}
                  </p>
                  <p className={`text-[8px] font-bold uppercase tracking-widest mt-3 font-mono ${resp.isAdmin ? 'text-stone-500' : 'text-stone-300'}`}>
                    {format(new Date(resp.createdAt), 'MMM dd, HH:mm')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="relative">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type admin response..."
                rows={4}
                className="w-full bg-white border border-stone-200 rounded-[2rem] px-8 py-6 focus:ring-1 focus:ring-stone-900 outline-none transition-all font-medium resize-none shadow-sm"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="absolute bottom-4 right-4 bg-stone-900 text-white p-4 rounded-full hover:bg-stone-800 transition-all shadow-lg disabled:opacity-30"
              >
                <Send size={20} />
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6 font-mono">User Context</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Name</p>
                <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{ticket.userName}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Email</p>
                <p className="text-xs font-black text-stone-900 lowercase tracking-tight">{ticket.userEmail}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">User ID</p>
                <p className="text-[10px] font-mono text-stone-500 break-all">{ticket.userId}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6 font-mono">Ticket Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Priority</p>
                <p className={`text-xs font-black uppercase tracking-tight ${
                  ticket.priority === 'critical' ? 'text-rose-600' :
                  ticket.priority === 'high' ? 'text-orange-600' :
                  ticket.priority === 'medium' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>{ticket.priority}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Category</p>
                <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{ticket.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotateCcw({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
