'use client';

import React from 'react';
import { Save, Globe, Bell, Shield, CreditCard } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Configure your store&apos;s global settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
            <Globe size={20} className="text-gray-400" />
            <h2 className="font-bold">General Information</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Store Name</label>
                <input type="text" defaultValue="Luster Essentials" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Support Email</label>
                <input type="email" defaultValue="support@luster.com" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Store Description</label>
              <textarea rows={3} defaultValue="Premium minimalist essentials for your everyday life." className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black resize-none" />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
            <CreditCard size={20} className="text-gray-400" />
            <h2 className="font-bold">Payments & Currency</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Store Currency</label>
                <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tax Rate (%)</label>
                <input type="number" defaultValue="8.5" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
            <Save size={20} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
