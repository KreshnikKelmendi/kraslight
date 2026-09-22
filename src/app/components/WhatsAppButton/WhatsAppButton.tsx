'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_URL } from '@/app/lib/contact';

/** Shared look for WhatsApp on every page (bar + floating) */
export const WHATSAPP_BTN_CLASS =
  'flex shrink-0 items-center justify-center bg-[#25D366] text-white transition-colors hover:bg-[#1ebe57] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50';

/** Pages with a fixed bottom “Shfaq filtrat” bar on mobile */
export function hasMobileFilterBar(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith('/collections') ||
    pathname.startsWith('/shop/brand') ||
    pathname.startsWith('/shop/bags') ||
    pathname.startsWith('/shop/eyewear')
  );
}

/** Same WhatsApp control used in mobile bottom bars everywhere */
export function WhatsAppBarButton({
  className = '',
  variant = 'floating',
}: {
  className?: string;
  variant?: 'floating' | 'bar';
}) {
  const sizeClass =
    variant === 'bar'
      ? 'h-auto min-h-[48px] w-12 rounded-none shadow-none'
      : 'h-11 w-11 rounded-full shadow-[0_6px_18px_-4px_rgba(37,211,102,0.5)] lg:h-12 lg:w-12';

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Na kontaktoni në WhatsApp"
      className={`${WHATSAPP_BTN_CLASS} ${sizeClass} ${className}`}
    >
      <FaWhatsapp className="h-5 w-5" />
    </a>
  );
}

const WhatsAppButton: React.FC = () => {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const onFilterPage = hasMobileFilterBar(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter pages: WhatsApp lives in the bottom bar on mobile; floating only on desktop
  if (onFilterPage) {
    return (
      <div
        className={`fixed bottom-6 right-6 z-30 hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
          show
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <FloatingWhatsAppLink />
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-5 right-3 z-30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:bottom-6 lg:right-6 ${
        show
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <FloatingWhatsAppLink />
    </div>
  );
};

function FloatingWhatsAppLink() {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute bottom-full right-0 mb-3 hidden w-56 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block">
        <div className="rounded-xl bg-neutral-900 px-3.5 py-2.5 text-xs leading-relaxed text-white shadow-xl">
          <p className="font-medium">Përshëndetje!</p>
          <p className="mt-1 text-neutral-300">Na shkruani në WhatsApp për çdo pyetje.</p>
          <div className="absolute top-full right-5 h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900" />
        </div>
      </div>
      <WhatsAppBarButton />
    </div>
  );
}

export default WhatsAppButton;
