'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Send, User, Shield, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    const unsubscribe = onSnapshot(doc(db, 'tickets', id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Security check: only owner or admin can view
        if (data.userId === user.uid || user.role === 'admin') {
          setTicket({ id: docSnap.id, ...data });
        } else {
          router.push('/support');
        }
      } else {
        router.push('/support');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, user, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket?.responses]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const ticketRef = doc(db, 'tickets', id as string);
      await updateDoc(ticketRef, {
        responses: arrayUnion({
          senderId: user.uid,
          senderName: user.displayName || 'User',
          message: newMessage.trim(),
          createdAt: new Date().toISOString(),
          isAdmin: user.role === 'admin'
        }),
        updatedAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link 
            href="/support"
            className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-8 font-mono"
          >
            <ArrowLeft size={14} />
            <span>Back to Support Matrix</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  ticket.status === 'in-progress' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-stone-100 text-stone-500 border-stone-200'
                }`}>
                  {ticket.status}
                </span>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  ID: {ticket.id.slice(0, 12)}
                </span>
              </div>
              <h1 className="text-4xl font-black text-stone-900 font-display uppercase tracking-tight leading-tight">{ticket.subject}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
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
                    {ticket.createdAt?.toDate ? format(ticket.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Recently'}
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
                  className={`flex ${resp.isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] p-6 rounded-[1.5rem] ${
                    resp.isAdmin 
                      ? 'bg-stone-900 text-white rounded-tl-none' 
                      : 'bg-white border border-stone-100 text-stone-900 rounded-tr-none shadow-sm'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      {resp.isAdmin ? <Shield size={12} className="text-stone-400" /> : <User size={12} className="text-stone-400" />}
                      <span className={`text-[9px] font-black uppercase tracking-widest ${resp.isAdmin ? 'text-stone-400' : 'text-stone-400'}`}>
                        {resp.isAdmin ? 'Luster Support' : resp.senderName}
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
            {ticket.status !== 'closed' ? (
              <form onSubmit={handleSendMessage} className="relative">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
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
            ) : (
              <div className="bg-stone-50 border border-stone-100 p-8 rounded-[2rem] text-center">
                <AlertCircle size={24} className="mx-auto mb-4 text-stone-300" />
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">This ticket has been closed and is read-only.</p>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6 font-mono">Ticket Metadata</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Category</p>
                  <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{ticket.category}</p>
                </div>
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
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Initialized</p>
                  <p className="text-xs font-black text-stone-900 uppercase tracking-tight">
                    {ticket.createdAt?.toDate ? format(ticket.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 font-mono">Last Activity</p>
                  <p className="text-xs font-black text-stone-900 uppercase tracking-tight">
                    {ticket.updatedAt?.toDate ? format(ticket.updatedAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4 font-mono">Support Policy</h3>
              <p className="text-[11px] leading-relaxed text-stone-400 font-medium">
                Our technical matrix typically processes signals within 24-48 hours. Critical priority transmissions are prioritized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
