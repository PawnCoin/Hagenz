'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ['All', 'Gadgets', 'Phones', 'Computers', 'Food', 'Clothing'];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        if (productsData.length === 0) {
          // Mock data with categories and prices
          setProducts([
            { id: '1', name: 'Neural Interface V2', price: 2499, image: 'https://picsum.photos/seed/neural/800/800', category: 'Gadgets', createdAt: new Date('2024-01-01') },
            { id: '2', name: 'Quantum Processor X1', price: 4500, image: 'https://picsum.photos/seed/cpu/800/800', category: 'Computers', createdAt: new Date('2024-01-02') },
            { id: '3', name: 'Holographic Display', price: 1200, image: 'https://picsum.photos/seed/holo/800/800', category: 'Gadgets', createdAt: new Date('2024-01-03') },
            { id: '4', name: 'Cybernetic Link', price: 850, image: 'https://picsum.photos/seed/link/800/800', category: 'Gadgets', createdAt: new Date('2024-01-04') },
            { id: '5', name: 'Pawn Phone Pro', price: 1099, image: 'https://picsum.photos/seed/phone/800/800', category: 'Phones', createdAt: new Date('2024-01-05') },
            { id: '6', name: 'Data Slate 12', price: 799, image: 'https://picsum.photos/seed/tablet/800/800', category: 'Phones', createdAt: new Date('2024-01-06') },
            { id: '7', name: 'Bio-Nutrient Pack', price: 45, image: 'https://picsum.photos/seed/food/800/800', category: 'Food', createdAt: new Date('2024-01-07') },
            { id: '8', name: 'Mainframe Server', price: 8900, image: 'https://picsum.photos/seed/server/800/800', category: 'Computers', createdAt: new Date('2024-01-08') },
          ]);
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy, priceRange]);

  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0">
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-600" />
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 font-display uppercase">Hardware Catalog</h1>
            <p className="mt-2 text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em]">Authorized inventory for the modern pioneer.</p>
          </div>
          
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap font-mono border ${
                  activeCategory === cat 
                    ? 'bg-black text-white border-black shadow-lg' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 py-4 border-y border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-mono">{filteredProducts.length} Units Identified</p>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-mono">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[10px] font-bold bg-transparent border-none focus:ring-0 cursor-pointer font-mono uppercase tracking-widest"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low</option>
                <option value="price-high">Price: High</option>
              </select>
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors font-mono"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Main Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 border border-gray-100"></div>
                    <div className="h-4 bg-gray-50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-50 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 pt-12 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronDown className="rotate-90" size={18} />
                    </button>
                    <div className="flex items-center space-x-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-md text-[10px] font-bold transition-all font-mono ${
                            currentPage === i + 1
                              ? 'bg-black text-white shadow-lg'
                              : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronDown className="-rotate-90" size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">No Signatures Found</h2>
                <p className="text-gray-500 mt-2 font-mono text-[10px] uppercase tracking-widest">Try adjusting your query parameters or category node.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Slide-over */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black tracking-tighter uppercase font-display">Filters</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Categories */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 font-mono">Category Node</h3>
                  <div className="space-y-4">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="category"
                          checked={activeCategory === cat}
                          onChange={() => setActiveCategory(cat)}
                          className="w-4 h-4 border-2 border-gray-200 text-black focus:ring-black rounded-sm"
                        />
                        <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors font-mono ${activeCategory === cat ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-mono">Valuation Range</h3>
                    <span className="text-[11px] font-bold text-black font-mono">${priceRange[0]} — ${priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-bold text-gray-400 font-mono uppercase tracking-widest">
                    <span>$0</span>
                    <span>$500+</span>
                  </div>
                </div>

                {/* Sort (Mobile only) */}
                <div className="md:hidden">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 font-mono">Sort Protocol</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'newest', label: 'Newest Arrivals' },
                      { id: 'price-low', label: 'Price: Low to High' },
                      { id: 'price-high', label: 'Price: High to Low' }
                    ].map((sort) => (
                      <label key={sort.id} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="sort"
                          checked={sortBy === sort.id}
                          onChange={() => setSortBy(sort.id)}
                          className="w-4 h-4 border-2 border-gray-200 text-black focus:ring-black rounded-sm"
                        />
                        <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors font-mono ${sortBy === sort.id ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                          {sort.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setActiveCategory('All');
                    setPriceRange([0, 500]);
                    setSortBy('newest');
                  }}
                  className="w-full py-4 text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-mono"
                >
                  Reset Parameters
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-4 bg-black text-white rounded-md font-bold mt-4 hover:bg-indigo-600 transition-all uppercase tracking-[0.2em] text-[10px] font-mono shadow-lg"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
