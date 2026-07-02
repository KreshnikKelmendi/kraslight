'use client';

import { useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar/Sidebar';

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

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar />
      <main className="ml-64 flex-1">{children}</main>
    </div>
  );
}
