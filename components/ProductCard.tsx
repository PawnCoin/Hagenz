'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCompare } from '@/lib/compare-context';
import { motion } from 'motion/react';
import { Plus, Heart, Coins, Eye, BarChart2 } from 'lucide-react';
import QuickView from './QuickView';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
    category: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);
  const isWishlisted = isInWishlist(product.id);
  const isComparing = isInCompare(product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl bg-stone-100 relative border border-stone-200">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </Link>
        <button
          onClick={() => setIsQuickViewOpen(true)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-stone-900 px-6 py-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-stone-900 hover:text-white flex items-center space-x-2 font-bold text-[11px] uppercase tracking-widest"
        >
          <Eye size={14} />
          <span>Quick View</span>
        </button>
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-sm transition-all duration-300 ${
            isWishlisted ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 opacity-0 group-hover:opacity-100'
          } hover:scale-110 z-10 border border-stone-100`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button
          onClick={() => isComparing ? removeFromCompare(product.id) : addToCompare(product)}
          className={`absolute top-16 right-4 p-2.5 rounded-full shadow-sm transition-all duration-300 ${
            isComparing ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 opacity-0 group-hover:opacity-100'
          } hover:scale-110 z-10 border border-stone-100`}
        >
          <BarChart2 size={16} />
        </button>
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-4 right-4 bg-stone-900 text-white p-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-stone-700 z-10"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => {
            addToCart(product);
            window.location.href = '/checkout';
          }}
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-stone-900 px-4 py-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-stone-900 hover:text-white font-bold text-[10px] uppercase tracking-widest border border-stone-100"
        >
          Buy Now
        </button>
      </div>
      <div className="mt-6 flex justify-between items-start px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2">
            {product.category}
          </p>
          <h3 className="text-sm font-medium text-stone-900 tracking-tight">
            <Link href={`/products/${product.id}`}>
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="text-right">
          {product.discountPrice ? (
            <>
              <p className="text-sm font-bold text-rose-600">${product.discountPrice}</p>
              <p className="text-[10px] text-stone-400 line-through">${product.price}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-stone-900">${product.price}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center space-x-2 opacity-60">
        <div className="flex items-center space-x-1.5 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
          <Coins size={10} className="text-stone-500" />
          <span className="text-[10px] font-bold text-stone-500">{( (product.discountPrice || product.price) / 0.85).toFixed(2)} $Pc</span>
        </div>
      </div>
      <QuickView 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </motion.div>
  );
}
