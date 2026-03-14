'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Heart, Star, Shield, Truck, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCrypto } from '@/lib/crypto-context';

interface QuickViewProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { usdcToPc } = useCrypto();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, selectedVariants);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-lg"
            >
              <X size={20} />
            </button>

            {/* Image Section */}
            <div className="md:w-1/2 relative bg-stone-50 min-h-[300px] md:min-h-0">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              {product.discountPrice && (
                <div className="absolute top-8 left-8 bg-rose-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Sale
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                      {product.category}
                    </span>
                    <div className="flex items-center text-amber-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold text-stone-900 ml-1">4.9</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-stone-900 font-display uppercase tracking-tighter leading-none mb-4">
                    {product.name}
                  </h2>
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-end space-x-4">
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-stone-900 font-display tracking-tighter">
                      ${product.discountPrice || product.price}
                    </p>
                    {product.discountPrice && (
                      <p className="text-sm text-stone-300 line-through font-bold">${product.price}</p>
                    )}
                  </div>
                  <div className="pb-1">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                      {usdcToPc(product.discountPrice || product.price).toFixed(2)} $Pc
                    </span>
                  </div>
                </div>

                {/* Variants */}
                {product.variants && product.variants.map((variant: any) => (
                  <div key={variant.name} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-900 font-mono">{variant.name}</h4>
                    <div className="flex flex-wrap gap-3">
                      {variant.options.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                          className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${
                            selectedVariants[variant.name] === option
                              ? 'bg-stone-900 border-stone-900 text-white shadow-lg'
                              : 'bg-white border-stone-100 text-stone-400 hover:border-stone-900 hover:text-stone-900'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center space-x-4 pt-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-grow flex items-center justify-center space-x-3 bg-stone-900 text-white py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl active:scale-95"
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Collection</span>
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-5 rounded-full border-2 transition-all active:scale-90 ${
                      isInWishlist(product.id)
                        ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-inner'
                        : 'bg-white border-stone-100 text-stone-400 hover:border-stone-900 hover:text-stone-900'
                    }`}
                  >
                    <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="flex items-center space-x-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <Truck size={16} className="text-stone-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-900">Complimentary</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">Standard Delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <Shield size={16} className="text-stone-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-900">Secure Node</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">Encrypted Logistics</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => window.location.href = `/products/${product.id}`}
                    className="w-full flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <span>View Full Specifications</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
