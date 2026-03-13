'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';

// Dynamically import Recharts components with SSR disabled
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function fetchDashboardData() {
      try {
        // Fetch stats
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const usersSnap = await getDocs(collection(db, 'users'));

        const totalSales = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().total || 0), 0);

        setStats({
          totalSales,
          totalOrders: ordersSnap.size,
          totalCustomers: usersSnap.size,
          activeProducts: productsSnap.size
        });

        // Fetch recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersSnap = await getDocs(recentOrdersQuery);
        setRecentOrders(recentOrdersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: `$${stats.totalSales.toLocaleString()}`, icon: DollarSign, change: '+12.5%', trend: 'up' },
    { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, change: '+5.2%', trend: 'up' },
    { name: 'Total Customers', value: stats.totalCustomers, icon: Users, change: '+18.1%', trend: 'up' },
    { name: 'Active Products', value: stats.activeProducts, icon: TrendingUp, change: '-2.4%', trend: 'down' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back, here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <stat.icon size={20} className="text-black" />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Revenue Growth</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1 font-medium focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#000" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Recent Orders</h3>
            <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-6">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-100 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Order #{order.id.slice(-4)}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {order.createdAt instanceof Timestamp ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${order.total?.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
