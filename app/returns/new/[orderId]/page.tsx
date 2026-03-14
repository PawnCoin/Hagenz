'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, Package, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewReturnPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId || !user) return;
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId as string));
        if (orderDoc.exists()) {
          const data = orderDoc.data();
          if (data.userId === user.uid) {
            setOrder({ id: orderDoc.id, ...data });
          } else {
            router.push('/profile');
          }
        } else {
          router.push('/profile');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, user, router]);

  const toggleItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !reason.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const returnItems = order.items.filter((item: any) => selectedItems.includes(item.productId));
      
      await addDoc(collection(db, 'returns'), {
        orderId: order.id,
        userId: user.uid,
        items: returnItems,
        reason: reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting return:', err);
      setError('Failed to submit return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest">Accessing Order Data...</div>;

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#fdfcf8] pt-24">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3rem] border border-stone-100 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-stone-900 mb-4 font-display uppercase">Return Initialized</h2>
            <p className="text-stone-500 font-mono text-xs uppercase tracking-widest mb-12 leading-relaxed">
              Your return request for Order #{order.id.slice(-8)} has been logged. Our logistics matrix will review your request within 24-48 hours.
            </p>
            <Link 
              href="/profile"
              className="inline-block bg-stone-900 text-white px-12 py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl font-mono"
            >
              Back to Profile
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link 
            href="/profile"
            className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-8 font-mono"
          >
            <ArrowLeft size={14} />
            <span>Back to Logs</span>
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={24} />
            </div>
            <h1 className="text-5xl font-light text-stone-900 font-display italic tracking-tight">Return <span className="not-italic font-bold">Request</span></h1>
          </div>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Order Hash: #{order.id.slice(-8)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8 font-mono">Select Items for Return</h3>
            
            <div className="space-y-4 mb-12">
              {order.items.map((item: any) => (
                <div 
                  key={item.productId}
                  onClick={() => toggleItem(item.productId)}
                  className={`flex items-center justify-between p-6 rounded-2xl border cursor-pointer transition-all ${
                    selectedItems.includes(item.productId) 
                      ? 'border-stone-900 bg-stone-50' 
                      : 'border-stone-100 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.productId) 
                        ? 'bg-stone-900 border-stone-900 text-white' 
                        : 'border-stone-200'
                    }`}>
                      {selectedItems.includes(item.productId) && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight text-stone-900">{item.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono uppercase">Qty: {item.quantity} • ${item.price}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-stone-900 font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Reason for Return</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you are returning these items..."
                rows={5}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-8 py-6 focus:ring-1 focus:ring-stone-900 outline-none transition-all font-medium resize-none"
                required
              />
            </div>

            {error && (
              <div className="mt-6 flex items-center space-x-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
                <AlertCircle size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest font-mono">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={selectedItems.length === 0 || !reason.trim() || isSubmitting}
              className="w-full mt-12 bg-stone-900 text-white py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-30"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  <span>Transmit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
