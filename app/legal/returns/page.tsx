'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tighter mb-8">Returns & Exchanges</h1>
        
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Return Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We have a 30-day return policy, which means you have 30 days after receiving your item to request a return. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Exchanges</h2>
            <p className="text-gray-600 leading-relaxed">
              The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method. For crypto payments, refunds will be issued in the equivalent value of $Pc at the time of the refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Damages and Issues</h2>
            <p className="text-gray-600 leading-relaxed">
              Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
