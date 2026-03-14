'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { useCompare } from '@/lib/compare-context';
import { useCart } from '@/lib/cart-context';
import { X, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  const allSpecLabels = Array.from(new Set(
    compareItems.flatMap(item => 
      (item.specifications as any)?.map((s: any) => s.label) || []
    )
  ));

  const specs = [
    { label: 'Price', key: 'price', format: (v: any) => `$${v}` },
    { label: 'Category', key: 'category' },
    ...allSpecLabels.map(label => ({
      label,
      getValue: (item: any) => {
        const spec = (item.specifications as any)?.find((s: any) => s.label === label);
        return spec ? spec.value : '—';
      }
    }))
  ];

  if (compareItems.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-24">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
            <Plus size={40} className="text-gray-300" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 font-display uppercase">Analysis Matrix Empty</h1>
          <p className="text-gray-500 mb-12 font-mono text-xs uppercase tracking-widest">Add hardware signatures to begin side-by-side comparison.</p>
          <Link 
            href="/shop"
            className="inline-block bg-black text-white px-12 py-4 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all font-mono shadow-lg"
          >
            Access Catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 font-display uppercase">Hardware Analysis</h1>
            <p className="mt-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Side-by-side technical specification comparison.</p>
          </div>
          <button 
            onClick={clearCompare}
            className="text-[10px] font-bold text-gray-400 hover:text-rose-500 transition-colors uppercase tracking-widest font-mono"
          >
            Purge Matrix
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-6 text-left w-64 min-w-[200px] border-b border-gray-100"></th>
                {compareItems.map((item) => (
                  <th key={item.id} className="p-6 min-w-[280px] border-b border-gray-100">
                    <div className="relative group">
                      <button 
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X size={14} />
                      </button>
                      <div className="aspect-square relative bg-gray-50 rounded-xl overflow-hidden mb-6 border border-gray-100">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 mb-4 font-display uppercase tracking-tight">{item.name}</h3>
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-full bg-black text-white py-3 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-indigo-600 transition-all font-mono"
                      >
                        <ShoppingBag size={14} />
                        <span>Initialize Cart</span>
                      </button>
                    </div>
                  </th>
                ))}
                {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                  <th key={i} className="p-6 min-w-[280px] border-b border-gray-100">
                    <Link 
                      href="/shop"
                      className="aspect-square border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300 hover:border-indigo-600 hover:text-indigo-600 transition-all group"
                    >
                      <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Add Hardware</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {specs.map((spec, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">
                    {spec.label}
                  </td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="p-6 text-xs text-gray-600 leading-relaxed font-mono uppercase">
                      {(spec as any).getValue 
                        ? (spec as any).getValue(item) 
                        : (spec as any).value || (spec.format ? spec.format(item[spec.key!]) : item[spec.key!])}
                    </td>
                  ))}
                  {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                    <td key={i} className="p-6"></td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">Status</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-6">
                    <div className="flex items-center space-x-2 text-indigo-600">
                      <Check size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">System Ready</span>
                    </div>
                  </td>
                ))}
                {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                  <td key={i} className="p-6"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
