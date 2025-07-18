'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
// import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  brand: string;
  category: string;
  stock: number;
  sizes: string;
  isNewArrival?: boolean;
  description: string;
}

interface Filters {
  minPrice: number | '';
  maxPrice: number | '';
  brands: string[];
  categories: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    brands: [],
    categories: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch search results');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Failed to load search results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, fetchSearchResults]);

  // Get unique brands and categories from products
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand).filter((brand): brand is string => typeof brand === 'string' && brand.trim() !== ''))).sort();
  }, [products]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter((category): category is string => typeof category === 'string' && category.trim() !== ''))).sort();
  }, [products]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply filters

    if (filters.minPrice !== '') {
      filtered = filtered.filter(product => product.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice !== '') {
      filtered = filtered.filter(product => product.price <= Number(filters.maxPrice));
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Keep original order (newest first from API)
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      brands: [],
      categories: [],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found for "{query}"
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'default' | 'price-low' | 'price-high' | 'name')}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Sort by</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>

              {/* Filter Component */}
              <ProductFilters
                filters={filters}
                setFilters={setFilters}
                uniqueBrands={uniqueBrands}
                uniqueCategories={uniqueCategories}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                onClear={clearFilters}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid */}
        <div className="w-full">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group">
                  <ProductCard product={{...product, description: product.description || ''}} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters to find more products.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 