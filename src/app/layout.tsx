import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './components/ClientProviders';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import { Suspense } from 'react';
import AdminLayoutWrapper from './components/AdminLayoutWrapper';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kraslight - Produkte Elektrike & Zgjidhje Ndriqimi',
  description: 'Zbuloni produkte elektrike me cilësi të lartë, zgjidhje ndriqimi dhe materiale elektrike në Kraslight',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientProviders>
          <AdminLayoutWrapper>
            <Header />
          </AdminLayoutWrapper>
          <div className="flex flex-1 pt-0">
            <main className="flex-1">
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </main>
          </div>
          <AdminLayoutWrapper>
            <Footer />
            <WhatsAppButton />
          </AdminLayoutWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}