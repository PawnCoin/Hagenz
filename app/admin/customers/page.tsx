'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Search, User, Mail, Calendar, MoreVertical } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const q = query(collection(db, 'users'), orderBy('email', 'asc'));
        const querySnapshot = await getDocs(q);
        setCustomers(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-gray-500">View and manage your customer base.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{customer.name || 'No Name'}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      customer.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-xs font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-black transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
