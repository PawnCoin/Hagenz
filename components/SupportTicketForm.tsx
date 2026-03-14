'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'motion/react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  category: z.enum(['order', 'payment', 'technical', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function SupportTicketForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'technical',
      priority: 'medium',
    }
  });

  const onSubmit = async (data: TicketFormValues) => {
    if (!user) {
      setError('You must be logged in to submit a ticket.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'tickets'), {
        ...data,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userEmail: user.email,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        responses: []
      });
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-100 p-12 rounded-[2rem] text-center"
      >
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-emerald-900 mb-4 font-display uppercase">Ticket Initialized</h2>
        <p className="text-emerald-700 font-mono text-xs uppercase tracking-widest mb-8">Our support matrix has received your transmission. We will respond shortly.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all font-mono"
        >
          Submit Another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 md:p-12 rounded-[2rem] border border-stone-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-mono">Subject</label>
          <input 
            {...register('subject')}
            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-6 py-4 focus:ring-1 focus:ring-stone-900 outline-none transition-all font-medium"
            placeholder="Brief description of the issue"
          />
          {errors.subject && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tighter mt-1">{errors.subject.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-mono">Category</label>
            <select 
              {...register('category')}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-6 py-4 focus:ring-1 focus:ring-stone-900 outline-none transition-all font-medium appearance-none"
            >
              <option value="order">Order</option>
              <option value="payment">Payment</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-mono">Priority</label>
            <select 
              {...register('priority')}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-6 py-4 focus:ring-1 focus:ring-stone-900 outline-none transition-all font-medium appearance-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-mono">Detailed Message</label>
        <textarea 
          {...register('message')}
          rows={6}
          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-6 py-4 focus:ring-1 focus:ring-stone-900 outline-none transition-all font-medium resize-none"
          placeholder="Please provide as much detail as possible..."
        />
        {errors.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-tighter mt-1">{errors.message.message}</p>}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
          <AlertCircle size={16} />
          <p className="text-[10px] font-bold uppercase tracking-widest font-mono">{error}</p>
        </div>
      )}

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-stone-900 text-white py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Send size={16} />
            <span>Transmit Ticket</span>
          </>
        )}
      </button>
    </form>
  );
}
