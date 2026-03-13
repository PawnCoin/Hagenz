'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cart-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Shield, Truck, RotateCcw, Plus, Heart, Coins } from 'lucide-react';
import Image from 'next/image';
import ReviewSection from '@/components/ReviewSection';
import { useWishlist } from '@/lib/wishlist-context';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(id as string);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          
          // Initialize selected variants with first options
          if (data.variants && data.variants.length > 0) {
            const initial: { [key: string]: string } = {};
            data.variants.forEach((v: any) => {
              if (v.options && v.options.length > 0) {
                initial[v.name] = v.options[0];
              }
            });
            setSelectedVariants(initial);
          }
        } else {
          // Placeholder if not found
          setProduct({
            id: id as string,
            name: 'Artisanal Sourdough',
            price: 12.00,
            description: 'Naturally leavened and baked in a stone oven for a thick, crunchy crust and an airy, tangy interior. Perfect for your morning toast or as an accompaniment to hearty soups.',
            image: `https://picsum.photos/seed/${id}/1000/1000`,
            category: 'Pantry',
            stock: 24,
            variants: [
              { name: 'Size', options: ['Small Loaf', 'Large Loaf'] },
              { name: 'Slicing', options: ['Whole', 'Thick Slices', 'Thin Slices'] }
            ]
          });
          setSelectedVariants({ 'Size': 'Large Loaf', 'Slicing': 'Whole' });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleVariantChange = (name: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [name]: option }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariants);
    router.push('/checkout');
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

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[4/5] relative bg-stone-100 rounded-[2rem] overflow-hidden border border-stone-200 shadow-sm">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square relative bg-stone-100 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-stone-200">
                  <Image 
                    src={`https://picsum.photos/seed/${product.id}-${i}/300/300`} 
                    alt={`${product.name} ${i}`} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-3">{product.category}</p>
              <h1 className="text-5xl md:text-6xl font-light text-stone-900 mb-6 font-display italic leading-tight">{product.name}</h1>
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">4.8 Rating (48 Reviews)</span>
              </div>
              <div className="flex items-baseline space-x-6 mb-8">
                <p className="text-4xl font-bold text-stone-900 tracking-tight">${product.price}</p>
                <div className="flex items-center space-x-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-200">
                  <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">{(product.price / 0.85).toFixed(2)} $Pc</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">Description</h3>
              <p className="text-stone-600 leading-relaxed text-lg font-medium">
                {product.description}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-10 mb-12">
                {product.variants.map((variant: any) => (
                  <div key={variant.name}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">{variant.name}</h3>
                      <span className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">{selectedVariants[variant.name]}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {variant.options.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => handleVariantChange(variant.name, option)}
                          className={`px-8 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-2 ${
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
              </div>
            )}

            <div className="space-y-6 mb-12">
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white text-stone-900 border-2 border-stone-900 py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all transform active:scale-[0.98] flex items-center justify-center space-x-3"
                  >
                    <ShoppingBag size={20} />
                    <span>Add to Cart</span>
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                      isWishlisted ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-white border-stone-100 text-stone-900 hover:border-stone-900'
                    }`}
                  >
                    <Heart size={28} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-stone-900 text-white py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all transform active:scale-[0.98] shadow-2xl"
                >
                  Buy Now
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-stone-100">
                <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <Truck size={18} className="text-stone-900" />
                  <span>Worldwide Shipping</span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <RotateCcw size={18} className="text-stone-900" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <Shield size={18} className="text-stone-900" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-stone-100">
              <details className="group py-6 border-b border-stone-100">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900">Product Details</span>
                  <Plus size={18} className="group-open:rotate-45 transition-transform text-stone-400" />
                </summary>
                <div className="mt-6 overflow-hidden rounded-3xl border border-stone-100">
                  <table className="w-full text-[11px] text-left">
                    <tbody className="divide-y divide-stone-100">
                      {[
                        { label: 'Origin', value: 'Local Artisans' },
                        { label: 'Material', value: 'Organic & Sustainable' },
                        { label: 'Weight', value: '0.85 kg' },
                        { label: 'Care', value: 'Handcrafted with love' },
                        { label: 'Warranty', value: 'Quality Guaranteed' }
                      ].map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-stone-50/30' : 'bg-white'}>
                          <td className="px-6 py-4 font-bold text-stone-900 w-1/3 uppercase tracking-widest">{spec.label}</td>
                          <td className="px-6 py-4 text-stone-500 uppercase tracking-widest">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details className="group py-6 border-b border-stone-100">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-900">Care Instructions</span>
                  <Plus size={18} className="group-open:rotate-45 transition-transform text-stone-400" />
                </summary>
                <div className="mt-6 text-sm text-stone-500 leading-relaxed font-medium">
                  Store in a cool, dry place. For best results, consume within 3 days of delivery or freeze for long-term storage.
                </div>
              </details>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={id as string} />
      </div>
    </main>
  );
}
