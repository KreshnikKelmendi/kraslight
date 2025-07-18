// src/app/layout.tsx
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './lib/AuthContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isSignInRoute = pathname === '/signin';
  const showHeader = !isAdminRoute && !isSignInRoute;

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {showHeader && <Header />}
        <div className={`flex flex-1 ${!showHeader ? 'pt-0' : ''}`}>
          {isAdminRoute && <Sidebar />}
          <main className={`flex-1 ${isAdminRoute ? 'ml-64' : ''}`}>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
        </div>
        {showHeader && <Footer />}
        {showHeader && <WhatsAppButton />}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RootLayoutContent>{children}</RootLayoutContent>
      </AuthProvider>
    </Provider>
  );
}