'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useWishlist } from '@/lib/wishlist-context';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function WishlistPage() {
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const productPromises = wishlist.map(item => 
          getDoc(doc(db, 'products', item.productId))
        );
        const productSnaps = await Promise.all(productPromises);
        const productsData = productSnaps
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!wishlistLoading) {
      fetchWishlistProducts();
    }
  }, [wishlist, wishlistLoading]);

  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-2 font-display uppercase">Saved Hardware</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Components flagged for future acquisition.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square bg-gray-50 rounded-xl border border-gray-100"></div>
                <div className="h-4 bg-gray-50 rounded w-3/4"></div>
                <div className="h-4 bg-gray-50 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Heart size={64} className="text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2 font-display uppercase tracking-tight">Database Empty</h2>
            <p className="text-gray-500 mb-8 font-mono text-xs uppercase tracking-widest">No hardware signatures saved to local node.</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all font-mono shadow-lg"
            >
              <ShoppingBag size={16} />
              <span>Initialize Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
