'use client';

import { useEffect, useState, useMemo } from 'react';
import { FaTimes, FaFilter, FaSearch, FaTimesCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { fetchCachedJson } from '@/app/lib/client-fetch-cache';

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

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

type ErrorWithMessage = { message: string };

export default function MaterialeElektrikePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minPrice: null as number | null,
    maxPrice: null as number | null,
    brands: [] as string[],
    subcategories: [] as string[],
  });
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    subcategories: true, // open by default
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minAvailablePrice, setMinAvailablePrice] = useState(0);
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(1000);

  // Fetch products and extract filter data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchCachedJson<Product[]>(
          `/api/products?category=${encodeURIComponent('materiale elektrike')}`
        );
        const filtered = data;
        setProducts(filtered);
        // Set price range
        if (filtered.length > 0) {
          const prices = filtered.map((p: Product) => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setMinAvailablePrice(minPrice);
          setMaxAvailablePrice(maxPrice);
          setPriceRange([minPrice, maxPrice]);
        } else {
          // Set default values when no products are found
          setMinAvailablePrice(0);
          setMaxAvailablePrice(100);
          setPriceRange([0, 100]);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err && typeof (err as ErrorWithMessage).message === 'string') {
          setError((err as ErrorWithMessage).message);
        } else {
          setError('Gabim gjatë marrjes së produkteve');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Extract unique brands and subcategories
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p: Product) => p.brand).filter((b): b is string => typeof b === 'string' && !!b)));
  }, [products]);
  const availableSubcategories = useMemo(() => {
    return Array.from(new Set(products.map((p: Product) => p.subcategory).filter((subcat): subcat is string => typeof subcat === 'string' && !!subcat)));
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product: Product) => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand || '');
      const matchesSubcategory = filters.subcategories.length === 0 || filters.subcategories.includes(product.subcategory || '');
      return matchesPrice && matchesBrand && matchesSubcategory;
    });
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a: Product, b: Product) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a: Product, b: Product) => b.price - a.price);
      case 'name-asc':
        return filtered.sort((a: Product, b: Product) => a.title.localeCompare(b.title));
      case 'name-desc':
        return filtered.sort((a: Product, b: Product) => b.title.localeCompare(a.title));
      default:
        return filtered;
    }
  }, [products, filters, sortBy, priceRange]);

  const clearFilters = () => {
    setFilters({ minPrice: null, maxPrice: null, brands: [], subcategories: [] });
    setPriceRange([minAvailablePrice, maxAvailablePrice]);
  };

  const handleBrandFilter = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand || '')
        ? prev.brands.filter((b) => b !== (brand || ''))
        : [...prev.brands, brand || ''],
    }));
  };
  const handleSubcategoryFilter = (subcategory: string) => {
    setFilters((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategory || '')
        ? prev.subcategories.filter((s) => s !== (subcategory || ''))
        : [...prev.subcategories, subcategory || ''],
    }));
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

        {/* Brands Filter */}
        {availableBrands.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setExpandedFilters(prev => ({ ...prev, brands: !prev.brands }))}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                Brendet
              </div>
              {expandedFilters.brands ? (
                <FaChevronUp className="text-gray-500 text-xs" />
              ) : (
                <FaChevronDown className="text-gray-500 text-xs" />
              )}
            </button>
            {expandedFilters.brands && (
              <div className="space-y-2">
                {availableBrands.map((brand: string) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandFilter(brand)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filters.brands.includes(brand)
                        ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Subcategory Filter */}
        {availableSubcategories.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setExpandedFilters(prev => ({ ...prev, subcategories: !prev.subcategories }))}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                Nënkategoritë
              </div>
              {expandedFilters.subcategories ? (
                <FaChevronUp className="text-gray-500 text-xs" />
              ) : (
                <FaChevronDown className="text-gray-500 text-xs" />
              )}
            </button>
            {expandedFilters.subcategories && (
              <div className="space-y-2">
                {availableSubcategories.map((subcategory: string) => (
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
            )}
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

              {/* Brands Filter (Mobile) */}
              {availableBrands.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, brands: !prev.brands }))}
                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                      Brendet
                    </div>
                    {expandedFilters.brands ? (
                      <FaChevronUp className="text-gray-500 text-xs" />
                    ) : (
                      <FaChevronDown className="text-gray-500 text-xs" />
                    )}
                  </button>
                  {expandedFilters.brands && (
                    <div className="space-y-1">
                      {availableBrands.map((brand: string) => (
                        <button
                          key={brand}
                          onClick={() => handleBrandFilter(brand)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            filters.brands.includes(brand)
                              ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Subcategory Filter (Mobile) */}
              {availableSubcategories.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setExpandedFilters(prev => ({ ...prev, subcategories: !prev.subcategories }))}
                    className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                      Nënkategoritë
                    </div>
                    {expandedFilters.subcategories ? (
                      <FaChevronUp className="text-gray-500 text-xs" />
                    ) : (
                      <FaChevronDown className="text-gray-500 text-xs" />
                    )}
                  </button>
                  {expandedFilters.subcategories && (
                    <div className="space-y-1">
                      {availableSubcategories.map((subcategory: string) => (
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
                  )}
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
        <div className="px-4 py-4 lg:px-10 lg:py-6 2xl:px-24 pb-20"> {/* Add extra bottom padding for mobile button */}
          {/* Results Header with Sort */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Materiale Elektrike
              </h1>
              <p className="text-gray-600 text-sm">
                {filteredAndSortedProducts.length} produkte të gjetura
              </p>
            </div>
            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="default" disabled>Rendit:</option>
                <option value="price-asc">Çmimi: më i ulët</option>
                <option value="price-desc">Çmimi: më i larti</option>
                <option value="name-asc">Emri: A-Z</option>
                <option value="name-desc">Emri: Z-A</option>
              </select>
            </div>
          </div>
          {/* Grid or Empty State */}
          {filteredAndSortedProducts.length > 0 ? (
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