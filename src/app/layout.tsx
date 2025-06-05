// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Make sure this imports your Tailwind CSS
import Header from './components/Header/Header';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Next.js Shop',
  description: 'A professional e-commerce platform built with Next.js and Tailwind CSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-900`}> {/* Added some body classes */}
        <Header /> {/* Render your Header component here */}
        <main className="container mx-auto p-4"> 
          {children} 
        </main>
      </body>
    </html>
  );
}