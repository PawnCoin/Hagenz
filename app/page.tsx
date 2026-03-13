'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '@/firebase';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test connection on boot
    testFirestoreConnection();

    async function fetchProducts() {
      const path = 'products';
      try {
        const q = query(collection(db, path), limit(8));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // If no products in DB, show some placeholders (including food)
        if (productsData.length === 0) {
          setProducts([
            { id: '1', name: 'Artisanal Sourdough', price: 12, image: 'https://picsum.photos/seed/bread/800/800', category: 'Food', description: 'Freshly baked daily with organic flour.' },
            { id: '2', name: 'Organic Olive Oil', price: 34, image: 'https://picsum.photos/seed/olive/800/800', category: 'Food', description: 'Cold-pressed extra virgin olive oil from Tuscany.' },
            { id: '3', name: 'Ceramic Serving Bowl', price: 55, image: 'https://picsum.photos/seed/bowl/800/800', category: 'Home', description: 'Hand-thrown ceramic bowl with a matte finish.' },
            { id: '4', name: 'Linen Table Runner', price: 45, image: 'https://picsum.photos/seed/linen/800/800', category: 'Home', description: '100% natural linen for an elegant table setting.' },
            { id: '5', name: 'Premium Espresso Beans', price: 28, image: 'https://picsum.photos/seed/coffee/800/800', category: 'Food', description: 'Dark roast beans with notes of chocolate and caramel.' },
            { id: '6', name: 'Handcrafted Knife Set', price: 299, image: 'https://picsum.photos/seed/knife/800/800', category: 'Kitchen', description: 'Professional grade steel with ergonomic wood handles.' },
          ]);
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        // Log error but don't crash, use placeholders as fallback
        console.error('Error fetching products:', error);
        setProducts([
          { id: '1', name: 'Artisanal Sourdough', price: 12, image: 'https://picsum.photos/seed/bread/800/800', category: 'Food', description: 'Freshly baked daily with organic flour.' },
          { id: '2', name: 'Organic Olive Oil', price: 34, image: 'https://picsum.photos/seed/olive/800/800', category: 'Food', description: 'Cold-pressed extra virgin olive oil from Tuscany.' },
          { id: '3', name: 'Ceramic Serving Bowl', price: 55, image: 'https://picsum.photos/seed/bowl/800/800', category: 'Home', description: 'Hand-thrown ceramic bowl with a matte finish.' },
          { id: '4', name: 'Linen Table Runner', price: 45, image: 'https://picsum.photos/seed/linen/800/800', category: 'Home', description: '100% natural linen for an elegant table setting.' },
          { id: '5', name: 'Premium Espresso Beans', price: 28, image: 'https://picsum.photos/seed/coffee/800/800', category: 'Food', description: 'Dark roast beans with notes of chocolate and caramel.' },
          { id: '6', name: 'Handcrafted Knife Set', price: 299, image: 'https://picsum.photos/seed/knife/800/800', category: 'Kitchen', description: 'Professional grade steel with ergonomic wood handles.' },
        ]);
        // Still call the error handler for logging
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (e) {
          // Ignore re-thrown error
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#fdfcf8]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full relative"
          >
            <Image 
              src="https://picsum.photos/seed/marketplace/1920/1080?blur=1" 
              alt="Hero" 
              fill
              className="object-cover brightness-[0.85]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#fdfcf8]" />
          </motion.div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-600 text-[12px] font-bold tracking-[0.3em] uppercase mb-6"
          >
            Established 2026
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-7xl md:text-9xl font-light text-stone-900 tracking-tight mb-10 font-display italic"
          >
            Hagenz <span className="font-normal not-italic">Market.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              href="/shop"
              className="inline-flex items-center space-x-3 bg-stone-900 text-white px-12 py-5 rounded-full font-medium hover:bg-stone-700 transition-all duration-300 shadow-xl text-[13px] uppercase tracking-widest"
            >
              <span>Explore Collection</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-4 border-b border-stone-200 pb-8">
          <div>
            <h2 className="text-5xl font-light tracking-tight text-stone-900 font-display italic">The Daily <span className="font-normal not-italic">Essentials</span></h2>
            <p className="mt-4 text-stone-500 text-[14px] max-w-md">Carefully selected goods for a refined lifestyle, from artisanal pantry staples to timeless home hardware.</p>
          </div>
          <Link href="/shop" className="text-[12px] font-bold text-stone-900 uppercase tracking-widest hover:opacity-50 transition-opacity">
            View All Products
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-stone-100 rounded-3xl mb-4"></div>
                <div className="h-4 bg-stone-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-stone-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-20">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-stone-900 py-32 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-light tracking-tight text-white mb-6 font-display italic">Join the <span className="font-normal not-italic">Community</span></h2>
          <p className="text-stone-400 mb-12 text-[14px] tracking-wide">Subscribe to receive updates on new arrivals, seasonal recipes, and exclusive events.</p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-8 py-5 rounded-full bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-stone-500 transition-all text-sm tracking-wide"
              required
            />
            <button 
              type="submit"
              className="bg-white text-stone-900 px-12 py-5 rounded-full font-bold hover:bg-stone-200 transition-all uppercase tracking-widest text-[12px] shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
