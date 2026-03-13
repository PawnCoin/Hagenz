'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tighter mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, shipping address, and wallet address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We use the information we collect to process your orders, communicate with you about your account, and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">3. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement reasonable security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">4. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed">
              We may use third-party services to process payments and ship orders. These services have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">5. Your Choices</h2>
            <p className="text-gray-600 leading-relaxed">
              You can update your account information at any time by logging into your profile.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
