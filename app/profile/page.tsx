'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';
import { Package, ChevronRight, ShoppingBag, Trophy } from 'lucide-react';
import Link from 'next/link';
import LoyaltyDashboard from '@/components/LoyaltyDashboard';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, updateUserProfile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'addresses' | 'loyalty'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Addresses state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  
  // Settings form state
  const [name, setName] = useState(profile?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ text: '', type: '' });
    try {
      await updateUserProfile({ name });
      setUpdateMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const currentAddresses = profile?.savedAddresses || [];
      let newAddresses;
      
      if (editingAddressId) {
        newAddresses = currentAddresses.map((addr: any) => 
          addr.id === editingAddressId ? { ...addr, ...addressForm } : addr
        );
      } else {
        const newAddress = {
          ...addressForm,
          id: Math.random().toString(36).substr(2, 9)
        };
        newAddresses = [...currentAddresses, newAddress];
      }

      // If this is set as default, unset others
      if (addressForm.isDefault) {
        newAddresses = newAddresses.map((addr: any) => ({
          ...addr,
          isDefault: addr.id === (editingAddressId || newAddresses[newAddresses.length - 1].id)
        }));
      }

      await updateUserProfile({ savedAddresses: newAddresses });
      setIsAddingAddress(false);
      setEditingAddressId(null);
      setAddressForm({ fullName: '', address: '', city: '', zipCode: '', country: '', isDefault: false });
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const newAddresses = (profile?.savedAddresses || []).filter((addr: any) => addr.id !== id);
      await updateUserProfile({ savedAddresses: newAddresses });
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const newAddresses = (profile?.savedAddresses || []).map((addr: any) => ({
        ...addr,
        isDefault: addr.id === id
      }));
      await updateUserProfile({ savedAddresses: newAddresses });
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest">Initialising Terminal...</div>;

  if (!user) {
    return (
      <main className="min-h-screen bg-white pt-24">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 text-center py-24">
          <h1 className="text-3xl font-black mb-4 font-display uppercase tracking-tight">Access Denied</h1>
          <p className="text-gray-500 mb-8 font-mono text-sm">Authentication required to access user node.</p>
          <Link href="/" className="text-black font-bold border-b-2 border-black pb-1 uppercase text-xs tracking-widest font-mono">Back to Home</Link>
        </div>
      </main>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'paid': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black font-display border-2 border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black font-display uppercase tracking-tight">{user.displayName || 'User'}</h2>
                  <p className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-widest">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                  className={`w-full text-left px-4 py-3 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] transition-all font-mono ${activeTab === 'orders' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Acquisition Logs
                </button>
                <button 
                  onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); }}
                  className={`w-full text-left px-4 py-3 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] transition-all font-mono ${activeTab === 'addresses' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Delivery Nodes
                </button>
                <button 
                  onClick={() => { setActiveTab('loyalty'); setSelectedOrder(null); }}
                  className={`w-full text-left px-4 py-3 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] transition-all font-mono ${activeTab === 'loyalty' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Loyalty Rewards
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
                  className={`w-full text-left px-4 py-3 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] transition-all font-mono ${activeTab === 'settings' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Node Settings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              {selectedOrder ? (
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="text-[10px] font-bold text-gray-400 hover:text-black flex items-center uppercase tracking-widest font-mono"
                    >
                      <ChevronRight size={14} className="rotate-180 mr-1" /> Return to Logs
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 font-mono">Hash #{selectedOrder.id.slice(-8)}</span>
                  </div>

                  {/* Tracking Progress */}
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8 font-mono">Logistics Status</h3>
                    <div className="relative flex justify-between">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                          style={{ width: `${((getStatusStep(selectedOrder.status) - 1) / 3) * 100}%` }}
                        />
                      </div>
                      
                      {[
                        { label: 'Verified', step: 1 },
                        { label: 'Processing', step: 2 },
                        { label: 'In Transit', step: 3 },
                        { label: 'Delivered', step: 4 }
                      ].map((s) => (
                        <div key={s.step} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            getStatusStep(selectedOrder.status) >= s.step 
                              ? 'bg-black border-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]' 
                              : 'bg-white border-gray-100 text-gray-300'
                          }`}>
                            {getStatusStep(selectedOrder.status) > s.step ? (
                              <Package size={16} className="text-indigo-400" />
                            ) : (
                              <span className="text-[10px] font-bold font-mono">{s.step}</span>
                            )}
                          </div>
                          <span className={`mt-3 text-[9px] font-bold uppercase tracking-widest font-mono ${
                            getStatusStep(selectedOrder.status) >= s.step ? 'text-black' : 'text-gray-300'
                          }`}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">Hardware Manifest</h3>
                      {selectedOrder.status === 'delivered' && (
                        <Link 
                          href={`/returns/new/${selectedOrder.id}`}
                          className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest font-mono border border-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-50 transition-all"
                        >
                          Request Return
                        </Link>
                      )}
                    </div>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-[10px] font-bold overflow-hidden font-mono border border-gray-100">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">Qty: {item.quantity} × ${item.price}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Network Settlement</span>
                      <div className="text-right">
                        <span className="block text-2xl font-black font-display tracking-tight">${selectedOrder.total.toFixed(2)}</span>
                        {selectedOrder.totalPc && (
                          <span className="block text-xs font-bold text-indigo-600 font-mono">{selectedOrder.totalPc.toFixed(2)} $Pc</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 font-mono">Delivery Node</h3>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold mb-1 uppercase tracking-tight">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-xs text-gray-600 leading-relaxed font-mono uppercase">
                        {selectedOrder.shippingAddress.address}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'loyalty' ? (
                <LoyaltyDashboard />
              ) : activeTab === 'orders' ? (
                <>
                  <h2 className="text-2xl font-black font-display uppercase tracking-tight mb-8">Acquisition Logs</h2>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <ShoppingBag size={48} className="text-gray-100" />
                      </div>
                      <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No acquisition logs found in database.</p>
                      <Link href="/" className="inline-block mt-4 text-black font-bold border-b-2 border-black pb-1 uppercase text-[10px] tracking-widest font-mono">Initialize Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-100 rounded-xl p-6 hover:border-indigo-600 transition-all group">
                          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1 font-mono">Hash #{order.id.slice(-8)}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                                Logged: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span className="inline-flex items-center px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-black text-white font-mono">
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="w-10 h-10 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold overflow-hidden font-mono">
                                  {item.name.charAt(0)}
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-10 h-10 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold font-mono">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black font-display tracking-tight">${order.total.toFixed(2)}</p>
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-600 flex items-center ml-auto mt-1 uppercase tracking-widest font-mono transition-colors"
                              >
                                Access Data <ChevronRight size={12} className="ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'addresses' ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black font-display uppercase tracking-tight">Delivery Nodes</h2>
                    <button 
                      onClick={() => {
                        setIsAddingAddress(true);
                        setEditingAddressId(null);
                        setAddressForm({ fullName: '', address: '', city: '', zipCode: '', country: '', isDefault: false });
                      }}
                      className="bg-black text-white px-6 py-3 rounded-md font-bold text-[10px] uppercase tracking-widest font-mono shadow-lg hover:bg-indigo-600 transition-all"
                    >
                      Add New Node
                    </button>
                  </div>

                  {isAddingAddress || editingAddressId ? (
                    <form onSubmit={handleSaveAddress} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">
                        {editingAddressId ? 'Edit Node Configuration' : 'New Node Configuration'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">Full Name</label>
                          <input 
                            type="text" 
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md focus:border-black outline-none font-mono text-sm"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">Address</label>
                          <input 
                            type="text" 
                            value={addressForm.address}
                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md focus:border-black outline-none font-mono text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">City</label>
                          <input 
                            type="text" 
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md focus:border-black outline-none font-mono text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">Zip Code</label>
                          <input 
                            type="text" 
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md focus:border-black outline-none font-mono text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">Country</label>
                          <input 
                            type="text" 
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-md focus:border-black outline-none font-mono text-sm"
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                          <input 
                            type="checkbox" 
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black"
                          />
                          <label htmlFor="isDefault" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono cursor-pointer">Set as Primary Node</label>
                        </div>
                      </div>
                      <div className="flex space-x-4 pt-4">
                        <button 
                          type="submit"
                          disabled={isUpdating}
                          className="flex-1 bg-black text-white py-4 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all font-mono"
                        >
                          {isUpdating ? 'Synchronising...' : 'Save Configuration'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); }}
                          className="px-8 py-4 border border-gray-200 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all font-mono"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : profile?.savedAddresses?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile.savedAddresses.map((addr: any) => (
                        <div key={addr.id} className={`p-6 rounded-2xl border transition-all ${addr.isDefault ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-tight">{addr.fullName}</p>
                              {addr.isDefault && (
                                <span className="text-[8px] font-bold uppercase tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded-full font-mono mt-1 inline-block">Primary Node</span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingAddressId(addr.id);
                                  setAddressForm({ ...addr });
                                }}
                                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black font-mono"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-[9px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-600 font-mono"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 font-mono uppercase leading-relaxed">
                            {addr.address}<br />
                            {addr.city}, {addr.zipCode}<br />
                            {addr.country}
                          </p>
                          {!addr.isDefault && (
                            <button 
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="mt-4 text-[9px] font-bold uppercase tracking-widest text-indigo-600 hover:underline font-mono"
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">No delivery nodes registered in database.</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black font-display uppercase tracking-tight mb-8">Node Settings</h2>
                  
                  <form onSubmit={handleUpdateProfile} className="max-w-md space-y-6">
                    {updateMessage.text && (
                      <div className={`p-4 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono ${updateMessage.type === 'success' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {updateMessage.text}
                      </div>
                    )}
                    
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">Display Alias</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-md focus:bg-white focus:border-black outline-none transition-all font-mono text-sm"
                        placeholder="Enter alias"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 font-mono">Terminal Email</label>
                      <input 
                        type="email" 
                        value={user.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-md text-gray-400 cursor-not-allowed outline-none font-mono text-sm"
                      />
                      <p className="text-[9px] text-gray-400 mt-2 italic font-mono uppercase tracking-widest">Email is hard-coded to your Google Node.</p>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="w-full bg-black text-white py-4 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all disabled:opacity-50 font-mono shadow-lg"
                    >
                      {isUpdating ? 'Synchronising...' : 'Update Node'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
