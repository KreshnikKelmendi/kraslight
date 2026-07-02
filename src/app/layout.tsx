import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './components/ClientProviders';
import SiteShell from './components/SiteShell';
import { Metadata } from 'next';
import { getStorefrontShellData } from './lib/storefront-data';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kraslight - Produkte Elektrike & Zgjidhje Ndriqimi',
  description: 'Zbuloni produkte elektrike me cilësi të lartë, zgjidhje ndriqimi dhe materiale elektrike në Kraslight',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const storefrontData = await getStorefrontShellData();

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientProviders>
          <SiteShell storefrontData={storefrontData}>{children}</SiteShell>
        </ClientProviders>
      </body>
    </html>
  );
}