'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { Search as SearchIcon } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        }));

        // Mock data if Firestore is empty
        const allProducts: any[] = productsData.length > 0 ? productsData : [
          { id: '1', name: 'Neural Interface V2', price: 2499, image: 'https://picsum.photos/seed/neural/800/800', category: 'Gadgets' },
          { id: '2', name: 'Quantum Processor X1', price: 4500, image: 'https://picsum.photos/seed/cpu/800/800', category: 'Computers' },
          { id: '3', name: 'Holographic Display', price: 1200, image: 'https://picsum.photos/seed/holo/800/800', category: 'Gadgets' },
          { id: '4', name: 'Cybernetic Link', price: 850, image: 'https://picsum.photos/seed/link/800/800', category: 'Gadgets' },
          { id: '5', name: 'Pawn Phone Pro', price: 1099, image: 'https://picsum.photos/seed/phone/800/800', category: 'Phones' },
          { id: '6', name: 'Data Slate 12', price: 799, image: 'https://picsum.photos/seed/tablet/800/800', category: 'Phones' },
          { id: '7', name: 'Bio-Nutrient Pack', price: 45, image: 'https://picsum.photos/seed/food/800/800', category: 'Food' },
          { id: '8', name: 'Mainframe Server', price: 8900, image: 'https://picsum.photos/seed/server/800/800', category: 'Computers' },
        ];

        if (queryParam) {
          const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(queryParam.toLowerCase()) ||
            p.category.toLowerCase().includes(queryParam.toLowerCase())
          );
          setProducts(filtered);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [queryParam]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tighter text-gray-900 font-display uppercase">
          Query Results: &quot;{queryParam}&quot;
        </h1>
        <p className="mt-2 text-gray-500 font-mono text-xs uppercase tracking-widest">
          {products.length} {products.length === 1 ? 'signature' : 'signatures'} identified in database.
        </p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="flex justify-center mb-4">
            <SearchIcon size={48} className="text-gray-200" />
          </div>
          <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">No Signatures Found</h2>
          <p className="text-gray-500 mt-2 font-mono text-xs uppercase tracking-widest">Try a different query or browse the hardware catalog.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 font-mono text-xs uppercase tracking-widest">Scanning Database...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
