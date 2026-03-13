'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-3xl font-light tracking-tight font-display italic">Hagenz <span className="font-normal not-italic">Market.</span></h3>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              A premium marketplace for high-quality food, essentials, and hardware.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6">Market</h4>
            <ul className="space-y-4">
              <li><Link href="/shop" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/category/food" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Pantry</Link></li>
              <li><Link href="/category/home" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/category/hardware" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Hardware</Link></li>
              <li><Link href="/category/clothing" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Clothing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/legal/shipping" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Shipping</Link></li>
              <li><Link href="/legal/returns" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-stone-500 mt-0.5" />
                <span className="text-sm text-stone-400">123 Market Street, Heritage District, NY 10001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-stone-500" />
                <span className="text-sm text-stone-400">+1 (800) HAGENZ-MKT</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-stone-500" />
                <span className="text-sm text-stone-400">hello@hagenz.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-stone-500 uppercase tracking-widest">
            © {new Date().getFullYear()} HAGENZ MARKET. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-6">
            <Link href="/legal/privacy" className="text-[11px] text-stone-500 hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="/legal/terms" className="text-[11px] text-stone-500 hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
