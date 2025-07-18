'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaFilter } from 'react-icons/fa';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { motion } from 'framer-motion';

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
  minPrice: number | null;
  maxPrice: number | null;
  brands: string[];
  categories: string[];
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters & { mainCategories?: string[] }>({
    minPrice: null,
    maxPrice: null,
    brands: [],
    categories: [],
    mainCategories: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [productCount, setProductCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  // Add a new state for filter loading
  const [filterLoading, setFilterLoading] = useState(false);

  // Slider images array
  const sliderImages = [
    '/uploads/slider/07719d9c-2a20-4491-9cb2-b1b025bd0092.jpg',
    '/uploads/a7e34469-41d2-4dd9-82f5-b47100521149-HD-wallpaper-gigi-hadid-latest-gigi-hadid-celebrities-girls-model.jpg',
    '/uploads/3e723abe-b057-40f7-aec9-d0288f4d5fc0.jpg',
    '/uploads/5b0821c2-54b1-4c22-8bbc-78b81e7d29e8.jpg',
    '/uploads/d60bc875-2783-4d75-b823-25eae3ffcc9b.jpg',
    '/uploads/slider/09c25e9e-d381-4b52-93e2-fe8185ed6c36.jpg'
  ];

  // Auto-slide effect - fast changing
  useEffect(() => {
    const interval = setInterval(() => {
      // setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length); // This line was removed
    }, 1500); // 1.5 seconds for fast changing

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      // Filter products to only show new arrivals
      const newArrivalsProducts = data.filter((product: Product) => product.isNewArrival === true);
      setProducts(newArrivalsProducts);
      setFilteredProducts(newArrivalsProducts);
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

  // Add unique main categories extraction
  const uniqueMainCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== ''))).sort();
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
    setFilterLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...products];



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

      // Main Category filters
      if (filters.mainCategories && filters.mainCategories.length > 0) {
        filtered = filtered.filter(product =>
          product.category && filters.mainCategories!.includes(product.category)
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
      setFilterLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, products, sortBy]);



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
      minPrice: null,
      maxPrice: null,
      brands: [],
      categories: [],
      mainCategories: [],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-bwseidoround">Duke ngarkuar produktet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-bwseidoround">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-bwseidoround"
          >
            Provoni Përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content: Filters and Products */}
      <div className="flex-1 flex bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-80 bg-white shadow-2xl border-r border-gray-200 p-10 overflow-y-auto sticky top-0 h-screen">
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg">
                <FaFilter className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Filtro</h2>
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-red-500 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
            >
              <FaTimes className="text-xs" />
              Pastro
            </button>
          </div>
          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
              Çmimi
            </h3>
            <div className="space-y-3 bg-gradient-to-br from-gray-100 to-gray-50 p-3 rounded-lg">
              <div className="flex flex-col gap-2">
                <label className="block text-xs text-gray-600 mb-1 font-medium">Zgjidhni intervalin e çmimit:</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{filters.minPrice ?? 0}€</span>
                  <input
                    type="range"
                    min={Math.min(...products.map(p => p.price), 0)}
                    max={Math.max(...products.map(p => p.price), 1000)}
                    value={filters.minPrice ?? Math.min(...products.map(p => p.price), 0)}
                    onChange={e => setFilters(f => ({ ...f, minPrice: Number(e.target.value) }))}
                    className="w-full accent-gray-900"
                  />
                  <input
                    type="range"
                    min={Math.min(...products.map(p => p.price), 0)}
                    max={Math.max(...products.map(p => p.price), 1000)}
                    value={filters.maxPrice ?? Math.max(...products.map(p => p.price), 1000)}
                    onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                    className="w-full accent-gray-900"
                  />
                  <span className="text-sm">{filters.maxPrice ?? Math.max(...products.map(p => p.price), 1000)}€</span>
                </div>
              </div>
            </div>
          </div>
          {/* Brands Filter */}
          {uniqueBrands.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                Brendet
              </h3>
              <div className="space-y-2">
                {uniqueBrands.map((brand: string) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandFilter(brand)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      filters.brands.includes(brand)
                        ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Categories Filter (main categories) */}
          {uniqueMainCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                Kategoritë
              </h3>
              <div className="space-y-2">
                {uniqueMainCategories.map((category: string) => (
                  <button
                    key={category}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        mainCategories: prev.mainCategories && prev.mainCategories.includes(category)
                          ? prev.mainCategories.filter(c => c !== category)
                          : [...(prev.mainCategories || []), category]
                      }));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      filters.mainCategories && filters.mainCategories.includes(category)
                        ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Subcategories Filter (was Categories) */}
          {uniqueCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                Nënkategoritë
              </h3>
              <div className="space-y-2">
                {uniqueCategories.map((category: string) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      filters.categories.includes(category)
                        ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Overlay */}
        <div 
          className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 ${
            isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsFilterOpen(false)}
        >
          <div 
            className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isFilterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Mobile Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-white" />
                  <h2 className="text-base font-bold">Filtro</h2>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <FaTimes className="text-white" />
                </button>
              </div>
              {/* Mobile Filter Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Price Range Filter (Mobile) */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    Çmimi
                  </h3>
                  <div className="space-y-2 bg-gradient-to-br from-gray-100 to-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs text-gray-600 mb-1 font-medium">Zgjidhni intervalin e çmimit:</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{filters.minPrice ?? 0}€</span>
                        <input
                          type="range"
                          min={Math.min(...products.map(p => p.price), 0)}
                          max={Math.max(...products.map(p => p.price), 1000)}
                          value={filters.minPrice ?? Math.min(...products.map(p => p.price), 0)}
                          onChange={e => setFilters(f => ({ ...f, minPrice: Number(e.target.value) }))}
                          className="w-full accent-gray-900"
                        />
                        <input
                          type="range"
                          min={Math.min(...products.map(p => p.price), 0)}
                          max={Math.max(...products.map(p => p.price), 1000)}
                          value={filters.maxPrice ?? Math.max(...products.map(p => p.price), 1000)}
                          onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                          className="w-full accent-gray-900"
                        />
                        <span className="text-sm">{filters.maxPrice ?? Math.max(...products.map(p => p.price), 1000)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Brands Filter (Mobile) */}
                {uniqueBrands.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                      Brendet
                    </h3>
                    <div className="space-y-1">
                      {uniqueBrands.map((brand: string) => (
                        <button
                          key={brand}
                          onClick={() => handleBrandFilter(brand)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                            filters.brands.includes(brand)
                              ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Categories Filter (Mobile, main categories) */}
                {uniqueMainCategories.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                      Kategoritë
                    </h3>
                    <div className="space-y-1">
                      {uniqueMainCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              mainCategories: prev.mainCategories && prev.mainCategories.includes(category)
                                ? prev.mainCategories.filter(c => c !== category)
                                : [...(prev.mainCategories || []), category]
                            }));
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                            filters.mainCategories && filters.mainCategories.includes(category)
                              ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Subcategories Filter (Mobile, was Categories) */}
                {uniqueCategories.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                      Nënkategoritë
                    </h3>
                    <div className="space-y-1">
                      {uniqueCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryFilter(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                            filters.categories.includes(category)
                              ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Mobile Filter Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  Pastro Filtret
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4 lg:p-6 pb-20">
            {/* New Arrivals Info Block (fully left-aligned, items-start) */}
            <div className="mb-8 w-full flex flex-col items-start text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl font-extrabold tracking-wide text-gray-900 mb-1 font-bwseidoround"
              >
                Arritjet e reja
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                className="text-base sm:text-lg text-gray-600 mb-2 font-bwseidoround"
              >
                Zbuloni arritjet më të reja të Kraslight – produktet më të fundit, trendet më të freskëta dhe risitë që sjellim për ju çdo sezon.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                className="flex flex-row items-start gap-8 mt-1"
              >
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-bold text-green-600 mb-0 font-bwseidoround animate-pulse">{productCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bwseidoround">Produkte</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-green-400 to-blue-400 opacity-60"></div>
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-bold text-blue-600 mb-0 font-bwseidoround animate-pulse">{brandCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bwseidoround">Brende</div>
                </div>
              </motion.div>
            </div>
            {/* Results Header with Sort (remove Produkte të Reja heading) */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-600 text-sm">
                  {filteredProducts.length} produkte të reja
                </p>
              </div>
              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Rendit:</span>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'default' | 'price-low' | 'price-high' | 'name')}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="default">Rendit sipas</option>
                  <option value="price-low">Çmimi: më i ulët</option>
                  <option value="price-high">Çmimi: më i lartë</option>
                  <option value="name">Emri: A-Z</option>
                </select>
              </div>
            </div>
            {/* Grid or Empty State */}
            {filterLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <span className="ml-4 text-gray-600 font-bwseidoround">Duke filtruar...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id || product.id} className="group transform hover:scale-105 transition-all duration-300">
                    <ProductCard product={{
                      _id: String(product._id || product.id || ''),
                      title: product.title || product.name || '',
                      price: product.price,
                      originalPrice: product.originalPrice,
                      discountPercentage: product.discountPercentage,
                      image: product.image,
                      images: product.images,
                      stock: product.stock ?? 10,
                      brand: product.brand || '',
                      sizes: product.sizes || '',
                      category: product.category || '',
                      description: product.description || '',
                      isNewArrival: product.isNewArrival,
                    }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaFilter className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-light text-gray-900 mb-2 font-bwseidoround">Nuk u gjetën produkte të reja</h3>
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
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add fixed bottom filter button for mobile */}
      <div className="lg:hidden">
        <div className="fixed bottom-0 left-0 w-full z-40 p-4 bg-gradient-to-t from-white/90 via-white/80 to-transparent pointer-events-none">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#0a9945] to-gray-800 text-white text-base font-medium shadow font-bwseidoround flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
          >
            <FaFilter className="inline mr-2 text-white" />
            Shfaq filtrat
          </button>
        </div>
      </div>
    </div>
  );
} 