'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'motion/react';
import { Cookie, Shield, Eye, Settings, Info } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-stone-100 px-4 py-2 rounded-full mb-6 border border-stone-200"
            >
              <Cookie size={14} className="text-stone-900" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Privacy First</span>
            </motion.div>
            <h1 className="text-6xl font-light text-stone-900 mb-8 font-display italic leading-tight">Cookie Policy</h1>
            <p className="text-stone-500 text-lg font-medium max-w-2xl mx-auto">
              We use cookies to enhance your shopping experience and provide personalized services. This policy explains how and why we use them.
            </p>
          </div>

          <div className="space-y-12">
            {/* Section 1: What are cookies */}
            <section className="bg-white rounded-[3rem] p-12 shadow-sm border border-stone-100">
              <div className="flex items-start space-x-8">
                <div className="w-16 h-16 bg-stone-100 text-stone-900 rounded-3xl flex items-center justify-center flex-shrink-0">
                  <Info size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 font-display uppercase tracking-tight">What are Cookies?</h2>
                  <p className="text-stone-500 leading-relaxed">
                    Cookies are small text files that are stored on your device when you visit a website. They help the website recognize your device and remember information about your visit, like your preferred language and other settings.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Types of cookies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm">
                <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center mb-6">
                  <Shield size={20} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">Essential Cookies</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6">
                  These are necessary for the website to function properly. They enable basic features like page navigation and access to secure areas of the website.
                </p>
                <div className="bg-stone-50 px-4 py-2 rounded-full inline-block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Always Active</div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm">
                <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-2xl flex items-center justify-center mb-6">
                  <Eye size={20} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-4 font-display uppercase tracking-tight">Performance Cookies</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6">
                  These help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="bg-stone-50 px-4 py-2 rounded-full inline-block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Optional</div>
              </div>
            </div>

            {/* Section 3: Managing Cookies */}
            <section className="bg-stone-900 text-white rounded-[3rem] p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl">
                  <div className="flex items-center space-x-3 mb-6 text-stone-400">
                    <Settings size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Your Preferences</h3>
                  </div>
                  <h2 className="text-3xl font-bold font-display uppercase tracking-tight mb-6">Manage Your Cookie Settings</h2>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    You can change your cookie preferences at any time. Most web browsers also allow you to control cookies through their settings.
                  </p>
                </div>
                <button className="bg-white text-stone-900 px-10 py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-100 transition-all shadow-xl flex-shrink-0">
                  Cookie Settings
                </button>
              </div>
            </section>

            {/* Section 4: Updates */}
            <section className="text-center py-12 border-t border-stone-100">
              <p className="text-stone-400 text-xs font-medium italic">
                Last updated: March 14, 2026. We may update this policy from time to time to reflect changes in our practices.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
