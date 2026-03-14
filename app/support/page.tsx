'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'motion/react';
import { MessageSquare, Send, CheckCircle2, Loader2, LifeBuoy, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function SupportPage() {
  const { user, login } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      login();
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tickets'), {
        userId: user.uid,
        userEmail: user.email,
        subject,
        category,
        message,
        status: 'open',
        priority: 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replies: []
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 bg-stone-100 px-4 py-2 rounded-full mb-6 border border-stone-200"
              >
                <LifeBuoy size={14} className="text-stone-900" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Help Center</span>
              </motion.div>
              <h1 className="text-6xl font-light text-stone-900 mb-8 font-display italic leading-tight">How can we help you?</h1>
              <p className="text-stone-500 text-lg font-medium leading-relaxed">
                Our dedicated support team is here to assist you with any questions or concerns. We typically respond within 24 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-stone-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-1">Email Us</h3>
                  <p className="text-stone-500 text-sm">support@hagenz.market</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-stone-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-1">Call Us</h3>
                  <p className="text-stone-500 text-sm">+1 (888) HAGENZ-M</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-stone-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-1">Headquarters</h3>
                  <p className="text-stone-500 text-sm">742 Evergreen Terrace, Springfield</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-stone-900 rounded-[2.5rem] text-white">
              <h4 className="text-xl font-bold font-display uppercase tracking-tight mb-4">Check Status</h4>
              <p className="text-stone-400 text-xs mb-8 leading-relaxed">
                Already submitted a ticket? You can track its progress and view our replies in your dashboard.
              </p>
              <Link 
                href="/support/tickets"
                className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-white hover:text-stone-300 transition-colors"
              >
                <span>View My Tickets</span>
                <Send size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-12 shadow-2xl border border-stone-100 text-center"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">Ticket Submitted</h2>
                <p className="text-stone-500 mb-10 max-w-md mx-auto">
                  Your support request has been received. We've assigned a team member to your case and will get back to you shortly.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-10 py-4 bg-stone-100 text-stone-900 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-200 transition-all"
                  >
                    New Ticket
                  </button>
                  <Link 
                    href="/support/tickets"
                    className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
                  >
                    View My Tickets
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[3rem] p-12 shadow-xl border border-stone-100"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all text-stone-900 appearance-none"
                      >
                        <option>Order Issue</option>
                        <option>Payment Issue</option>
                        <option>Product Question</option>
                        <option>Returns & Refunds</option>
                        <option>Account Support</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Subject</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Brief summary of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all text-stone-900 placeholder:text-stone-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Message</label>
                    <textarea 
                      required
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-100 rounded-[2rem] px-8 py-6 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all text-stone-900 placeholder:text-stone-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 text-white py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare size={16} />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
