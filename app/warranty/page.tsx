'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function WarrantyPage() {
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
              <ShieldCheck size={14} className="text-stone-900" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Quality Assurance</span>
            </motion.div>
            <h1 className="text-6xl font-light text-stone-900 mb-8 font-display italic leading-tight">Warranty Policy</h1>
            <p className="text-stone-500 text-lg font-medium max-w-2xl mx-auto">
              At Hagenz Market, we stand behind the quality of our products. Our warranty policy is designed to give you peace of mind with every purchase.
            </p>
          </div>

          <div className="space-y-16">
            {/* Section 1: Overview */}
            <section className="bg-white rounded-[3rem] p-12 shadow-sm border border-stone-100">
              <div className="flex items-start space-x-8">
                <div className="w-16 h-16 bg-stone-900 text-white rounded-3xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-6 font-display uppercase tracking-tight">Standard Warranty Coverage</h2>
                  <div className="prose prose-stone max-w-none text-stone-500 leading-relaxed">
                    <p className="mb-4">
                      All products purchased through Hagenz Market are covered by our standard 12-month limited warranty against manufacturing defects in materials and workmanship.
                    </p>
                    <p>
                      This warranty is valid from the date of original purchase and applies only to the original purchaser. It is non-transferable.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: What's Covered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100">
                <div className="flex items-center space-x-3 mb-6 text-emerald-600">
                  <CheckCircle2 size={24} />
                  <h3 className="text-xl font-bold font-display uppercase tracking-tight">What is Covered</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Manufacturing defects in materials',
                    'Workmanship issues under normal use',
                    'Failure of internal components',
                    'Structural integrity issues'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3 text-emerald-800/70 text-sm font-medium">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50 rounded-[2.5rem] p-10 border border-rose-100">
                <div className="flex items-center space-x-3 mb-6 text-rose-600">
                  <AlertCircle size={24} />
                  <h3 className="text-xl font-bold font-display uppercase tracking-tight">What is Not Covered</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Normal wear and tear',
                    'Accidental damage or misuse',
                    'Unauthorized modifications',
                    'Natural disasters or external causes'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3 text-rose-800/70 text-sm font-medium">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 3: Claim Process */}
            <section className="bg-stone-900 text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold font-display uppercase tracking-tight mb-10">How to Make a Claim</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { step: '01', title: 'Submit Request', desc: 'Contact our support team with your order number and photos of the issue.' },
                    { step: '02', title: 'Evaluation', desc: 'Our technical team will review your claim within 3-5 business days.' },
                    { step: '03', title: 'Resolution', desc: 'We will repair, replace, or refund the item based on the evaluation.' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-4">
                      <span className="text-4xl font-light font-display italic text-stone-700">{item.step}</span>
                      <h4 className="text-sm font-bold uppercase tracking-widest">{item.title}</h4>
                      <p className="text-stone-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 4: Extended Warranty */}
            <section className="text-center py-12">
              <div className="inline-flex items-center space-x-3 text-stone-400 mb-6">
                <Clock size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">Extended Protection</span>
              </div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6 font-display uppercase tracking-tight">Need More Coverage?</h2>
              <p className="text-stone-500 max-w-xl mx-auto mb-10">
                We offer extended warranty plans for up to 3 years on select electronics and high-value items. Contact support for more details.
              </p>
              <button className="bg-stone-900 text-white px-12 py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl">
                Contact Support
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
