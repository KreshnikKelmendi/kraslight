'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, Suspense, useEffect } from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import WhatsAppButton from './WhatsAppButton/WhatsAppButton';
import { StorefrontDataProvider } from '@/app/lib/StorefrontDataContext';
import type { StorefrontShellData } from '@/app/lib/storefront-data';

export default function SiteShell({
  children,
  storefrontData,
}: {
  children: ReactNode;
  storefrontData: StorefrontShellData;
}) {
  const pathname = usePathname();
  const isStorefrontShell =
    !pathname?.startsWith('/admin') && pathname !== '/signin';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  if (!isStorefrontShell) {
    return <>{children}</>;
  }

  return (
    <StorefrontDataProvider initialData={storefrontData}>
      <Header />
      <div className="flex flex-1 pt-0">
        <main className="flex-1">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </div>
      <Footer />
      <WhatsAppButton />
    </StorefrontDataProvider>
  );
}
