'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Capitalize slug for display
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // In a real app, we'd query by category field
        // For this demo, we'll fetch all and filter client-side to handle mock data
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        }));

        const allProducts: any[] = productsData.length > 0 ? productsData : [
          { id: '1', name: 'Neural Interface V2', price: 2499, image: 'https://picsum.photos/seed/neural/800/800', category: 'Gadgets' },
          { id: '2', name: 'Quantum Processor X1', price: 4500, image: 'https://picsum.photos/seed/cpu/800/800', category: 'Computers' },
          { id: '3', name: 'Pawn Phone Pro', price: 1099, image: 'https://picsum.photos/seed/phone/800/800', category: 'Phones' },
          { id: '4', name: 'Bio-Nutrient Pack', price: 45, image: 'https://picsum.photos/seed/food/800/800', category: 'Food' },
          { id: '5', name: 'Cybernetic Link', price: 850, image: 'https://picsum.photos/seed/link/800/800', category: 'Gadgets' },
          { id: '6', name: 'Data Slate 12', price: 799, image: 'https://picsum.photos/seed/tablet/800/800', category: 'Phones' },
          { id: '7', name: 'Mainframe Server', price: 8900, image: 'https://picsum.photos/seed/server/800/800', category: 'Computers' },
          { id: '8', name: 'Neural Link VR', price: 1200, image: 'https://picsum.photos/seed/vr/800/800', category: 'Gadgets' },
        ];

        const filtered = allProducts.filter(p => 
          p.category.toLowerCase() === slug.toLowerCase()
        );
        setProducts(filtered);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [slug]);

  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-600" />
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 font-display uppercase">{categoryName} Node</h1>
            <p className="mt-2 text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em]">Accessing authorized {slug} hardware signatures.</p>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-50 rounded-xl mb-4 border border-gray-100"></div>
                <div className="h-4 bg-gray-50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-50 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">No Signatures Found</h2>
            <p className="text-gray-500 mt-2 font-mono text-[10px] uppercase tracking-widest">Database entry for {slug} is currently empty.</p>
          </div>
        )}
      </div>
    </main>
  );
}
