'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Gift, CreditCard, Send, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const GIFT_CARD_AMOUNTS = [25, 50, 100, 250, 500];

export default function GiftCardsPage() {
  const { user, login } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handlePurchase = async () => {
    if (!user) {
      login();
      return;
    }

    setIsPurchasing(true);
    const code = generateCode();
    
    try {
      await addDoc(collection(db, 'giftcards'), {
        code,
        initialBalance: selectedAmount,
        currentBalance: selectedAmount,
        userId: user.uid,
        recipientEmail: recipientEmail || null,
        isActive: true,
        createdAt: serverTimestamp(),
        expiryDate: null // Never expires for now
      });

      setGeneratedCode(code);
      setPurchaseSuccess(true);
    } catch (error) {
      console.error('Error purchasing gift card:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-stone-100 px-4 py-2 rounded-full mb-6 border border-stone-200"
            >
              <Gift size={14} className="text-stone-900" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Digital Gift Cards</span>
            </motion.div>
            <h1 className="text-6xl font-light text-stone-900 mb-6 font-display italic leading-tight">Give the Gift of Choice</h1>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto font-medium">
              Share the Hagenz experience with friends and family. Our digital gift cards are delivered instantly and never expire.
            </p>
          </div>

          {purchaseSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-12 shadow-2xl border border-stone-100 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">Purchase Successful</h2>
              <p className="text-stone-500 mb-10 max-w-md mx-auto">
                Your gift card has been generated. You can share this code with the recipient or keep it for yourself.
              </p>
              
              <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 mb-10">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Your Gift Card Code</p>
                <p className="text-3xl font-mono font-bold text-stone-900 tracking-[0.2em]">{generatedCode.match(/.{1,4}/g)?.join('-')}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setPurchaseSuccess(false)}
                  className="px-10 py-4 bg-stone-100 text-stone-900 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-200 transition-all"
                >
                  Buy Another
                </button>
                <Link 
                  href="/shop"
                  className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Gift Card Preview */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="relative aspect-[1.6/1] w-full bg-stone-900 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-2xl font-light font-display italic">Hagenz Market.</span>
                      <Gift size={32} className="text-stone-700" />
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-2">Digital Gift Card</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-5xl font-bold tracking-tighter">${selectedAmount}</span>
                        <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">USD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6 border-b border-stone-50 pb-4">Card Details</h3>
                  <ul className="space-y-4">
                    {[
                      'Instant delivery via email',
                      'Redeemable on all products',
                      'No expiration date',
                      'Can be used across multiple orders'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3 text-stone-500 text-xs font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Purchase Form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[3rem] p-10 shadow-xl border border-stone-100"
              >
                <div className="space-y-10">
                  {/* Amount Selection */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-6">Select Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                      {GIFT_CARD_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setSelectedAmount(amount)}
                          className={`py-4 rounded-2xl text-sm font-bold transition-all border-2 ${
                            selectedAmount === amount 
                              ? 'bg-stone-900 border-stone-900 text-white shadow-lg' 
                              : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-4">Recipient Email (Optional)</label>
                    <div className="relative">
                      <Send size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input 
                        type="email" 
                        placeholder="friend@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all text-stone-900 placeholder:text-stone-300"
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-3 font-medium italic">Leave blank to receive the code yourself.</p>
                  </div>

                  {/* Payment Info */}
                  <div className="pt-6 border-t border-stone-100">
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-sm font-bold text-stone-900 uppercase tracking-widest">Total Due</span>
                      <span className="text-3xl font-bold text-stone-900 tracking-tight">${selectedAmount.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="w-full bg-stone-900 text-white py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          <span>Purchase Gift Card</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-[10px] text-stone-300 mt-6 uppercase tracking-[0.2em] font-bold">
                      Secure Transaction • Hagenz Market
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
