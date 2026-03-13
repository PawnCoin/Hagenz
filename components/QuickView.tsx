'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Heart, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface QuickViewProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickView({ productId, isOpen, onClose }: QuickViewProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (isOpen && productId) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, 'products', productId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProduct({ id: docSnap.id, ...data });
            if (data.variants && data.variants.length > 0) {
              setSelectedVariant(data.variants[0]);
            }
          }
        } catch (error) {
          console.error('Error fetching product for quick view:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant);
    onClose();
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedVariant);
    onClose();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-black hover:text-white transition-all shadow-lg"
          >
            <X size={20} />
          </button>

          {loading ? (
            <div className="flex-1 h-[400px] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : product ? (
            <>
              {/* Image Section */}
              <div className="md:w-1/2 bg-gray-50 relative h-[300px] md:h-auto">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-3">
                      {product.category}
                    </p>
                    <h2 className="text-4xl font-light text-stone-900 leading-tight font-display italic">
                      {product.name}
                    </h2>
                    <div className="flex items-center space-x-6 mt-6">
                      <div className="flex flex-col">
                        <p className="text-3xl font-bold text-stone-900 tracking-tight">${product.price}</p>
                        <p className="text-sm font-bold text-stone-400">{(product.price / 0.85).toFixed(2)} $Pc</p>
                      </div>
                      <div className="flex items-center text-amber-500 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                        <Star size={14} fill="currentColor" />
                        <span className="ml-1.5 text-[11px] font-bold">4.8</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-stone-500 leading-relaxed text-base font-medium">
                    {product.description}
                  </p>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Select Option</p>
                      <div className="flex flex-wrap gap-3">
                        {product.variants.map((v: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setSelectedVariant(v)}
                            className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border-2 ${
                              selectedVariant?.name === v.name
                                ? 'bg-stone-900 text-white border-stone-900 shadow-lg'
                                : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
                            }`}
                          >
                            {v.name} (+${v.price})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-4 pt-6">
                    <div className="flex space-x-4">
                      <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-white text-stone-900 border-2 border-stone-900 py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-stone-900 hover:text-white transition-all active:scale-95"
                      >
                        <ShoppingBag size={18} />
                        <span>Add to Cart</span>
                      </button>
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-5 rounded-full border-2 transition-all ${
                          isInWishlist(product.id)
                            ? 'bg-stone-900 border-stone-900 text-white shadow-lg'
                            : 'bg-white border-stone-100 text-stone-900 hover:border-stone-900'
                        }`}
                      >
                        <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <button 
                      onClick={handleBuyNow}
                      className="w-full bg-stone-900 text-white py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all active:scale-95 shadow-xl"
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className="pt-8 border-t border-stone-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      <span>Worldwide Shipping</span>
                      <span>•</span>
                      <span>Secure Payment</span>
                      <span>•</span>
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 p-12 text-center">
              <p>Product not found.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
