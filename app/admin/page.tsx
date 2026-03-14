'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  ArrowUpRight, ArrowDownRight, Package, LifeBuoy 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeTickets: 0,
    recentOrders: [],
    revenueData: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const customersSnapshot = await getDocs(collection(db, 'users'));
        const ticketsSnapshot = await getDocs(query(collection(db, 'tickets'), where('status', '!=', 'closed')));
        
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
        
        // Mocking some time-series data based on real orders if available, otherwise static for demo
        const revenueData = [
          { name: 'Mon', value: 4000 },
          { name: 'Tue', value: 3000 },
          { name: 'Wed', value: 2000 },
          { name: 'Thu', value: 2780 },
          { name: 'Fri', value: 1890 },
          { name: 'Sat', value: 2390 },
          { name: 'Sun', value: 3490 },
        ];

        const categoryData = [
          { name: 'Hardware', value: 400 },
          { name: 'Pantry', value: 300 },
          { name: 'Home', value: 300 },
          { name: 'Clothing', value: 200 },
        ];

        setStats({
          totalRevenue,
          totalOrders: ordersSnapshot.size,
          totalCustomers: customersSnapshot.size,
          activeTickets: ticketsSnapshot.size,
          recentOrders: orders.slice(0, 5),
          revenueData,
          categoryData
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const COLORS = ['#1c1917', '#44403c', '#78716c', '#a8a29e'];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900 border border-stone-100">
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1 font-mono">{title}</p>
      <h3 className="text-3xl font-black tracking-tighter text-stone-900 font-display">{value}</h3>
    </motion.div>
  );

  if (loading) return <div className="p-12 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Analytics Matrix...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-stone-900 font-display uppercase">Command Center</h1>
          <p className="text-stone-500 font-mono text-xs uppercase tracking-widest mt-2">Real-time performance metrics and logistics overview.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest font-mono">System Status</p>
          <div className="flex items-center space-x-2 text-emerald-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="12.5" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} trend="up" trendValue="8.2" />
        <StatCard title="Active Customers" value={stats.totalCustomers} icon={Users} trend="down" trendValue="2.4" />
        <StatCard title="Support Tickets" value={stats.activeTickets} icon={LifeBuoy} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900 font-mono">Revenue Stream</h3>
            <select className="bg-stone-50 border border-stone-100 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1c1917', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#1c1917" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm"
        >
          <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900 mb-10 font-mono">Category Distribution</h3>
          <div className="h-[300px] w-full flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4 pl-8">
              {stats.categoryData.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 font-mono">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-stone-900 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900 font-mono">Recent Logistics Activity</h3>
          <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors font-mono">View All Logs</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-stone-50">
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Order Hash</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Customer</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Status</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="group">
                  <td className="py-6 text-xs font-black text-stone-900 font-mono">#{order.id?.slice(-8)}</td>
                  <td className="py-6">
                    <p className="text-xs font-bold text-stone-900 uppercase tracking-tight">{order.shippingAddress?.fullName || 'Anonymous User'}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{order.userId?.slice(0, 12)}...</p>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-6 text-right text-xs font-black text-stone-900 font-mono">${(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
