'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tighter mb-8">Shipping Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Processing Times</h2>
            <p className="text-gray-600 leading-relaxed">
              All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Shipping Rates & Estimates</h2>
            <p className="text-gray-600 leading-relaxed">
              Shipping charges for your order will be calculated and displayed at checkout. We offer free standard shipping on all orders over $100.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Shipment Confirmation & Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              You will receive a shipment confirmation email once your order has shipped containing your tracking number(s).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Customs, Duties, and Taxes</h2>
            <p className="text-gray-600 leading-relaxed">
              Hagenz Store is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
