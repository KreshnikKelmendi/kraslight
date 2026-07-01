'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/AuthContext';
import { usePendingOrderCount } from '@/app/hooks/usePendingOrderCount';
import { FiList, FiHome, FiLogOut, FiImage, FiClipboard, FiMail, FiBookOpen } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const { count: pendingOrderCount } = usePendingOrderCount();

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
            <FiClipboard className="w-5 h-5 group-hover:text-green-400 transition-colors shrink-0" />
            <span className="font-medium flex-1">Porositë</span>
            {pendingOrderCount > 0 && (
              <span
                className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none shadow-sm"
                aria-label={`${pendingOrderCount} porosi aktive`}
              >
                {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
              </span>
            )}
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

        {/* Udhëzime + Sign Out */}
        <div className="p-6 border-t border-slate-700 space-y-2">
          <Link
            href="/admin/udhezime"
            className="flex items-center space-x-3 px-4 py-3 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 rounded-xl transition-all duration-200 group border border-amber-500/30"
          >
            <FiBookOpen className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <span className="font-semibold">Udhëzime</span>
          </Link>

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