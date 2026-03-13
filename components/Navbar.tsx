'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Heart, Wallet } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useCrypto } from '@/lib/crypto-context';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, login, logout } = useAuth();
  const { walletAddress, connectWallet, isConnecting } = useCrypto();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-light tracking-tight text-stone-900 font-display italic">
              Hagenz <span className="font-normal not-italic">Market.</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/shop" className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">
              Catalog
            </Link>
            <Link href="/category/food" className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">
              Pantry
            </Link>
            <Link href="/category/home" className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">
              Home
            </Link>
            <Link href="/category/hardware" className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">
              Hardware
            </Link>
            <Link href="/category/clothing" className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">
              Clothing
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-500 hover:text-black transition-colors"
            >
              <Search size={18} />
            </button>

            <Link href="/wishlist" className="p-2 text-gray-500 hover:text-black transition-colors">
              <Heart size={18} />
            </Link>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`hidden lg:flex items-center space-x-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                walletAddress 
                  ? 'bg-stone-900 text-white shadow-lg' 
                  : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
              }`}
            >
              <Wallet size={14} />
              <span>{walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}</span>
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => logout()}
                  className="text-[11px] font-bold text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
                >
                  Sign Out
                </button>
                <Link href="/profile" className="p-2 text-stone-500 hover:text-stone-900 transition-colors">
                  <User size={18} />
                </Link>
              </div>
            ) : (
              <button 
                onClick={() => login()}
                className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <User size={18} />
              </button>
            )}

            <Link href="/cart" className="p-2 text-stone-500 hover:text-stone-900 transition-colors relative">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-stone-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button 
              className="md:hidden p-2 text-gray-500 hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-black/5 p-4 z-40 shadow-xl"
          >
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 rounded-full px-8 py-4 focus:ring-1 focus:ring-stone-500 outline-none transition-all text-sm tracking-wide"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search size={18} className="text-gray-400" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link href="/shop" className="block text-sm font-bold uppercase tracking-[0.2em] text-stone-900">Catalog</Link>
              <Link href="/category/food" className="block text-sm font-bold uppercase tracking-[0.2em] text-stone-900">Pantry</Link>
              <Link href="/category/home" className="block text-sm font-bold uppercase tracking-[0.2em] text-stone-900">Home</Link>
              <Link href="/category/hardware" className="block text-sm font-bold uppercase tracking-[0.2em] text-stone-900">Hardware</Link>
              <Link href="/category/clothing" className="block text-sm font-bold uppercase tracking-[0.2em] text-stone-900">Clothing</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
