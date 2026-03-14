'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import SupportTicketForm from '@/components/SupportTicketForm';
import { motion } from 'motion/react';
import { LifeBuoy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link 
            href="/support"
            className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors mb-8 font-mono"
          >
            <ArrowLeft size={14} />
            <span>Back to Support Matrix</span>
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <LifeBuoy size={24} />
            </div>
            <h1 className="text-5xl font-light text-stone-900 font-display italic tracking-tight">Open Support <span className="not-italic font-bold">Ticket</span></h1>
          </div>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Initialize a new technical or order-related inquiry.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SupportTicketForm />
        </motion.div>
      </div>
    </main>
  );
}
