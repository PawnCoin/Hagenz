'use client';

import React from 'react';
import { useCompare } from '@/lib/compare-context';
import { X, BarChart2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[40] p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="hidden md:block">
              <h3 className="font-black text-xs uppercase tracking-tighter font-display">Analysis Matrix</h3>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{compareItems.length} / 4 Signatures</p>
            </div>
            
            <div className="flex space-x-3">
              {compareItems.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="w-14 h-14 rounded-md bg-gray-50 overflow-hidden border border-gray-100">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button 
                    onClick={() => removeFromCompare(item.id)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {[...Array(4 - compareItems.length)].map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-md border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-200">
                  <BarChart2 size={16} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={clearCompare}
              className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-mono"
            >
              Purge Matrix
            </button>
            <Link 
              href="/compare"
              className="bg-black text-white px-6 py-3 rounded-md font-bold text-[10px] flex items-center space-x-2 hover:bg-indigo-600 transition-all uppercase tracking-[0.2em] font-mono shadow-lg"
            >
              <span>Initialize Analysis</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
