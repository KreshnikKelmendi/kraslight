'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/AuthContext';
import { FiShoppingBag, FiList, FiHome, FiLogOut, FiImage, FiClipboard, FiMail } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { FaGrin } from 'react-icons/fa';

const Sidebar = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="h-full w-64 bg-gradient-to-t from-[#0a9945] to-gray-800 shadow-2xl fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="flex flex-col min-h-full">
        {/* Logo Section */}
        <div className="p-4 border-b border-white">
          <div className="flex items-center justify-center">
            <Image
              src="/assets/logo/kraslight-logo.png"
              alt="Kraslight Logo"
              width={120}
              height={40}
              className="h-16 w-auto"
            />
          </div>
          <p className="text-center text-slate-400 text-sm mt-2 font-light">
            Admin Panel
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiHome className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Go to Website</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiClipboard className="w-5 h-5 group-hover:text-green-400 transition-colors" />
            <span className="font-medium">Porositë</span>
          </Link>

          <Link
            href="/admin/products/add"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiShoppingBag className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
            <span className="font-medium">Shto Produkt</span>
          </Link>
          
          <Link
            href="/admin/products/list"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiList className="w-5 h-5 group-hover:text-orange-400 transition-colors" />
            <span className="font-medium">Lista e Produkteve</span>
          </Link>

          <Link
            href="/admin/slider"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiImage className="w-5 h-5 group-hover:text-pink-400 transition-colors" />
            <span className="font-medium">Menaxho Slider</span>
          </Link>

          <Link
            href="/admin/products/collections"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiList className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
            <span className="font-medium">Menaxho Koleksionet</span>
          </Link>

          <Link
            href="/admin/subscribers"
            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <FiMail className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
            <span className="font-medium">Abonuesit</span>
          </Link>
        </nav>

        {/* Sign Out Button */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="w-full text-sm text-white hover:text-red-400 flex items-center justify-center gap-2 py-3 px-4 rounded-xl hover:bg-slate-700 transition-all duration-200 font-medium"
          >
            <FiLogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 