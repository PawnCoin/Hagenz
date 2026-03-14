'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');

  useEffect(() => {
    const q = query(collection(db, 'returns'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const returnData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReturns(returnData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredReturns = returns.filter(r => filter === 'all' || r.status === filter);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'returns', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating return status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completed': return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-stone-900 font-display uppercase">Logistics Returns</h1>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest mt-2">Manage and process product return requests.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-stone-100 shadow-sm overflow-x-auto">
        {(['all', 'pending', 'approved', 'rejected', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === f ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-stone-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center border border-stone-100 shadow-sm">
          <Package size={48} className="mx-auto mb-6 text-stone-200" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2 font-display uppercase tracking-tight">No Requests Found</h2>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">The returns matrix is currently clear.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {filteredReturns.map((ret, index) => (
              <motion.div
                key={ret.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(ret.status)}`}>
                        {ret.status}
                      </span>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                        Request ID: {ret.id}
                      </span>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                        Order: #{ret.orderId.slice(-8)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 font-mono">Items to Return</h3>
                      <div className="flex flex-wrap gap-2">
                        {ret.items.map((item: any, i: number) => (
                          <span key={i} className="bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-900">
                            {item.name} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 font-mono">Reason</h3>
                      <p className="text-sm text-stone-600 font-medium leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
                        {ret.reason}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-stone-400 font-mono text-[9px] uppercase tracking-widest">
                      <span>User ID: {ret.userId}</span>
                      <span>•</span>
                      <span>{ret.createdAt?.toDate ? format(ret.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Recently'}</span>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[160px]">
                    {ret.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(ret.id, 'approved')}
                          className="flex-1 lg:flex-none bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2"
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => updateStatus(ret.id, 'rejected')}
                          className="flex-1 lg:flex-none bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center space-x-2"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    {ret.status === 'approved' && (
                      <button 
                        onClick={() => updateStatus(ret.id, 'completed')}
                        className="w-full bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCircle size={14} />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
