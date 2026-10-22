'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '../components/Sidebar/Sidebar';
import { usePendingOrderCount } from '@/app/hooks/usePendingOrderCount';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { count: pendingOrderCount } = usePendingOrderCount();
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar mobileOpen={mobileNavOpen} onClose={closeMobileNav} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-800 hover:bg-neutral-100"
            aria-label="Hap menunë"
            aria-expanded={mobileNavOpen}
          >
            <FiMenu className="h-5 w-5" />
            {pendingOrderCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          <Image
            src="/assets/logo/kraslight-logo.png"
            alt="Kraslight"
            width={100}
            height={32}
            className="h-8 w-auto"
          />
          <span className="ml-auto text-xs font-medium uppercase tracking-wide text-neutral-500">
            Admin
          </span>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      const from = pathname ? `?from=${encodeURIComponent(pathname)}` : '';
      router.replace(`/signin${from}`);
    }
  }, [isAuthenticated, isAuthReady, pathname, router]);

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
