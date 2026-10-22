'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/AuthContext';
import { usePendingOrderCount } from '@/app/hooks/usePendingOrderCount';
import {
  FiList,
  FiHome,
  FiLogOut,
  FiImage,
  FiClipboard,
  FiMail,
  FiBookOpen,
  FiX,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

function SidebarContent({
  onClose,
  showCloseButton = false,
}: {
  onClose?: () => void;
  showCloseButton?: boolean;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const { count: pendingOrderCount } = usePendingOrderCount();

  const handleSignOut = () => {
    logout();
    onClose?.();
    router.push('/');
  };

  const handleNav = () => {
    onClose?.();
  };

  const navLinkClass =
    'flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200 group';

  return (
    <div className="flex min-h-full h-full w-64 flex-col bg-gradient-to-t from-[#0a9945] to-gray-800 shadow-2xl">
      <div className="border-b border-white p-4">
        <div className={`flex items-center ${showCloseButton ? 'justify-between' : 'justify-center'}`}>
          <div className={showCloseButton ? 'flex-1' : ''}>
            <div className="flex items-center justify-center">
              <Image
                src="/assets/logo/kraslight-logo.png"
                alt="Kraslight Logo"
                width={120}
                height={40}
                className="h-16 w-auto"
              />
            </div>
            <p className="mt-2 text-center text-sm font-light text-slate-400">Admin Panel</p>
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Mbyll menunë"
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-6">
        <Link href="/" onClick={handleNav} className={navLinkClass}>
          <FiHome className="h-5 w-5 transition-colors group-hover:text-blue-400" />
          <span className="font-medium">Go to Website</span>
        </Link>

        <Link href="/admin/orders" onClick={handleNav} className={navLinkClass}>
          <FiClipboard className="h-5 w-5 shrink-0 transition-colors group-hover:text-green-400" />
          <span className="flex-1 font-medium">Porositë</span>
          {pendingOrderCount > 0 && (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold leading-none text-white shadow-sm"
              aria-label={`${pendingOrderCount} porosi aktive`}
            >
              {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
            </span>
          )}
        </Link>

        <Link href="/admin/products/list" onClick={handleNav} className={navLinkClass}>
          <FiList className="h-5 w-5 transition-colors group-hover:text-orange-400" />
          <span className="font-medium">Lista e Produkteve</span>
        </Link>

        <Link href="/admin/slider" onClick={handleNav} className={navLinkClass}>
          <FiImage className="h-5 w-5 transition-colors group-hover:text-pink-400" />
          <span className="font-medium">Menaxho Slider</span>
        </Link>

        <Link href="/admin/products/collections" onClick={handleNav} className={navLinkClass}>
          <FiList className="h-5 w-5 transition-colors group-hover:text-indigo-400" />
          <span className="font-medium">Menaxho Koleksionet</span>
        </Link>

        <Link href="/admin/subscribers" onClick={handleNav} className={navLinkClass}>
          <FiMail className="h-5 w-5 transition-colors group-hover:text-cyan-400" />
          <span className="font-medium">Abonuesit</span>
        </Link>
      </nav>

      <div className="space-y-2 border-t border-slate-700 p-6">
        <Link
          href="/admin/udhezime"
          onClick={handleNav}
          className="group flex items-center space-x-3 rounded-xl border border-amber-500/30 bg-amber-500/20 px-4 py-3 text-amber-300 transition-all duration-200 hover:bg-amber-500/30 hover:text-amber-200"
        >
          <FiBookOpen className="h-5 w-5 text-amber-400 transition-colors group-hover:text-amber-300" />
          <span className="font-semibold">Udhëzime</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-700 hover:text-red-400"
        >
          <FiLogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

const Sidebar = ({ mobileOpen = false, onClose }: SidebarProps) => {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Large devices: same fixed sidebar as before */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 overflow-y-auto lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile: drawer only */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Mbyll menunë"
          onClick={onClose}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 max-w-[85vw] overflow-y-auto transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent onClose={onClose} showCloseButton />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
