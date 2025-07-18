"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { FaTimes, FaFilter, FaSearch, FaTimesCircle } from 'react-icons/fa';
import ProductCard from '@/components/ProductCard/ProductCard';
import { motion } from 'framer-motion';

interface Product {
  _id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  gender: string;
  category: string;
  brand: string;
  sizes: string;
  description: string;
  stock: number;
  isNewArrival?: boolean;
  subcategory?: string;
}

interface Filters {
  type: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  categories: string[];
  brands: string[];
  subcategories: string[];
}

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function BrandPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: null,
    minPrice: null,
    maxPrice: null,
    categories: [],
    brands: [],
    subcategories: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minAvailablePrice, setMinAvailablePrice] = useState(0);
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(1000);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    if (params?.brand) fetchBrandProducts(params.brand as string);
  }, [params?.brand]);

  // Handle filter loading with delay
  useEffect(() => {
    setFilterLoading(true);
    const timer = setTimeout(() => {
      setFilterLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, sortBy]);

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

  // Countdown animation for category count
  useEffect(() => {
    if (availableCategories.length > 0) {
      const duration = 1500; // 1.5 seconds
      const steps = 40; // 40 steps for smooth animation
      const increment = availableCategories.length / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const currentCount = Math.min(Math.floor(increment * currentStep), availableCategories.length);
        setCategoryCount(currentCount);
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCategoryCount(availableCategories.length);
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [availableCategories.length]);

  async function fetchBrandProducts(brand: string) {
    try {
      const res = await fetch(`/api/products?brand=${brand}`);
      const data = await res.json();
      setProducts(data);
      
      // Extract unique categories
      const categories = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean)));
      setAvailableCategories(categories as string[]);
      
      // Extract unique subcategories
      const subcategories = Array.from(new Set(data.map((p: Product) => p.subcategory).filter(Boolean)));
      setAvailableSubcategories(subcategories as string[]);
      
      // Set price range
      const prices = data.map((p: Product) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setMinAvailablePrice(minPrice);
      setMaxAvailablePrice(maxPrice);
      setPriceRange([minPrice, maxPrice]);
      
      if (typeof window !== 'undefined') {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Error fetching brand products:', error);
      setError('Failed to load brand products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubcategoryFilter = (subcategory: string) => {
    setFilters(prev => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategory)
        ? prev.subcategories.filter(s => s !== subcategory)
        : [...prev.subcategories, subcategory]
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      type: null,
      minPrice: null,
      maxPrice: null,
      categories: [],
      brands: [],
      subcategories: [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesType = !filters.type || product.category === filters.type;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
      const matchesSubcategory = filters.subcategories.length === 0 || filters.subcategories.includes(product.subcategory || '');
      return matchesType && matchesPrice && matchesCategory && matchesBrand && matchesSubcategory;
    });

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return filtered.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return filtered;
    }
  }, [products, filters, sortBy, priceRange]);

  const formatBrandName = (brand: string) => {
    const decodedBrand = decodeURIComponent(brand);
    return decodedBrand
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0a9945]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!params?.brand) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:block w-80 bg-white shadow-2xl border-r border-gray-200 p-10 overflow-y-auto sticky top-0 h-screen">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-[#0a9945] to-gray-800 rounded-lg">
              <FaFilter className="text-white text-sm" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Filtro</h2>
          </div>
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
          >
            <FaTimesCircle className="text-xs" />
            Pastro
          </button>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
            Çmimi
          </h3>
          <div className="space-y-3 bg-gradient-to-br from-green-50 to-gray-50 p-3 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="block text-xs text-gray-600 mb-1 font-medium">Zgjidhni intervalin e çmimit:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">{priceRange[0]}€</span>
                <input
                  type="range"
                  min={minAvailablePrice}
                  max={maxAvailablePrice}
                  value={priceRange[0]}
                  onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full accent-[#0a9945]"
                />
                <input
                  type="range"
                  min={minAvailablePrice}
                  max={maxAvailablePrice}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-[#0a9945]"
                />
                <span className="text-sm">{priceRange[1]}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        {availableCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
              Kategoritë
            </h3>
            <div className="space-y-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.categories.includes(category)
                      ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory Filter */}
        {availableSubcategories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
              Nënkategoritë
            </h3>
            <div className="space-y-2">
              {availableSubcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryFilter(subcategory)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.subcategories.includes(subcategory)
                      ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 ${
          isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileFiltersOpen(false)}
      >
        <div 
          className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
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
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            {/* Mobile Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Price Range Filter (Mobile) */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                  Çmimi
                </h3>
                <div className="space-y-2 bg-gradient-to-br from-green-50 to-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs text-gray-600 mb-1 font-medium">Zgjidhni intervalin e çmimit:</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{priceRange[0]}€</span>
                      <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full accent-[#0a9945]"
                      />
                      <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full accent-[#0a9945]"
                      />
                      <span className="text-sm">{priceRange[1]}€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Filter (Mobile) */}
              {availableCategories.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                    Kategoritë
                  </h3>
                  <div className="space-y-1">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          filters.categories.includes(category)
                            ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategory Filter (Mobile) */}
              {availableSubcategories.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                    Nënkategoritë
                  </h3>
                  <div className="space-y-1">
                    {availableSubcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => handleSubcategoryFilter(subcategory)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          filters.subcategories.includes(subcategory)
                            ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {subcategory}
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
                className="w-full px-4 py-3 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
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
          {/* Results Header with Sort */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {formatBrandName(params.brand as string)}
              </h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="text-gray-600 text-sm mb-3"
              >
                Zbuloni koleksionin ekskluziv nga <span className="font-medium text-gray-900">{formatBrandName(params.brand as string)}</span>. 
                Stil i jashtëzakonshëm dhe elegancë e përsosur për çdo rast.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                className="flex items-center gap-6 mb-2"
              >
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{productCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Produkte</div>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{categoryCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Kategori</div>
                </div>
              </motion.div>
              <p className="text-gray-600 text-sm">
                {filteredAndSortedProducts.length} produkte të gjetura
              </p>
            </div>
            
            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Rendit:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="price-asc">Çmimi: më i ulët</option>
                <option value="price-desc">Çmimi: më i larti</option>
                <option value="name-asc">Emri: A-Z</option>
                <option value="name-desc">Emri: Z-A</option>
              </select>
            </div>
          </div>

          {/* Loading State for Filters */}
          {filterLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#0a9945]"></div>
                <p className="text-sm text-gray-600">Duke filtruar produkte...</p>
              </div>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredAndSortedProducts.map((product) => (
                <div key={product._id} className="group transform hover:scale-105 transition-all duration-300">
                  <ProductCard product={{...product, stock: undefined, description: product.description || ''}} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-[#0a9945] to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nuk ka produkte të gjetura</h3>
                <p className="text-gray-500 mb-4 text-sm">Provoni të ndryshoni filtrat për të gjetur produkte të tjera.</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  Pastro Filtret
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Button - fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-gradient-to-br from-gray-50 to-gray-100 pt-2 pb-2 px-4 border-t border-gray-200">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FaFilter className="text-white" />
          Shfaq Filtrat
        </button>
      </div>
    </div>
  );
}