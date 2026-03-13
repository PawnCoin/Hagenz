'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Tag,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // Hardcoded admin check as per firestore.rules
        const isDefaultAdmin = user.email === 'LusterEnt@gmail.com';
        
        if (userData?.role === 'admin' || isDefaultAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/');
        }
      } else {
        setIsAdmin(false);
        router.push('/profile'); // Redirect to login
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } lg:static`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className={`font-bold text-xl tracking-tighter ${!isSidebarOpen && 'hidden lg:block'}`}>
              LUSTER<span className="text-gray-400">ADMIN</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-black text-white' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'} />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={() => auth.signOut()}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut size={20} className="text-gray-400 group-hover:text-red-600" />
              {isSidebarOpen && (
                <span className="font-medium text-sm">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg hidden lg:block"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{auth.currentUser?.displayName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{auth.currentUser?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              {auth.currentUser?.displayName?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
