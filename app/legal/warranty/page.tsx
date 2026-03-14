'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function WarrantyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fdfcf8]">
      <Navbar />
      
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-6xl font-black tracking-tighter text-stone-900 font-display uppercase mb-6 italic">Warranty <span className="not-italic">Protocol</span></h1>
            <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Version 2.4.0 • Effective March 2026</p>
          </motion.div>

          <div className="space-y-12">
            <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 font-display uppercase tracking-tight">Standard Coverage</h2>
              </div>
              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 leading-relaxed mb-6 font-medium">
                  Hagenz Market provides a limited warranty on all hardware and electronic components purchased through our matrix. This coverage ensures that your hardware is free from defects in materials and workmanship under normal use.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-2 font-mono">Hardware Duration</h3>
                    <p className="text-sm text-stone-500">24 Months from date of acquisition.</p>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-2 font-mono">Soft Goods Duration</h3>
                    <p className="text-sm text-stone-500">90 Days from date of acquisition.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
                  <RefreshCw size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 font-display uppercase tracking-tight">The Return Matrix</h2>
              </div>
              <p className="text-stone-600 leading-relaxed mb-8 font-medium">
                If a defect is identified within the warranty period, Hagenz Market will, at its discretion:
              </p>
              <ul className="space-y-4">
                {[
                  "Repair the hardware using new or refurbished components.",
                  "Replace the hardware with a functionally equivalent model.",
                  "Issue a full credit to your digital wallet for future acquisitions."
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-stone-500">
                    <div className="w-1.5 h-1.5 bg-stone-900 rounded-full mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 font-display uppercase tracking-tight">Exclusions</h2>
              </div>
              <p className="text-stone-600 leading-relaxed mb-6 font-medium">
                This warranty protocol does not apply to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Damage caused by unauthorized modification.",
                  "External causes such as accidents or abuse.",
                  "Normal wear and tear of aesthetic surfaces.",
                  "Consumable parts designed to diminish over time."
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-4 bg-stone-50 rounded-xl text-[11px] font-bold text-stone-500 uppercase tracking-tight">
                    <X size={14} className="text-rose-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-16 p-12 bg-stone-900 rounded-[3rem] text-center text-white">
            <h3 className="text-2xl font-bold font-display uppercase tracking-tight mb-4">Need to initialize a claim?</h3>
            <p className="text-stone-400 font-mono text-[10px] uppercase tracking-widest mb-8">Our support agents are standing by to process your request.</p>
            <a href="/support/new" className="inline-block bg-white text-stone-900 px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-100 transition-all">
              Initialize Support Ticket
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
