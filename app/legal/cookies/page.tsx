'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { Cookie, Eye, Lock, Settings } from 'lucide-react';

export default function CookiePolicyPage() {
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
            <h1 className="text-6xl font-black tracking-tighter text-stone-900 font-display uppercase mb-6 italic">Cookie <span className="not-italic">Manifest</span></h1>
            <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Version 1.1.0 • Effective March 2026</p>
          </motion.div>

          <div className="space-y-12">
            <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
                  <Cookie size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 font-display uppercase tracking-tight">What are Cookies?</h2>
              </div>
              <p className="text-stone-600 leading-relaxed font-medium">
                Cookies are small data fragments stored on your device to enhance your interaction with the Hagenz Market matrix. They allow us to remember your preferences, secure your session, and optimize the delivery of our services.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-display uppercase tracking-tight">Essential</h3>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed mb-6">
                  Required for the matrix to function. These handle authentication, security, and cart persistence.
                </p>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest font-mono">Always Active</span>
              </section>

              <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Eye size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-display uppercase tracking-tight">Analytics</h3>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed mb-6">
                  Help us understand how users navigate the store so we can improve the logistics flow.
                </p>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest font-mono">Optional</span>
              </section>
            </div>

            <section className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
                  <Settings size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 font-display uppercase tracking-tight">Managing Preferences</h2>
              </div>
              <p className="text-stone-600 leading-relaxed mb-6 font-medium">
                You have full control over your data footprint. You can modify your browser settings to decline cookies, although this may degrade your experience within the Hagenz Market matrix.
              </p>
              <div className="space-y-4">
                {[
                  "Browser Settings: Adjust privacy levels in your preferred navigator.",
                  "Opt-Out Tools: Use third-party tools to block tracking scripts.",
                  "Account Settings: Manage data preferences within your profile."
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm text-stone-500">
                    <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
