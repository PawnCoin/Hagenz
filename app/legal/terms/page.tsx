'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tighter mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Hagenz Store, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">2. Crypto Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              We accept Pawn Coin ($Pc) as a primary form of payment. All crypto transactions are final once confirmed on the blockchain. We are not responsible for lost funds due to incorrect wallet addresses or network issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">3. Product Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to display our products as accurately as possible. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">4. Shipping & Delivery</h2>
            <p className="text-gray-600 leading-relaxed">
              Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or customs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Hagenz Store shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
