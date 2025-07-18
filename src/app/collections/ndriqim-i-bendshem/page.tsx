'use client';

import { useEffect, useState, useMemo } from 'react';
import { FaTimes, FaFilter, FaSearch, FaTimesCircle } from 'react-icons/fa';
import ProductCard from '../../../components/ProductCard/ProductCard';

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

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function NdriqimIBendshemPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minPrice: null as number | null,
    maxPrice: null as number | null,
    brands: [] as string[],
    subcategories: [] as string[],
  });
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minAvailablePrice, setMinAvailablePrice] = useState(0);
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(1000);

  // Fetch products and extract filter data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Nuk u gjetën produktet');
        const data = await res.json();
        console.log('Raw API data:', data);
        console.log('Sample product:', data[0]);
        const filtered = data.filter(
          (product: Product) => (product.category || '').toLowerCase() === 'ndriqim i bendshem'
        );
        console.log('Filtered products for ndriqim i bendshem:', filtered);
        setProducts(filtered);
        // Set price range
        if (filtered.length > 0) {
          const prices = filtered.map((p: Product) => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setMinAvailablePrice(minPrice);
          setMaxAvailablePrice(maxPrice);
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
          setError((err as any).message);
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
    return Array.from(new Set(products.map((p: Product) => p.brand).filter(Boolean)));
  }, [products]);
  const availableSubcategories = useMemo(() => {
    console.log('Products with subcategories:', products.filter(p => p.subcategory));
    console.log('All subcategories:', products.map(p => p.subcategory));
    return Array.from(
      new Set(
        products
          .map((p: Product) => p.subcategory)
          .filter((subcat): subcat is string => typeof subcat === 'string' && !!subcat)
      )
    );
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand || '');
      const matchesSubcategory = filters.subcategories.length === 0 || filters.subcategories.includes(product.subcategory || '');
      return matchesPrice && matchesBrand && matchesSubcategory;
    });
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

  const clearFilters = () => {
    setFilters({ minPrice: null, maxPrice: null, brands: [], subcategories: [] });
    setPriceRange([minAvailablePrice, maxAvailablePrice]);
  };

  const handleBrandFilter = (brand: string) => {
    setFilterLoading(true);
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand || '')
        ? prev.brands.filter((b) => b !== (brand || ''))
        : [...prev.brands, brand || ''],
    }));
    setTimeout(() => setFilterLoading(false), 500);
  };
  const handleSubcategoryFilter = (subcategory: string) => {
    setFilterLoading(true);
    setFilters((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategory || '')
        ? prev.subcategories.filter((s) => s !== (subcategory || ''))
        : [...prev.subcategories, subcategory || ''],
    }));
    setTimeout(() => setFilterLoading(false), 500);
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
                  onChange={e => {
                    setFilterLoading(true);
                    setPriceRange([Number(e.target.value), priceRange[1]]);
                    setTimeout(() => setFilterLoading(false), 500);
                  }}
                  className="w-full accent-[#0a9945]"
                />
                <input
                  type="range"
                  min={minAvailablePrice}
                  max={maxAvailablePrice}
                  value={priceRange[1]}
                  onChange={e => {
                    setFilterLoading(true);
                    setPriceRange([priceRange[0], Number(e.target.value)]);
                    setTimeout(() => setFilterLoading(false), 500);
                  }}
                  className="w-full accent-[#0a9945]"
                />
                <span className="text-sm">{priceRange[1]}€</span>
              </div>
            </div>
          </div>
        </div>
        {/* Brands Filter */}
        {availableBrands.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
              Brendet
            </h3>
            <div className="space-y-2">
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandFilter(brand)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    filters.brands.includes(brand)
                      ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-md'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Subcategory Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
            Nënkategoria ({availableSubcategories.length})
          </h3>
          <div className="text-xs text-gray-500 mb-2">
            Debug: {availableSubcategories.length} subcategories found
          </div>
          {availableSubcategories.length > 0 ? (
            <div className="space-y-2">
              {availableSubcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryFilter(subcategory)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                    filters.subcategories.includes(subcategory)
                      ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-50 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-md'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic">Nuk ka nënkategori</div>
          )}
        </div>
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
                        onChange={e => {
                          setFilterLoading(true);
                          setPriceRange([Number(e.target.value), priceRange[1]]);
                          setTimeout(() => setFilterLoading(false), 500);
                        }}
                        className="w-full accent-[#0a9945]"
                      />
                      <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        value={priceRange[1]}
                        onChange={e => {
                          setFilterLoading(true);
                          setPriceRange([priceRange[0], Number(e.target.value)]);
                          setTimeout(() => setFilterLoading(false), 500);
                        }}
                        className="w-full accent-[#0a9945]"
                      />
                      <span className="text-sm">{priceRange[1]}€</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Brands Filter (Mobile) */}
              {availableBrands.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                    Brendet
                  </h3>
                  <div className="space-y-1">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleBrandFilter(brand)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                          filters.brands.includes(brand)
                            ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Subcategory Filter (Mobile) */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0a9945] rounded-full"></div>
                  Nënkategoria
                </h3>
                {availableSubcategories.length > 0 ? (
                  <div className="space-y-1">
                    {availableSubcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => handleSubcategoryFilter(subcategory)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                          filters.subcategories.includes(subcategory)
                            ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm italic">Nuk ka nënkategori</div>
                )}
              </div>
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
        <div className="p-4 lg:p-6 pb-20"> {/* Add extra bottom padding for mobile button */}
          {/* Results Header with Sort */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Ndriqim i Bendshem
              </h1>
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
          {/* Grid or Empty State */}
          {filterLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0a9945]"></div>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredAndSortedProducts.map((product) => (
                <div key={product._id} className="group transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-[#0a9945]/20 rounded-xl overflow-hidden bg-white">
                  <ProductCard product={{...product, stock: undefined, description: product.description || ''}} />
                  {product.subcategory && (
                    <div className="text-xs text-gray-500 mt-1 px-2 pb-2">Nënkategoria: {product.subcategory}</div>
                  )}
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
          className="w-full px-4 py-3 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <FaFilter className="text-white" />
          Shfaq Filtrat
        </button>
      </div>
    </div>
  );
} 