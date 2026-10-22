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
import { usePathname, useRouter } from 'next/navigation';

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

function SidebarNav({
  onClose,
  showCloseButton,
}: {
  onClose?: () => void;
  showCloseButton?: boolean;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { count: pendingOrderCount } = usePendingOrderCount();

  const handleSignOut = () => {
    logout();
    onClose?.();
    router.push('/');
  };

  const handleNav = () => {
    onClose?.();
  };

  const linkClass = (href: string, exact = false) => {
    const active = exact
      ? pathname === href
      : pathname === href || pathname?.startsWith(`${href}/`);
    return `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group min-h-11 ${
      active
        ? 'bg-white/15 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;
  };

  return (
    <div className="flex h-full min-h-full w-64 flex-col bg-gradient-to-t from-[#0a9945] to-gray-800 shadow-2xl">
      <div className="border-b border-white/20 p-4">
        <div className="flex items-center justify-between gap-2 lg:justify-center">
          <div className="flex flex-1 flex-col items-center">
            <Image
              src="/assets/logo/kraslight-logo.png"
              alt="Kraslight Logo"
              width={120}
              height={40}
              className="h-14 w-auto lg:h-16"
            />
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

      <nav className="flex-1 space-y-1 overflow-y-auto p-4 sm:p-6">
        <Link href="/" onClick={handleNav} className={linkClass('/', true)}>
          <FiHome className="h-5 w-5 shrink-0 group-hover:text-blue-400" />
          <span className="font-medium">Go to Website</span>
        </Link>

        <Link href="/admin/orders" onClick={handleNav} className={linkClass('/admin/orders')}>
          <FiClipboard className="h-5 w-5 shrink-0 group-hover:text-green-400" />
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

        <Link
          href="/admin/products/list"
          onClick={handleNav}
          className={linkClass('/admin/products/list')}
        >
          <FiList className="h-5 w-5 shrink-0 group-hover:text-orange-400" />
          <span className="font-medium">Lista e Produkteve</span>
        </Link>

        <Link href="/admin/slider" onClick={handleNav} className={linkClass('/admin/slider')}>
          <FiImage className="h-5 w-5 shrink-0 group-hover:text-pink-400" />
          <span className="font-medium">Menaxho Slider</span>
        </Link>

        <Link
          href="/admin/products/collections"
          onClick={handleNav}
          className={linkClass('/admin/products/collections')}
        >
          <FiList className="h-5 w-5 shrink-0 group-hover:text-indigo-400" />
          <span className="font-medium">Menaxho Koleksionet</span>
        </Link>

        <Link
          href="/admin/subscribers"
          onClick={handleNav}
          className={linkClass('/admin/subscribers')}
        >
          <FiMail className="h-5 w-5 shrink-0 group-hover:text-cyan-400" />
          <span className="font-medium">Abonuesit</span>
        </Link>
      </nav>

      <div className="space-y-2 border-t border-slate-700 p-4 sm:p-6">
        <Link
          href="/admin/udhezime"
          onClick={handleNav}
          className="group flex min-h-11 items-center space-x-3 rounded-xl border border-amber-500/30 bg-amber-500/20 px-4 py-3 text-amber-300 transition-all duration-200 hover:bg-amber-500/30 hover:text-amber-200"
        >
          <FiBookOpen className="h-5 w-5 text-amber-400 group-hover:text-amber-300" />
          <span className="font-semibold">Udhëzime</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-700 hover:text-red-400"
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
      <aside className="fixed left-0 top-0 z-40 hidden h-full overflow-y-auto lg:block">
        <SidebarNav />
      </aside>

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
          <SidebarNav onClose={onClose} showCloseButton />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
