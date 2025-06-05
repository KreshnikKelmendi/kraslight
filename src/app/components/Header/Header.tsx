// src/app/components/layout/Header/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrendetMegaMenuOpen, setIsBrendetMegaMenuOpen] = useState(false);
  const [isMenCategoryOpen, setIsMenCategoryOpen] = useState(false);
  const [isWomenCategoryOpen, setIsWomenCategoryOpen] = useState(false);

  const brands = [
    { name: 'Versace', href: '/shop/brand/versace' },
    { name: 'Dsquared', href: '/shop/brand/dsquared' },
    { name: 'Offwhite', href: '/shop/brand/offwhite' },
    { name: 'Balmain', href: '/shop/brand/balmain' },
    { name: 'Alexander MCqueen', href: '/shop/brand/alexander-mcqueen' },
    { name: 'Wolford', href: '/shop/brand/wolford' },
    { name: 'Mevlani', href: '/shop/brand/mevlani' },
    { name: 'jWanderson', href: '/shop/brand/jwanderson' },
    { name: 'Jack Owens', href: '/shop/brand/jack-owens' },
    { name: 'Dhe të tjera', href: '/shop/brand/others' },
  ];

  const menCategories = [
    { name: 'T-shirts', href: '/shop/men/t-shirts' },
    { name: 'Pantallona', href: '/shop/men/pants' },
    { name: 'Xhaketa', href: '/shop/men/jackets' },
    { name: 'Këpucë', href: '/shop/men/shoes' },
    { name: 'Aksesorë', href: '/shop/men/accessories' },
  ];

  const womenCategories = [
    { name: 'Dres', href: '/shop/women/dresses' },
    { name: 'Sustina', href: '/shop/women/leggings' },
    { name: 'Bluzë', href: '/shop/women/tops' },
    { name: 'Fustane', href: '/shop/women/skirts' },
    { name: 'Këpucë', href: '/shop/women/shoes' },
    { name: 'Aksesorë', href: '/shop/women/accessories' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="relative mx-auto px-4 lg:px-5 py-4 lg:py-5 flex items-center justify-between">
        {/* Left Section: Logo and Navigation Links */}
        <div className="flex items-center space-x-4 md:space-x-12">
          {/* Logo with Image */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/assets/logo/adidas-logo.png"
              alt="adidas logo"
              width={80}
              height={30}
              className="h-auto w-auto"
            />
          </Link>

          {/* Desktop Navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center text-gray-700 space-x-6">
            {/* Blog Link - Standalone without dropdown */}
            <Link href="/blog" className="hover:text-gray-900 transition duration-200 font-semibold px-2 py-1">
              BLOG
            </Link>

            {/* ZGJEDH SIPAS BRENDIT with dropdown */}
            <div className="relative group">
              <Link href="/shop" className="hover:text-gray-900 transition duration-200 font-semibold px-2 py-1">
                ZGJEDH SIPAS BRENDIT
              </Link>
              
              {/* Mega Menu Content (Desktop) */}
              <div
                className="absolute top-full lg:w-[100ch]
                           bg-white border border-gray-200 rounded-md shadow-lg p-8
                           opacity-0 invisible group-hover:opacity-100 group-hover:visible
                           transition-all duration-300 ease-in-out transform scale-95 group-hover:scale-100 origin-top"
              >
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Column 1: Brendet */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Brendet</h3>
                    <ul className="space-y-2 text-sm">
                      {brands.map((brand, index) => (
                        <li key={index}>
                          <Link href={brand.href} className="block hover:text-gray-900">
                            {brand.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: Kategoritë (Men) */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Kategoritë (Meshkuj)</h3>
                    <ul className="space-y-2 text-sm">
                      {menCategories.map((category, index) => (
                        <li key={index}>
                          <Link href={category.href} className="block hover:text-gray-900">
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Kategoritë (Women) */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Kategoritë (Femra)</h3>
                    <ul className="space-y-2 text-sm">
                      {womenCategories.map((category, index) => (
                        <li key={index}>
                          <Link href={category.href} className="block hover:text-gray-900">
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Right Section: Icons and Sign In Link */}
        <div className="flex items-center space-x-4 text-gray-600">
          {/* Hamburger Menu Button (visible on mobile, hidden on desktop) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Other icons (visible on both, or adjusted for mobile if needed) */}
          <button className="hidden md:block hover:text-gray-800 transition duration-200">
            <FiSearch size={20} />
          </button>

          <Link href="/signin" className="hidden md:block hover:text-gray-800 transition duration-200 text-sm">
            SIGN IN TO GET REWARDS
          </Link>
          <button className="hidden md:block hover:text-gray-800 transition duration-200">
            <FiUser size={20} />
          </button>

          <button className="hover:text-gray-800 transition duration-200">
            <FiHeart size={20} />
          </button>

          <Link href="/cart" className="hover:text-gray-800 transition duration-200">
            <FiShoppingCart size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-xl absolute top-full left-0 right-0 py-8 px-4 transition-all duration-300 ease-in-out transform origin-top animate-slide-down overflow-hidden">
          <div className="flex flex-col space-y-4 mb-6 border-b border-gray-200 pb-6">
            <div className="w-full">
              <button
                className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 hover:text-gray-600 focus:outline-none"
                onClick={() => setIsBrendetMegaMenuOpen(!isBrendetMegaMenuOpen)}
              >
                ZGJEDH SIPAS BRENDIT
                <FiChevronDown className={`transform transition-transform duration-300 ${isBrendetMegaMenuOpen ? 'rotate-180' : ''}`} size={20} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isBrendetMegaMenuOpen ? 'max-h-screen pt-4' : 'max-h-0'
                }`}
              >
                <div className="flex flex-col space-y-6 pl-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Brendet</h3>
                    <ul className="space-y-2 text-base pl-4">
                      {brands.map((brand, index) => (
                        <li key={index}>
                          <Link href={brand.href} className="block hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                            {brand.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full">
                    <button
                      className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 hover:text-gray-600 focus:outline-none"
                      onClick={() => setIsMenCategoryOpen(!isMenCategoryOpen)}
                    >
                      Kategoritë (Meshkuj)
                      <FiChevronDown className={`transform transition-transform duration-300 ${isMenCategoryOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isMenCategoryOpen ? 'max-h-screen pt-2' : 'max-h-0'
                      }`}
                    >
                      <ul className="space-y-2 text-base pl-8">
                        {menCategories.map((category, index) => (
                          <li key={index}>
                            <Link href={category.href} className="block hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="w-full">
                    <button
                      className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 hover:text-gray-600 focus:outline-none"
                      onClick={() => setIsWomenCategoryOpen(!isWomenCategoryOpen)}
                    >
                      Kategoritë (Femra)
                      <FiChevronDown className={`transform transition-transform duration-300 ${isWomenCategoryOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isWomenCategoryOpen ? 'max-h-screen pt-2' : 'max-h-0'
                      }`}
                    >
                      <ul className="space-y-2 text-base pl-8">
                        {womenCategories.map((category, index) => (
                          <li key={index}>
                            <Link href={category.href} className="block hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/blog" className="text-lg font-semibold text-gray-800 hover:text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>BLOG</Link>
            <Link href="/signin" className="text-lg font-semibold text-gray-800 hover:text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>SIGN IN TO GET REWARDS</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;