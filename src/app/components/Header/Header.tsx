// src/app/components/layout/Header/Header.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiChevronDown, FiInstagram, FiFacebook } from 'react-icons/fi';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
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
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [isProduktetNdricimitOpen, setIsProduktetNdricimitOpen] = useState(false);
  const [isMobileProduktetNdricimitOpen, setIsMobileProduktetNdricimitOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const cartCount = useSelector((state: RootState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const [globalDiscount, setGlobalDiscount] = useState<{ isGlobalDiscount: boolean; discountPercentage?: number }>({ isGlobalDiscount: false });

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
    if (isMobileMenuOpen || mobileMenuMounted) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [closeMobileMenu, isMobileMenuOpen, mobileMenuMounted, openMobileMenu]);

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
    const handleOpenCart = () => setShowCart(true);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsProduktetNdricimitOpen(false);
      }
    };

    if (isProduktetNdricimitOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProduktetNdricimitOpen]);

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setShowUserDropdown(!showUserDropdown);
    } else {
      router.push('/signin');
    }
  };

  const closeAllMobileDropdowns = () => {
    closeMobileMenu();
  };

  const mobileMenuVisible = isMobileMenuOpen || mobileMenuMounted;

  return (
    <header className={`sticky top-0 left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] font-bwseidoround ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      {globalDiscount.isGlobalDiscount && globalDiscount.discountPercentage && (
        <GlobalDiscountRibbon discountPercentage={globalDiscount.discountPercentage} />
      )}
      <div
        className={`header-topbar-transition overflow-hidden ${isScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-[60px] opacity-100 mb-0 lg:mb-2'}`}
        style={{ transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s, margin 0.4s' }}
      >
        <div className="bg-gradient-to-r from-[#0a9945] to-gray-800 text-white py-3 px-4 lg:px-10">
          <div className="flex items-center justify-between text-[12px] lg:text-sm">
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 font-medium">Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/kraslight.ks/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <FiInstagram size={16} />
              </a>
              <a href="https://www.facebook.com/kraslight" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <FiFacebook size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] py-0">
        <div className="mx-auto px-2 lg:px-10">
            <div
              className={`flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isScrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-28'
              }`}
            >
              <div className="lg:hidden">
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

              <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
                <Link href="/" className="flex-shrink-0">
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
                  className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 relative group"
                  onClick={scrollToTop}
                >
                  Ballina
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                </Link>

                <div className="relative dropdown-container">
                  <button 
                    className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 flex items-center space-x-1 relative"
                    onClick={() => {
                      setIsProduktetNdricimitOpen(!isProduktetNdricimitOpen);
                    }}
                  >
                    <span>PRODUKTET E NDRIÇIMIT</span>
                    <FiChevronDown size={14} className={`transition-transform duration-200 ${isProduktetNdricimitOpen ? 'rotate-180' : ''}`} />
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gray-800 transition-all duration-200 ${isProduktetNdricimitOpen ? 'w-full' : 'w-0'}`}></span>
                  </button>
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-[85ch] bg-white border border-gray-200 rounded-xl shadow-xl transition-all duration-300 ease-in-out origin-top z-50
                               ${isProduktetNdricimitOpen 
                                 ? 'opacity-100 visible scale-100 translate-y-0' 
                                 : 'opacity-0 invisible scale-95 -translate-y-2'
                               }`}
                  >
                    <div className="py-8">
                      {isLoadingCollections ? (
                        <div className="flex flex-col gap-3 px-8 py-10">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                              <div className="flex-1 h-4 bg-gray-200 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : collections.length > 0 ? (
                        <div className="grid grid-cols-2 gap-8 px-8 py-4">
                          {collections.map((col) => (
                            <Link
                              key={col._id}
                              href={`/collections/${col._id}`}
                              onClick={() => {
                                scrollToTop();
                                setIsProduktetNdricimitOpen(false);
                              }}
                              className="group flex flex-row rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-white border border-gray-100"
                            >
                              <div className="w-40 h-40 bg-gray-100 relative flex-shrink-0">
                                <Image src={optimizeImageUrl(col.image || IMAGE_PLACEHOLDER, { width: 320, quality: 'auto:good' })} alt={col.name} fill className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105" />
                              </div>
                              <div className="flex flex-col justify-center pl-6 pr-4 py-4 flex-1">
                                <span className="text-gray-900 font-bold text-base mb-1 text-left w-full">{col.name}</span>
                                <div className="w-8 h-1 bg-[#0a9945] rounded-full mb-1"></div>
                                <span className="text-xs text-[#0a9945] font-medium tracking-wider">Eksploroni koleksionin</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-gray-500 text-base font-semibold">Nuk ka koleksione të disponueshme</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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

                <div className="relative hidden lg:block">
                  <button 
                    onClick={handleUserIconClick}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    <FiUser size={20} className="text-gray-600 hover:text-gray-800" />
                    {isAuthenticated && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-3 h-3"></span>
                    )}
                  </button>
                  {showUserDropdown && isAuthenticated && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                        <p className="text-xs text-gray-500">{user?.username}</p>
                      </div>
                      <Link href="/admin/products/list" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                        My Products
                      </Link>
                      <Link href="/admin/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                        Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowCart(!showCart)} 
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
                <MobileMenuReveal orderFromBottom={3} isOpen={isMobileMenuOpen}>
                  <Link
                    href="/"
                    className="block rounded-xl px-4 py-4 text-xl font-bold text-gray-800 transition-colors duration-200 hover:bg-gray-50"
                    onClick={scrollToTop}
                  >
                    BALLINA
                  </Link>
                </MobileMenuReveal>

                <MobileMenuReveal orderFromBottom={2} isOpen={isMobileMenuOpen}>
                  <div>
                    <button
                      onClick={() => setIsMobileProduktetNdricimitOpen(!isMobileProduktetNdricimitOpen)}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left text-xl font-bold text-gray-800 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
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

                  <MobileMenuReveal orderFromBottom={0} isOpen={isMobileMenuOpen}>
                    {!isAuthenticated ? (
                      <Link 
                        href="/signin" 
                        className="block rounded-xl px-4 py-4 text-xl font-bold text-gray-800 transition-colors duration-200 hover:bg-gray-50"
                        onClick={scrollToTop}
                      >
                        SIGN IN TO GET REWARDS
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          logout();
                          scrollToTop();
                        }}
                        className="w-full rounded-xl px-4 py-4 text-left text-xl font-bold text-red-600 transition-colors duration-200 hover:bg-red-50"
                      >
                        SIGN OUT
                      </button>
                    )}
                  </MobileMenuReveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}
    </header>
  );
};

export default Header;
