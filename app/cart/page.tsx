'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cart-context';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Coins, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCrypto } from '@/lib/crypto-context';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CartPage() {
  const { 
    items, 
    savedItems, 
    updateQuantity, 
    removeFromCart, 
    saveForLater, 
    moveToCart, 
    removeFromSaved, 
    totalPrice, 
    totalItems 
  } = useCart();
  const { usdcToPc } = useCrypto();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponError('');
    
    try {
      const q = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCode.toUpperCase()),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setCouponError('Invalid or expired coupon code.');
        setAppliedCoupon(null);
      } else {
        const coupon = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        
        // Check minimum purchase
        if (totalPrice < (coupon.minPurchase || 0)) {
          setCouponError(`Minimum purchase of $${coupon.minPurchase} required.`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
          setCouponCode('');
        }
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (totalPrice * appliedCoupon.value) / 100;
    }
    return Math.min(appliedCoupon.value, totalPrice);
  };

  const discount = calculateDiscount();
  const finalTotal = totalPrice - discount;

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-light text-stone-900 mb-12 font-display italic leading-tight">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-stone-50 rounded-[2rem] border border-stone-200">
            <div className="flex justify-center mb-6">
              <ShoppingBag size={64} className="text-stone-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">Your cart is empty</h2>
            <p className="text-stone-500 mb-8 font-medium">It seems you haven&apos;t added any items to your collection yet.</p>
            <Link 
              href="/shop"
              className="inline-flex items-center space-x-3 bg-stone-900 text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl"
            >
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-8 py-8 border-b border-stone-100">
                  <div className="relative w-32 h-32 flex-shrink-0 bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-stone-900 font-display uppercase tracking-tight">{item.name}</h3>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(item.selectedVariants).map(([key, value]) => (
                              <span key={key} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center space-x-3 mt-3">
                          <p className="text-lg font-bold text-stone-900">${item.price}</p>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {usdcToPc(item.price).toFixed(2)} $Pc
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-rose-500 transition-colors p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                      <div className="flex items-center mt-6 space-x-6">
                        <div className="flex items-center border-2 border-stone-100 rounded-full px-4 py-1.5">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-stone-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          onClick={() => saveForLater(item.id)}
                          className="text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors"
                        >
                          Save for Later
                        </button>
                        <p className="text-sm font-bold text-stone-900">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-[2rem] p-10 sticky top-24 border border-stone-100 shadow-sm">
                  <h2 className="text-2xl font-bold text-stone-900 mb-8 font-display uppercase tracking-tight">Order Summary</h2>
                  
                  {/* Coupon Input */}
                  <div className="mb-10">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-3">Promo Code</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="ENTER CODE"
                        className="flex-1 px-6 py-3.5 bg-stone-50 border border-stone-100 rounded-full text-sm focus:ring-2 focus:ring-stone-900 outline-none text-stone-900 placeholder:text-stone-300 transition-all"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={isApplying || !couponCode.trim()}
                        className="px-6 py-3.5 bg-stone-900 text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-rose-500 text-[10px] mt-3 font-bold uppercase tracking-widest">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="mt-3 flex items-center justify-between bg-stone-900 text-white px-4 py-2.5 rounded-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{appliedCoupon.code} Applied</span>
                        <button 
                          onClick={() => setAppliedCoupon(null)}
                          className="text-white/60 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5 mb-10">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="text-stone-900">${totalPrice.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-900">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span className="text-rose-500">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      <span>Shipping</span>
                      <span className="text-stone-900">Complimentary</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
                      <span>Tax</span>
                      <span className="text-stone-900">$0.00</span>
                    </div>
                    <div className="pt-6 border-t border-stone-100 flex justify-between items-center">
                      <span className="text-xl font-bold text-stone-900 font-display uppercase tracking-tight">Total</span>
                      <div className="text-right">
                        <span className="block text-3xl font-bold text-stone-900 tracking-tight">${finalTotal.toFixed(2)}</span>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{usdcToPc(finalTotal).toFixed(2)} $Pc</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href="/checkout"
                    className="w-full flex items-center justify-center space-x-3 bg-stone-900 text-white py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl active:scale-95"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </Link>
                  <p className="text-center text-[10px] text-stone-300 mt-8 uppercase tracking-[0.2em] font-bold">
                    Secure Checkout • Hagenz Market
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="mt-24">
              <h2 className="text-3xl font-light text-stone-900 mb-12 font-display italic">Saved for Later</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm group">
                    <div className="relative aspect-square bg-stone-50 rounded-2xl overflow-hidden mb-6 border border-stone-50">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-tight">{item.name}</h3>
                        <p className="text-sm font-black text-stone-900 font-mono">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => moveToCart(item.id)}
                          className="flex-1 bg-stone-900 text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
                        >
                          Move to Cart
                        </button>
                        <button 
                          onClick={() => removeFromSaved(item.id)}
                          className="p-3 text-stone-300 hover:text-rose-500 transition-colors border border-stone-100 rounded-full"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }
