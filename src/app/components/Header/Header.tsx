// src/app/components/layout/Header/Header.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiChevronDown, FiInstagram, FiFacebook, FiArrowRight } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { getCartUnitCount } from '../../../lib/cartSlice';
import Cart from '../../../components/Cart';
import Searchbar from '../Search/Searchbar';
import GlobalDiscountRibbon from './GlobalDiscountRibbon';
import { IMAGE_PLACEHOLDER, optimizeImageUrl } from '@/app/lib/images';
import { fetchCachedJson } from '@/app/lib/client-fetch-cache';

interface Collection {
  _id: string;
  name: string;
  description?: string;
  image: string;
}

const MOBILE_MENU_TRANSITION_MS = 420;
const MOBILE_MENU_STAGGER_MS = 75;
const MOBILE_MENU_ITEM_DURATION_MS = 500;

function MobileMenuReveal({
  children,
  orderFromBottom,
  isOpen,
}: {
  children: React.ReactNode;
  orderFromBottom: number;
  isOpen: boolean;
}) {
  return (
    <div
      className={`transform transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{
        transitionDuration: isOpen ? `${MOBILE_MENU_ITEM_DURATION_MS}ms` : '200ms',
        transitionDelay: isOpen ? `${orderFromBottom * MOBILE_MENU_STAGGER_MS}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [isProduktetNdricimitOpen, setIsProduktetNdricimitOpen] = useState(false);
  const [isMobileProduktetNdricimitOpen, setIsMobileProduktetNdricimitOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = getCartUnitCount(cartItems);
  const [globalDiscount, setGlobalDiscount] = useState<{ isGlobalDiscount: boolean; discountPercentage?: number }>({ isGlobalDiscount: false });
  const [navigatingCollectionId, setNavigatingCollectionId] = useState<string | null>(null);
  const [cartHighlightId, setCartHighlightId] = useState<string | null>(null);
  const dropdownCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openProduktetDropdown = useCallback(() => {
    if (dropdownCloseTimer.current) {
      clearTimeout(dropdownCloseTimer.current);
      dropdownCloseTimer.current = null;
    }
    setIsProduktetNdricimitOpen(true);
  }, []);

  const closeProduktetDropdown = useCallback(() => {
    dropdownCloseTimer.current = setTimeout(() => {
      setIsProduktetNdricimitOpen(false);
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (dropdownCloseTimer.current) clearTimeout(dropdownCloseTimer.current);
    };
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsMobileProduktetNdricimitOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenuMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsMobileMenuOpen(true));
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [closeMobileMenu, isMobileMenuOpen, openMobileMenu]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileMenu();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNavigatingCollectionId(null);
  }, [pathname]);

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const [collectionsData, discountData] = await Promise.all([
          fetchCachedJson<Collection[]>('/api/collections'),
          fetchCachedJson<{ isGlobalDiscount: boolean }>(
            '/api/products/bulk-discount'
          ).catch(() => ({ isGlobalDiscount: false })),
        ]);
        setCollections(collectionsData);
        setGlobalDiscount(discountData);
      } catch {
        console.error('Error fetching header data');
        setGlobalDiscount({ isGlobalDiscount: false });
      } finally {
        setIsLoadingCollections(false);
      }
    };
    loadHeaderData();
  }, []);

  useEffect(() => {
    const handleOpenCart = (event: Event) => {
      const detail = (event as CustomEvent<{ highlightId?: string }>).detail;
      setCartHighlightId(detail?.highlightId ?? null);
      setShowCart(true);
    };
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return;
    }

    if (!mobileMenuMounted) return;

    const timer = window.setTimeout(() => {
      setMobileMenuMounted(false);
      document.body.style.overflow = '';
    }, MOBILE_MENU_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [isMobileMenuOpen, mobileMenuMounted]);

  const closeAllMobileDropdowns = () => {
    closeMobileMenu();
  };

  const mobileMenuVisible = isMobileMenuOpen || mobileMenuMounted;

  const isNavActive = (href: string, exact = true) =>
    exact ? pathname === href : pathname.startsWith(href);

  const desktopNavLinkClass = (href: string, exact = true) => {
    const active = isNavActive(href, exact);
    return `${
      active ? 'text-[#0a9945]' : 'text-gray-800 hover:text-[#0a9945]'
    } font-medium transition-colors duration-200 relative group`;
  };

  const desktopNavUnderlineClass = (href: string, exact = true) => {
    const active = isNavActive(href, exact);
    return `absolute bottom-0 left-0 h-0.5 bg-[#0a9945] transition-all duration-200 ${
      active ? 'w-full' : 'w-0 group-hover:w-full'
    }`;
  };

  const mobileNavLinkClass = (href: string, exact = true) => {
    const active = isNavActive(href, exact);
    return `block rounded-xl px-4 py-4 text-xl font-bold transition-colors duration-200 ${
      active ? 'text-[#0a9945] bg-[#0a9945]/5' : 'text-gray-800 hover:bg-gray-50'
    }`;
  };

  return (
    <>
    <header className={`sticky top-0 left-0 right-0 z-40 overflow-visible transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] font-bwseidoround ${
      isScrolled 
        ? 'bg-white shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      {globalDiscount.isGlobalDiscount && globalDiscount.discountPercentage && (
        <GlobalDiscountRibbon discountPercentage={globalDiscount.discountPercentage} />
      )}
      <div
        className={`header-topbar-transition overflow-hidden ${isScrolled ? 'max-h-0 opacity-0 mb-0 pointer-events-none' : 'max-h-[60px] opacity-100 mb-0 lg:mb-2'}`}
        style={{ transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s, margin 0.4s' }}
      >
        <div className="bg-gradient-to-r from-[#0a9945] to-gray-800 text-white py-3 px-4 lg:px-10 2xl:px-24">
          <div className="flex items-center justify-between text-[12px] lg:text-sm">
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 font-medium">Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë</span>
            </div>
            <div className="flex items-center space-x-4 lg:space-x-5">
              <a href="https://www.instagram.com/kraslight.ks/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <FiInstagram size={16} />
                <span className="hidden lg:inline font-medium">Instagram</span>
              </a>
              <a href="https://www.facebook.com/kraslight" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <FiFacebook size={16} />
                <span className="hidden lg:inline font-medium">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 overflow-visible transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] py-0">
        <div className="mx-auto px-2 lg:px-10 2xl:px-24">
            <div
              className={`flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isScrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-28'
              }`}
            >
              <div className="lg:hidden relative z-20">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
                  aria-label={mobileMenuVisible ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMobileMenuOpen}
                >
                  {mobileMenuVisible ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>

              <Link href="/" className="hidden lg:block flex-shrink-0">
                <Image
                  src="/assets/logo/kraslight-logo.png"
                  alt="Kraslight Logo"
                  width={160}
                  height={56}
                  priority
                  className={`h-auto object-contain transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isScrolled ? 'w-[148px]' : 'w-[160px]'
                  }`}
                />
              </Link>

              <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
                <Link href="/" className="flex-shrink-0 pointer-events-auto">
                  <Image
                    src="/assets/logo/kraslight-logo.png"
                    alt="Kraslight Logo"
                    width={120}
                    height={42}
                    priority
                    className={`h-auto object-contain transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isScrolled ? 'w-[112px]' : 'w-[120px]'
                    }`}
                  />
                </Link>
              </div>

              <nav className="hidden lg:flex items-center space-x-6 2xl:space-x-8 uppercase">
                <Link 
                  href="/" 
                  className={desktopNavLinkClass('/')}
                  onClick={scrollToTop}
                >
                  Ballina
                  <span className={desktopNavUnderlineClass('/')} />
                </Link>

                <div
                  className="relative dropdown-container hidden lg:block"
                  onMouseEnter={openProduktetDropdown}
                  onMouseLeave={closeProduktetDropdown}
                >
                  <button
                    type="button"
                    className={`${
                      isNavActive('/collections', false)
                        ? 'text-[#0a9945]'
                        : 'text-gray-800 hover:text-[#0a9945]'
                    } font-medium transition-colors duration-300 flex items-center space-x-1.5 relative py-1`}
                    aria-expanded={isProduktetNdricimitOpen}
                  >
                    <span>PRODUKTET E NDRIÇIMIT</span>
                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isProduktetNdricimitOpen || isNavActive('/collections', false)
                          ? 'rotate-180 text-[#0a9945]'
                          : ''
                      }`}
                    />
                    <span
                      className={`absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-[#0a9945] to-gray-700 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isProduktetNdricimitOpen || isNavActive('/collections', false) ? 'w-full' : 'w-0'
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isProduktetNdricimitOpen
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="w-[min(920px,92vw)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_28px_70px_-20px_rgba(0,0,0,0.22)]">
                      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0a9945]/8 via-white to-gray-50 px-8 py-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a9945]">
                          Koleksionet
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-gray-900">Produktet e Ndriçimit</h3>
                      </div>

                      <div className="p-6">
                        {isLoadingCollections ? (
                          <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="flex animate-pulse gap-4 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                                <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-200" />
                                <div className="flex flex-1 flex-col justify-center gap-2">
                                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : collections.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            {collections.map((col, index) => {
                              const isNavigating = navigatingCollectionId === col._id;
                              return (
                              <Link
                                key={col._id}
                                href={`/collections/${col._id}`}
                                onClick={() => {
                                  setNavigatingCollectionId(col._id);
                                  window.scrollTo({ top: 0, behavior: 'auto' });
                                  setIsProduktetNdricimitOpen(false);
                                }}
                                aria-busy={isNavigating}
                                className={`group relative flex overflow-hidden rounded-xl bg-gray-50/80 ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-[#0a9945]/10 hover:via-white hover:to-gray-50 hover:ring-[#0a9945]/50 hover:shadow-[0_16px_40px_-12px_rgba(10,153,69,0.35)] ${
                                  isNavigating ? 'pointer-events-none ring-[#0a9945]/40' : ''
                                }`}
                                style={{
                                  transitionDelay: isProduktetNdricimitOpen ? `${index * 45}ms` : '0ms',
                                }}
                              >
                                <div className="absolute left-0 top-0 h-full w-1 scale-y-0 bg-gradient-to-b from-[#0a9945] to-gray-700 transition-transform duration-300 group-hover:scale-y-100 origin-top" />
                                <div className="relative h-28 w-28 shrink-0 overflow-hidden">
                                  <Image
                                    src={optimizeImageUrl(col.image || IMAGE_PLACEHOLDER, { width: 320, quality: 'auto:good' })}
                                    alt={col.name}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-[#0a9945]/0 transition-colors duration-300 group-hover:bg-[#0a9945]/15" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-70" />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                                  <span className="truncate text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#0a9945]">
                                    {col.name}
                                  </span>
                                  {col.description && (
                                    <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
                                      {col.description}
                                    </span>
                                  )}
                                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a9945]">
                                    Eksploroni koleksionin
                                    <FiArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                  </span>
                                </div>
                                <div
                                  className={`absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px] transition-opacity duration-200 ${
                                    isNavigating ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                  }`}
                                >
                                  <div
                                    className={`h-9 w-9 rounded-full border-2 border-gray-200 border-t-[#0a9945] ${
                                      isNavigating ? 'animate-spin opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                </div>
                              </Link>
                            );})}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10">
                            <p className="text-base font-semibold text-gray-500">Nuk ka koleksione të disponueshme</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/rreth-nesh"
                  className={desktopNavLinkClass('/rreth-nesh')}
                  onClick={scrollToTop}
                >
                  Rreth Nesh
                  <span className={desktopNavUnderlineClass('/rreth-nesh')} />
                </Link>

                <Link
                  href="/kontakti"
                  className={desktopNavLinkClass('/kontakti')}
                  onClick={scrollToTop}
                >
                  Kontakti
                  <span className={desktopNavUnderlineClass('/kontakti')} />
                </Link>
              </nav>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowSearch((prev) => !prev)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer relative"
                >
                  <FiSearch size={20} className="text-gray-600 hover:text-gray-800" />
                </button>
                {showSearch && (
                  <div className="absolute left-0 right-0 top-full z-50 w-full flex justify-center">
                    <Searchbar isOpen={showSearch} onClose={() => setShowSearch(false)} />
                  </div>
                )}

                <div className="relative">
                  <button 
                    onClick={() => {
                      if (!showCart) {
                        setCartHighlightId(null);
                      }
                      setShowCart(!showCart);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    <FiShoppingBag size={20} className="text-gray-600 hover:text-gray-800" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

    </header>

      {mobileMenuMounted && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!isMobileMenuOpen}>
          <button
            type="button"
            aria-label="Close menu"
            className={`absolute inset-0 bg-black/40 transition-opacity duration-[420ms] ease-out ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />
          <div
            className={`absolute inset-y-0 left-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <MobileMenuReveal orderFromBottom={4} isOpen={isMobileMenuOpen}>
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <Link href="/" className="flex-shrink-0" onClick={closeMobileMenu}>
                  <Image
                    src="/assets/logo/kraslight-logo.png"
                    alt="Kraslight Logo"
                    width={120}
                    height={40}
                    priority
                    className="h-auto"
                  />
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>
            </MobileMenuReveal>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="flex min-h-full flex-col space-y-2 p-6">
                <MobileMenuReveal orderFromBottom={5} isOpen={isMobileMenuOpen}>
                  <Link
                    href="/"
                    className={mobileNavLinkClass('/')}
                    onClick={scrollToTop}
                  >
                    BALLINA
                  </Link>
                </MobileMenuReveal>

                <MobileMenuReveal orderFromBottom={4} isOpen={isMobileMenuOpen}>
                  <div>
                    <button
                      onClick={() => setIsMobileProduktetNdricimitOpen(!isMobileProduktetNdricimitOpen)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-4 text-left text-xl font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a9945] ${
                        isNavActive('/collections', false)
                          ? 'text-[#0a9945] bg-[#0a9945]/5'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      PRODUKTET E NDRIÇIMIT
                      <FiChevronDown
                        className={`transition-transform duration-300 ease-out ${
                          isMobileProduktetNdricimitOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                        size={20}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isMobileProduktetNdricimitOpen
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-2 pb-4">
                          {isLoadingCollections ? (
                            <div className="flex flex-col gap-2 px-4 py-4">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex animate-pulse items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-gray-200" />
                                  <div className="h-4 flex-1 rounded bg-gray-200" />
                                </div>
                              ))}
                            </div>
                          ) : collections.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 px-2 py-2">
                              {collections.map((col, index) => (
                                <MobileMenuReveal
                                  key={col._id}
                                  orderFromBottom={collections.length - 1 - index}
                                  isOpen={isMobileMenuOpen && isMobileProduktetNdricimitOpen}
                                >
                                  <Link
                                    href={`/collections/${col._id}`}
                                    onClick={() => {
                                      scrollToTop();
                                      closeAllMobileDropdowns();
                                    }}
                                    className="group mb-2 flex flex-row items-center rounded-xl border border-gray-100 bg-white p-2 shadow transition hover:shadow-lg"
                                  >
                                    <div className="relative mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                      <Image src={optimizeImageUrl(col.image || IMAGE_PLACEHOLDER, { width: 320, quality: 'auto:good' })} alt={col.name} fill className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                      <span className="mb-1 w-full text-left text-sm font-bold text-gray-900">{col.name}</span>
                                      <div className="mb-1 h-1 w-6 rounded-full bg-[#0a9945]" />
                                      <span className="text-xs tracking-wider text-[#0a9945]">Eksploroni koleksionin</span>
                                    </div>
                                  </Link>
                                </MobileMenuReveal>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                              <p className="text-base font-semibold text-gray-500">Nuk ka koleksione të disponueshme</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </MobileMenuReveal>

                <MobileMenuReveal orderFromBottom={3} isOpen={isMobileMenuOpen}>
                  <Link
                    href="/rreth-nesh"
                    className={mobileNavLinkClass('/rreth-nesh')}
                    onClick={scrollToTop}
                  >
                    RRETH NESH
                  </Link>
                </MobileMenuReveal>

                <MobileMenuReveal orderFromBottom={2} isOpen={isMobileMenuOpen}>
                  <Link
                    href="/kontakti"
                    className={mobileNavLinkClass('/kontakti')}
                    onClick={scrollToTop}
                  >
                    KONTAKTI
                  </Link>
                </MobileMenuReveal>

                <div className="mt-auto space-y-4 border-t border-gray-200 pt-6">
                  <MobileMenuReveal orderFromBottom={1} isOpen={isMobileMenuOpen}>
                    <div className="flex items-center gap-4 px-4">
                      <a
                        href="https://www.instagram.com/kraslight.ks/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-gray-600 transition-colors hover:text-[#0a9945]"
                      >
                        <FiInstagram size={22} />
                      </a>
                      <a
                        href="https://www.facebook.com/kraslight"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="text-gray-600 transition-colors hover:text-[#0a9945]"
                      >
                        <FiFacebook size={22} />
                      </a>
                    </div>
                  </MobileMenuReveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <Cart
          highlightItemId={cartHighlightId}
          onClose={() => {
            setShowCart(false);
            setCartHighlightId(null);
          }}
        />
      )}
    </>
  );
};

export default Header;
