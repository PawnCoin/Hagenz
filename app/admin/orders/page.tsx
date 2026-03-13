'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { 
  Search, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600';
      case 'shipped': return 'bg-blue-50 text-blue-600';
      case 'processing': return 'bg-orange-50 text-orange-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingAddress?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-gray-500">Track and manage customer orders.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.createdAt instanceof Timestamp ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    ${order.total?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-black transition-all shadow-sm border border-transparent hover:border-gray-100"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-2xl font-bold tracking-tighter">Order Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Order #{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Status Update */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Update Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['pending', 'processing', 'shipped', 'delivered'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                          selectedOrder.status === status 
                            ? 'bg-black border-black text-white' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                            <Package size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                    <p className="text-2xl font-bold">${selectedOrder.total?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Shipping Information</h3>
                  <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="text-sm font-bold">{selectedOrder.shippingAddress?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sm font-medium text-gray-600 leading-relaxed">
                        {selectedOrder.shippingAddress?.address}<br />
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zipCode}<br />
                        {selectedOrder.shippingAddress?.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-4 bg-black text-white rounded-full font-bold hover:opacity-90 transition-opacity"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
