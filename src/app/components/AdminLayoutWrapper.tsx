'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // If it's an admin route, don't render the wrapper children (Header, Footer, etc.)
  if (isAdminRoute) {
    return null;
  }

  // For non-admin routes, render the children normally
  return <>{children}</>;
} 