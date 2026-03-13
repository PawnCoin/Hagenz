'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: '0',
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const q = query(collection(db, 'coupons'), orderBy('code', 'asc'));
      const querySnapshot = await getDocs(q);
      setCoupons(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleOpenModal = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        minPurchase: coupon.minPurchase?.toString() || '0',
        expiryDate: coupon.expiryDate || '',
        isActive: coupon.isActive ?? true
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minPurchase: '0',
        expiryDate: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase),
        updatedAt: serverTimestamp()
      };

      if (editingCoupon) {
        await updateDoc(doc(db, 'coupons', editingCoupon.id), couponData);
      } else {
        await addDoc(collection(db, 'coupons'), {
          ...couponData,
          createdAt: serverTimestamp()
        });
      }
      
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-500">Manage promotional codes and store-wide discounts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Code</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Discount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Min. Purchase</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-black rounded-lg text-white">
                        <Tag size={16} />
                      </div>
                      <span className="font-bold text-gray-900">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">
                      {coupon.type === 'percentage' ? `${coupon.value}% Off` : `$${coupon.value} Off`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    ${coupon.minPurchase || 0}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.isActive ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        <XCircle size={12} />
                        <span>Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(coupon)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-black transition-all shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-all shadow-sm border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white z-[70] rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tighter">
                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Coupon Code</label>
                    <input 
                      required
                      type="text" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black font-mono"
                      placeholder="e.g. SAVE20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Value</label>
                      <input 
                        required
                        type="number" 
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Min. Purchase</label>
                      <input 
                        type="number" 
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Expiry Date</label>
                      <input 
                        type="date" 
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <input 
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Coupon is active</label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] py-4 bg-black text-white rounded-full font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <span>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
