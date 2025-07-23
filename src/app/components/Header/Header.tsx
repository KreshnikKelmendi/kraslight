// src/app/components/layout/Header/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
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


// Add Collection type for dynamic collections dropdown
interface Collection {
  _id: string;
  name: string;
  description?: string;
  image: string;
}

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrendetMegaMenuOpen, setIsBrendetMegaMenuOpen] = useState(false);
  const [isDesktopBrandsOpen, setIsDesktopBrandsOpen] = useState(false);
  const [isProduktetNdricimitOpen, setIsProduktetNdricimitOpen] = useState(false);
  const [isMobileProduktetNdricimitOpen, setIsMobileProduktetNdricimitOpen] = useState(false);
  // Update brands state to array of objects
  const [brands, setBrands] = useState<{ name: string; logo: string }[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const cartCount = useSelector((state: RootState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const [globalDiscount, setGlobalDiscount] = useState<{ isGlobalDiscount: boolean; discountPercentage?: number }>({ isGlobalDiscount: false });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        if (!response.ok) throw new Error('Failed to fetch collections');
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoadingCollections(false);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    const fetchGlobalDiscount = async () => {
      try {
        const response = await fetch('/api/products/bulk-discount');
        if (!response.ok) throw new Error('Failed to fetch global discount');
        const data = await response.json();
        setGlobalDiscount(data);
      } catch (error) {
        setGlobalDiscount({ isGlobalDiscount: false });
      }
    };
    fetchGlobalDiscount();
  }, []);

  useEffect(() => {
    const handleOpenCart = () => setShowCart(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setShowUserDropdown(!showUserDropdown);
    } else {
      router.push('/signin');
    }
  };

  // Function to generate brand URL
  const getBrandUrl = (brand: { name: string; logo: string }) => {
    return `/shop/brand/${encodeURIComponent(brand.name.toLowerCase())}`;
  };

  // Handler to close all dropdowns and mobile menu (mobile)
  const closeAllMobileDropdowns = () => {
    setIsBrendetMegaMenuOpen(false);
    setIsMobileProduktetNdricimitOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Removed unused nextSlide and prevSlide

  return (
    <header className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 font-bwseidoround ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      {/* Global Discount Ribbon */}
      {globalDiscount.isGlobalDiscount && globalDiscount.discountPercentage && (
        <GlobalDiscountRibbon discountPercentage={globalDiscount.discountPercentage} />
      )}
      {/* Top info bar */}
      <div
        className={`header-topbar-transition overflow-hidden ${isScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-[60px] opacity-100 mb-0 lg:mb-2'}`}
        style={{ transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s, margin 0.4s' }}
      >
        <div className="bg-gradient-to-r from-[#0a9945] to-gray-800 text-white py-3 px-4 lg:px-10">
          <div className="flex items-center justify-between text-[12px] lg:text-sm">
            {/* Store Address */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 font-medium">Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë</span>
            </div>
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <FiInstagram size={16} />
              </a>
              <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <FiFacebook size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header content */}
      <div className={`bg-white border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'py-0' : 'py-0 lg:py-0'}`}>
        <div className="mx-auto px-2 lg:px-10">
            <div className="flex items-center justify-between h-20 lg:h-28">
              {/* Mobile: Hamburger menu on left */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
                  aria-label="Open menu"
                >
                  {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>

              {/* Desktop: Logo on left */}
              <Link href="/" className="hidden lg:block flex-shrink-0">
                <Image
                  src="/assets/logo/kraslight-logo.png"
                  alt="Kraslight Logo"
                  width={160}
                  height={56}
                  priority
                  className="h-auto"
                />
              </Link>

              {/* Mobile: Centered logo */}
              <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src="/assets/logo/kraslight-logo.png"
                    alt="Kraslight Logo"
                    width={120}
                    height={42}
                    priority
                    className="h-auto"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6 2xl:space-x-8 uppercase">
                <Link 
                  href="/" 
                  className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 relative group"
                  onClick={scrollToTop}
                >
                  Ballina
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                </Link>

                {/* Brands dropdown */}
                <div className="relative group">
                  <button 
                    className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 flex items-center space-x-1 relative"
                    onMouseEnter={() => setIsDesktopBrandsOpen(true)}
                  >
                    <span>BRENDET</span>
                    <FiChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                  </button>
                  {/* Redesigned Brands Mega Menu for Desktop - Simple List Style */}
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-[340px] bg-white border border-gray-200 rounded-xl shadow-xl
                               transition-all duration-300 ease-in-out origin-top
                               ${isDesktopBrandsOpen 
                                 ? 'opacity-100 visible scale-100 translate-y-0' 
                                 : 'opacity-0 invisible scale-95 -translate-y-2'
                               }`}
                    onMouseEnter={() => setIsDesktopBrandsOpen(true)}
                    onMouseLeave={() => setIsDesktopBrandsOpen(false)}
                  >
                    <div className="py-2">
                      {isLoadingBrands ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-2/3 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                          <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ) : brands.length > 0 ? (
                        <div className="grid grid-cols-1 divide-y divide-gray-100">
                          {brands.map((brand, index) => (
                            <Link
                              key={index}
                              href={getBrandUrl(brand)}
                              onClick={() => {
                                scrollToTop();
                                setIsDesktopBrandsOpen(false); // Close desktop brands dropdown
                              }}
                              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                            >
                              <span className="text-gray-800 group-hover:text-[#0a9945] font-medium text-base">{brand.name}</span>
                              <span className="text-gray-400 group-hover:text-[#0a9945] text-lg">→</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-gray-500 text-base font-semibold">Nuk ka brende të disponueshme</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Produktet e Ndricimit dropdown (dynamic collections) */}
                <div className="relative group">
                  <button 
                    className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 flex items-center space-x-1 relative"
                    onMouseEnter={() => setIsProduktetNdricimitOpen(true)}
                  >
                    <span>PRODUKTET E NDRIÇIMIT</span>
                    <FiChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                  </button>
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-[85ch] bg-white border border-gray-200 rounded-xl shadow-xl transition-all duration-300 ease-in-out origin-top z-50
                               ${isProduktetNdricimitOpen 
                                 ? 'opacity-100 visible scale-100 translate-y-0' 
                                 : 'opacity-0 invisible scale-95 -translate-y-2'
                               }`}
                    onMouseEnter={() => setIsProduktetNdricimitOpen(true)}
                    onMouseLeave={() => setIsProduktetNdricimitOpen(false)}
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
                                setIsProduktetNdricimitOpen(false); // Close desktop collections dropdown
                              }}
                              className="group flex flex-row rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-white border border-gray-100"
                            >
                              <div className="w-40 h-40 bg-gray-100 relative flex-shrink-0">
                                <Image src={col.image || '/images/placeholder.jpg'} alt={col.name} fill className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105" />
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



                <Link 
                  href="/collections/materiale-elektrike" 
                  className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 relative group"
                  onClick={scrollToTop}
                >
                  Materiale Elektrike
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/shop/new-arrivals" 
                  className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 relative group"
                  onClick={scrollToTop}
                >
                  <span className="relative">
                    Arritjet e reja
                    <span className="absolute -top-2 -right-9 font-bwseidoround bg-gradient-to-r from-[#0a9945] to-gray-800 text-white text-[8px] px-2 py-1">
                      NEW
                    </span>
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </nav>

              {/* Right side icons */}
              <div className="flex items-center space-x-2">
                {/* Search */}
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

                {/* User account */}
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

                {/* Cart */}
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

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 flex flex-col items-center justify-start lg:hidden z-50">
          <div className="bg-white w-full h-screen flex flex-col shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <Link href="/" className="flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
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
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <Link href="/" className="block text-xl font-bold text-gray-800 py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200" onClick={scrollToTop}>
                  BALLINA
                </Link>
                {/* Brands dropdown in mobile menu */}
                <div>
                  <button
                    onClick={() => setIsBrendetMegaMenuOpen(!isBrendetMegaMenuOpen)}
                    className="w-full text-left py-4 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
                  >
                    BRENDET
                    <FiChevronDown className={`transition-transform duration-200 ${isBrendetMegaMenuOpen ? 'rotate-180' : ''}`} size={20} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isBrendetMegaMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}`}> 
                    <div className="mt-4 space-y-3">
                      {isLoadingBrands ? (
                        <div className="grid grid-cols-1 gap-3">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                          ))}
                        </div>
                      ) : brands.length > 0 ? (
                        <div className="grid grid-cols-1 divide-y divide-gray-100">
                          {brands.map((brand, index) => (
                            <Link
                              key={index}
                              href={getBrandUrl(brand)}
                              onClick={() => {
                                scrollToTop();
                                closeAllMobileDropdowns(); // Close mobile brands dropdown and menu
                              }}
                              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                            >
                              <span className="text-gray-800 group-hover:text-[#0a9945] font-medium text-base">{brand.name}</span>
                              <span className="text-gray-400 group-hover:text-[#0a9945] text-lg">→</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-500 text-base">Nuk ka brende të disponueshme</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Produktet e Ndricimit dropdown in mobile menu (dynamic collections) */}
                <div>
                  <button
                    onClick={() => setIsMobileProduktetNdricimitOpen(!isMobileProduktetNdricimitOpen)}
                    className="w-full text-left py-4 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
                  >
                    PRODUKTET E NDRIÇIMIT
                    <FiChevronDown className={`transition-transform duration-200 ${isMobileProduktetNdricimitOpen ? 'rotate-180' : ''}`} size={20} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isMobileProduktetNdricimitOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}`}> 
                    <div className="mt-3 pb-4">
                      {isLoadingCollections ? (
                        <div className="flex flex-col gap-2 px-4 py-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                              <div className="flex-1 h-4 bg-gray-200 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : collections.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 px-2 py-2">
                          {collections.map((col) => (
                            <Link
                              key={col._id}
                              href={`/collections/${col._id}`}
                              onClick={() => {
                                scrollToTop();
                                closeAllMobileDropdowns(); // Close mobile collections dropdown and menu
                              }}
                              className="group flex flex-row rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white border border-gray-100 mb-2 p-2 items-center"
                            >
                              <div className="w-12 h-12 bg-gray-100 relative flex-shrink-0 mr-3 rounded-lg overflow-hidden">
                                <Image src={col.image || '/images/placeholder.jpg'} alt={col.name} fill className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105" />
                              </div>
                              <div className="flex flex-col justify-center flex-1">
                                <span className="text-gray-900 font-bold text-sm mb-1 text-left w-full">{col.name}</span>
                                  <div className="w-6 h-1 bg-[#0a9945] rounded-full mb-1"></div>
                                <span className="text-xs text-[#0a9945] tracking-wider">Eksploroni koleksionin</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <p className="text-gray-500 text-base font-semibold">Nuk ka koleksione të disponueshme</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Link href="/collections/materiale-elektrike" className="block text-xl font-bold text-gray-800 py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200" onClick={scrollToTop}>
                  MATERIALE ELEKTRIKE
                </Link>
                <Link href="/shop/new-arrivals" className="block text-xl font-bold text-gray-800 py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200" onClick={scrollToTop}>
                  <span className="flex items-center gap-3">
                    ARRITJET E REJA
                    <span className="bg-gradient-to-r from-[#0a9945] to-gray-800 text-white text-xs px-2 py-1 font-bwseidoround">NEW</span>
                  </span>
                </Link>
                {/* Account section */}
                <div className="pt-6 border-t border-gray-200 mt-6">
                  {!isAuthenticated ? (
                    <Link 
                      href="/signin" 
                      className="block py-4 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 transition-colors duration-200"
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
                      className="w-full text-left py-4 px-4 text-xl font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    >
                      SIGN OUT
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart modal */}
      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}

      {/* Search modal */}
    </header>
  );
};

export default Header;