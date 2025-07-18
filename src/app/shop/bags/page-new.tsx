'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FaTimes, FaFilter, FaSort } from 'react-icons/fa';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images?: string[];
  brand?: string;
  category?: string;
  gender?: string;
  subcategory?: string;
  mainImage?: string;
  image?: string;
  stock?: number;
  sizes?: string;
  isNewArrival?: boolean;
}

interface Filters {
  gender: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  brands: string[];
  categories: string[];
}

export default function BagsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    gender: null,
    minPrice: null,
    maxPrice: null,
    brands: [],
    categories: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [productCount, setProductCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      // Filter products to only show bags
      const bagsProducts = data.filter((product: Product) => 
        (product.category || '').toLowerCase() === 'çanta' || 
        (product.subcategory || '').toLowerCase() === 'çanta'
      );
      setProducts(bagsProducts);
      setFilteredProducts(bagsProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // Get unique brands and categories from products
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand).filter((brand): brand is string => typeof brand === 'string' && brand.trim() !== ''))).sort();
  }, [products]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.subcategory).filter((category): category is string => typeof category === 'string' && category.trim() !== ''))).sort();
  }, [products]);

  // Countdown animation for product count
  useEffect(() => {
    if (products.length > 0) {
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 steps for smooth animation
      const increment = products.length / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const currentCount = Math.min(Math.floor(increment * currentStep), products.length);
        setProductCount(currentCount);
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setProductCount(products.length);
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [products.length]);

  // Countdown animation for brand count
  useEffect(() => {
    if (uniqueBrands.length > 0) {
      const duration = 1500; // 1.5 seconds
      const steps = 40; // 40 steps for smooth animation
      const increment = uniqueBrands.length / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const currentCount = Math.min(Math.floor(increment * currentStep), uniqueBrands.length);
        setBrandCount(currentCount);
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setBrandCount(uniqueBrands.length);
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [uniqueBrands.length]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(product => product.gender === filters.gender);
    }

    // Price filters
    if (filters.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // Brand filters
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && filters.brands.includes(product.brand)
      );
    }

    // Category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        product.subcategory && filters.categories.includes(product.subcategory)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [filters, products, sortBy]);

  const handleGenderFilter = (gender: string | null) => {
    setFilters(prev => ({ ...prev, gender }));
  };

  const handlePriceFilter = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : Number(value);
    setFilters(prev => ({ ...prev, [type === 'min' ? 'minPrice' : 'maxPrice']: numValue }));
  };

  const handleBrandFilter = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setFilters({
      gender: null,
      minPrice: null,
      maxPrice: null,
      brands: [],
      categories: [],
    });
    setSortBy('default');
  };

  function getValidImage(...candidates: (string | undefined)[]) {
    return candidates.find(
      (img) => typeof img === 'string' && img.trim().length > 1
    ) || '/images/placeholder.jpg';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light font-bwseidoround">Duke ngarkuar koleksionin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <FaTimes className="text-2xl text-red-500" />
          </div>
          <h3 className="text-xl font-light text-gray-900 mb-2 font-bwseidoround">Gabim në ngarkim</h3>
          <p className="text-gray-600 mb-6 font-bwseidoround">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-bwseidoround"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gray-400 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.03, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-400 rounded-full blur-3xl"
          />
        </div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 tracking-wider mb-4 font-bwseidoround">
                Çanta
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto"></div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed font-bwseidoround"
            >
              Zbuloni koleksionin ekskluziv të çantave. 
              Stil i jashtëzakonshëm dhe elegancë e përsosur për çdo rast.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
              className="flex items-center justify-center gap-8"
            >
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900 mb-1 font-bwseidoround">{productCount}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-bwseidoround">Produkte</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900 mb-1 font-bwseidoround">{brandCount}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-bwseidoround">Brende</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-6">
          {/* Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Gender Filter */}
            <div className="w-full lg:w-auto">
              <div className="inline-flex w-full lg:w-auto bg-white p-1 rounded-xl shadow-lg border border-gray-200">
                <button
                  onClick={() => handleGenderFilter(null)}
                  className={`flex-1 lg:flex-none px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 font-bwseidoround ${
                    filters.gender === null
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Të Gjitha
                </button>
                <button
                  onClick={() => handleGenderFilter('Femra')}
                  className={`flex-1 lg:flex-none px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 font-bwseidoround ${
                    filters.gender === 'Femra'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  Femra
                </button>
                <button
                  onClick={() => handleGenderFilter('Meshkuj')}
                  className={`flex-1 lg:flex-none px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 font-bwseidoround ${
                    filters.gender === 'Meshkuj'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Meshkuj
                </button>
              </div>
            </div>

            {/* View and Sort Controls */}
            <div className="flex items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">
              {/* Sort Dropdown */}
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full lg:w-auto appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 font-bwseidoround"
                >
                  <option value="default">Rendit sipas</option>
                  <option value="price-low">Çmimi: Më i ulët</option>
                  <option value="price-high">Çmimi: Më i lartë</option>
                  <option value="name">Emri: A-Z</option>
                </select>
                <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg border-2 font-bwseidoround ${
                  isFilterOpen
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaFilter className="inline mr-2" />
                Filtra
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.gender || filters.minPrice || filters.maxPrice || filters.brands.length > 0 || filters.categories.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-bwseidoround">Filtra aktive:</span>
              {filters.gender && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800 font-bwseidoround">
                  {filters.gender}
                  <button
                    onClick={() => handleGenderFilter(null)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.brands.map(brand => (
                <span key={brand} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800 font-bwseidoround">
                  {brand}
                  <button
                    onClick={() => handleBrandFilter(brand)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.categories.map(category => (
                <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800 font-bwseidoround">
                  {category}
                  <button
                    onClick={() => handleCategoryFilter(category)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline font-bwseidoround"
              >
                Pastro të gjitha
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-center lg:text-left">
          <p className="text-sm text-gray-600 font-bwseidoround">
            {filteredProducts.length} produkte u gjetën
            {filters.gender && (
              <span className="font-medium text-gray-900">
                {' '}në kategorinë {filters.gender}
              </span>
            )}
          </p>
        </div>

        {/* Filter Sidebar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setIsFilterOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[85%] sm:w-96 bg-white shadow-2xl z-50"
                onClick={e => e.stopPropagation()}
              >
                <div className="h-full flex flex-col">
                  {/* Sidebar Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-light text-gray-900 font-bwseidoround">Filtra</h2>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FaTimes className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Price Filter */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-4 font-bwseidoround">Gama e Çmimeve</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-2 font-bwseidoround">Min €</label>
                          <input
                            type="number"
                            value={filters.minPrice || ''}
                            onChange={(e) => handlePriceFilter('min', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
                            placeholder="Min"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-2 font-bwseidoround">Max €</label>
                          <input
                            type="number"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handlePriceFilter('max', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brand Filter */}
                    {uniqueBrands.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-4 font-bwseidoround">Brendet</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {uniqueBrands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => handleBrandFilter(brand)}
                              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 font-bwseidoround ${
                                filters.brands.includes(brand)
                                  ? 'bg-gray-900 text-white shadow-sm'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Filter */}
                    {uniqueCategories.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-4 font-bwseidoround">Kategoritë</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {uniqueCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleCategoryFilter(category)}
                              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 font-bwseidoround ${
                                filters.categories.includes(category)
                                  ? 'bg-gray-900 text-white shadow-sm'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm font-bwseidoround"
                    >
                      Pastro Të Gjitha Filtra
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={{
                    _id: String(product._id || product.id || ''),
                    title: product.title || product.name || '',
                    price: product.price,
                    originalPrice: product.originalPrice,
                    discountPercentage: product.discountPercentage,
                    image: product.image,
                    images: product.images,
                    mainImage: product.mainImage,
                    stock: product.stock ?? 10,
                    brand: product.brand || '',
                    sizes: product.sizes || '',
                    gender: product.gender || '',
                    category: product.category || '',
                    description: product.description || '',
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaFilter className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-2 font-bwseidoround">Nuk u gjetën produkte</h3>
                <p className="text-gray-500 mb-6 font-bwseidoround">
                  Provoni të përshtatni filtrat tuaj për të gjetur atë që po kërkoni.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors font-bwseidoround"
                >
                  Pastro Filtra
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 