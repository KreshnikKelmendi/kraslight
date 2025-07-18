// src/app/components/layout/Header/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiChevronDown, FiInstagram, FiFacebook, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import Cart from '../../../components/Cart';
import SearchModal from '../Search/SearchModal';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const cartCount = useSelector((state: RootState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  // Lighting product images for slides
  const ndricimBrendshemImages = [
    '/uploads/products/9b2e217f-8cbc-48e2-abb5-fd2842d3cc1d-lampada-da-terra-con-base-a-3-piedi-in-legno-e-paralume-in-tela-evette.jpg',
    '/uploads/products/1cd4ac9f-39c7-4aba-a71a-7fb05c652b69-lampada-da-terra-con-base-a-3-piedi-in-legno-e-paralume-in-tela-evette.jpg',
    '/uploads/products/58158ae3-26e2-49fb-a0aa-637c00f4d007-ambazhur-toke-55180cm.jpg',
    '/uploads/products/0603d06b-37f6-4612-ad2a-c6407bb419f6-abazhur-25151-cm.jpg',
    '/uploads/products/802548ef-e4b2-436f-80a5-a363087bad14-abazhur-25151-cm.jpg'
  ];

  const ndricimJashtemImages = [
    '/uploads/slider/07719d9c-2a20-4491-9cb2-b1b025bd0092.jpg',
    '/uploads/slider/09c25e9e-d381-4b52-93e2-fe8185ed6c36.jpg',
    '/uploads/slider/5d4c7733-c952-415f-ae72-6722d0182622.png',
    '/uploads/slider/90b75611-430d-470f-904a-c60fb657fbae.jpg',
    '/uploads/slider/663ba52b-2836-43f2-ace2-13a4ef87f4f7.jpg'
  ];

  const [currentBrendshemSlide, setCurrentBrendshemSlide] = useState(0);
  const [currentJashtemSlide, setCurrentJashtemSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const brendshemInterval = setInterval(() => {
      setCurrentBrendshemSlide((prev) => (prev + 1) % ndricimBrendshemImages.length);
    }, 3000);

    const jashtemInterval = setInterval(() => {
      setCurrentJashtemSlide((prev) => (prev + 1) % ndricimJashtemImages.length);
    }, 3000);

    return () => {
      clearInterval(brendshemInterval);
      clearInterval(jashtemInterval);
    };
  }, [ndricimBrendshemImages.length, ndricimJashtemImages.length]);

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

  // Removed unused nextSlide and prevSlide

  return (
    <header className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
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
                              onClick={scrollToTop}
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

                {/* Produktet e Ndricimit dropdown */}
                <div className="relative group">
                  <button 
                    className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 flex items-center space-x-1 relative"
                    onMouseEnter={() => setIsProduktetNdricimitOpen(true)}
                  >
                    <span>PRODUKTET E NDRIÇIMIT</span>
                    <FiChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-200 group-hover:w-full"></span>
                  </button>
                  
                  {/* Mega menu */}
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-[600px] bg-white border border-gray-200 rounded-lg shadow-xl
                               transition-all duration-300 ease-in-out origin-top
                               ${isProduktetNdricimitOpen 
                                 ? 'opacity-100 visible scale-100 translate-y-0' 
                                 : 'opacity-0 invisible scale-95 -translate-y-2'
                               }`}
                    onMouseEnter={() => setIsProduktetNdricimitOpen(true)}
                    onMouseLeave={() => setIsProduktetNdricimitOpen(false)}
                  >
                    <div className="p-4">
                      {/* Header Section */}
                      <div className="text-center mb-4 pb-3 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Produktet e Ndriçimit</h2>
                        <p className="text-gray-600 text-xs">Zbuloni koleksionet tona të ndriçimit</p>
                      </div>
                      
                      {/* Content Blocks */}
                      <div className="space-y-3">
                        {/* Ndriçim i Brendshëm */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 shadow-sm">
                          <div className="flex items-start space-x-3">
                            {/* Image Section */}
                            <div className="relative w-32 h-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                              <Image
                                src={ndricimBrendshemImages[currentBrendshemSlide]}
                                alt="Ndriçim i Brendshëm"
                                fill
                                className="object-cover transition-all duration-500"
                              />
                              {/* Slide indicators */}
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {ndricimBrendshemImages.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                      index === currentBrendshemSlide ? 'bg-white' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-800 mb-1">Ndriçim i Brendshëm</h3>
                              <p className="text-gray-600 text-xs mb-2 leading-tight">
                                Koleksion i ndriçimit të brendshëm me dizajne moderne.
                              </p>
                              <div className="space-y-0.5 mb-2">
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Llambat e tavolinës dhe dyshemesë</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Lustrat dhe ndriçim i tavanit</span>
                                </div>
                              </div>
                              <Link 
                                href="/collections/685ffbb0bf9f854bf7948a02" 
                                onClick={scrollToTop}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded text-xs font-medium hover:from-[#0a9945]/90 hover:to-gray-800/90 transition-all duration-200 shadow-sm"
                              >
                                Shiko Produktet
                                <FiChevronRight size={12} className="ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Ndriçim i Jashtëm */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 shadow-sm">
                          <div className="flex items-start space-x-3">
                            {/* Image Section */}
                            <div className="relative w-32 h-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                              <Image
                                src={ndricimJashtemImages[currentJashtemSlide]}
                                alt="Ndriçim i Jashtëm"
                                fill
                                className="object-cover transition-all duration-500"
                              />
                              {/* Slide indicators */}
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {ndricimJashtemImages.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                      index === currentJashtemSlide ? 'bg-white' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-800 mb-1">Ndriçim i Jashtëm</h3>
                              <p className="text-gray-600 text-xs mb-2 leading-tight">
                                Transformoni hapësirat e jashtme me ndriçimin tonë modern.
                              </p>
                              <div className="space-y-0.5 mb-2">
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Ndriçim i oborrit dhe kopshtit</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Llambat e murit dhe tavanit</span>
                                </div>
                              </div>
                              <Link 
                                href="/collections/68601f21bf9f854bf7948a47" 
                                onClick={scrollToTop}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded text-xs font-medium hover:from-[#0a9945]/90 hover:to-gray-800/90 transition-all duration-200 shadow-sm"
                              >
                                Shiko Produktet
                                <FiChevronRight size={12} className="ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
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
                    <span className="absolute -top-2 -right-9 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white text-[8px] px-2 py-1">
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
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  <FiSearch size={20} className="text-gray-600 hover:text-gray-800" />
                </button>

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
                              onClick={scrollToTop}
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
                {/* Produktet e Ndricimit dropdown in mobile menu */}
                <div>
                  <button
                    onClick={() => setIsMobileProduktetNdricimitOpen(!isMobileProduktetNdricimitOpen)}
                    className="w-full text-left py-4 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
                  >
                    PRODUKTET E NDRIÇIMIT
                    <FiChevronDown className={`transition-transform duration-200 ${isMobileProduktetNdricimitOpen ? 'rotate-180' : ''}`} size={20} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isMobileProduktetNdricimitOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}`}> 
                    <div className="mt-3 space-y-3">
                      {/* Ndriçim i Brendshëm */}
                      <div className="mx-3">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                          <div className="flex">
                            {/* Image Section */}
                            <div className="relative w-24 h-20 flex-shrink-0">
                              <Image
                                src={ndricimBrendshemImages[currentBrendshemSlide]}
                                alt="Ndriçim i Brendshëm"
                                fill
                                className="object-cover transition-all duration-500"
                              />
                              {/* Slide indicators */}
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {ndricimBrendshemImages.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                      index === currentBrendshemSlide ? 'bg-white' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 p-3">
                              <h4 className="text-sm font-bold text-gray-800 mb-1">Ndriçim i Brendshëm</h4>
                              <p className="text-gray-600 text-xs mb-2 leading-tight">
                                Koleksion i ndriçimit të brendshëm me dizajne moderne.
                              </p>
                              <div className="space-y-0.5 mb-2">
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Llambat e tavolinës</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Lustrat dhe ndriçim i tavanit</span>
                                </div>
                              </div>
                              <Link 
                                href="/collections/685ffbb0bf9f854bf7948a02" 
                                onClick={scrollToTop}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded text-xs font-medium hover:from-[#0a9945]/90 hover:to-gray-800/90 transition-all duration-200"
                              >
                                Shiko
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ndriçim i Jashtëm */}
                      <div className="mx-3">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                          <div className="flex">
                            {/* Image Section */}
                            <div className="relative w-24 h-20 flex-shrink-0">
                              <Image
                                src={ndricimJashtemImages[currentJashtemSlide]}
                                alt="Ndriçim i Jashtëm"
                                fill
                                className="object-cover transition-all duration-500"
                              />
                              {/* Slide indicators */}
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {ndricimJashtemImages.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                      index === currentJashtemSlide ? 'bg-white' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 p-3">
                              <h4 className="text-sm font-bold text-gray-800 mb-1">Ndriçim i Jashtëm</h4>
                              <p className="text-gray-600 text-xs mb-2 leading-tight">
                                Transformoni hapësirat e jashtme me ndriçimin tonë modern.
                              </p>
                              <div className="space-y-0.5 mb-2">
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Ndriçim i oborrit</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-700">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-1.5 flex-shrink-0"></span>
                                  <span>Llambat e murit dhe tavanit</span>
                                </div>
                              </div>
                              <Link 
                                href="/collections/68601f21bf9f854bf7948a47" 
                                onClick={scrollToTop}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded text-xs font-medium hover:from-[#0a9945]/90 hover:to-gray-800/90 transition-all duration-200"
                              >
                                Shiko
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/collections/materiale-elektrike" className="block text-xl font-bold text-gray-800 py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200" onClick={scrollToTop}>
                  MATERIALE ELEKTRIKE
                </Link>
                <Link href="/shop/new-arrivals" className="block text-xl font-bold text-gray-800 py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200" onClick={scrollToTop}>
                  <span className="flex items-center gap-3">
                    ARRITJET E REJA
                    <span className="bg-gradient-to-r from-[#0a9945] to-gray-800 text-white text-xs px-2 py-1 font-bold">NEW</span>
                  </span>
                </Link>
                {/* Account section */}
                <div className="pt-6 border-t border-gray-200 mt-6">
                  {!isAuthenticated ? (
                    <Link 
                      href="/signin" 
                      className="block py-4 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      SIGN IN TO GET REWARDS
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
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
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
};

export default Header;