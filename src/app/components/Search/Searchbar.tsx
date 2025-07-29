import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  brand: string;
  category: string;
  gender: string;
  barcode?: string;
  isNewArrival?: boolean;
}

interface SearchbarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Searchbar: React.FC<SearchbarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when searchbar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    addToRecentSearches(searchTerm);
  };

  const addToRecentSearches = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) {
      return '';
    }
    return new Intl.NumberFormat('sq-AL', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute left-0 right-0 top-full z-50 mx-auto w-full max-w-2xl bg-white rounded-b-2xl shadow-2xl border-t border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        >
          {/* Search Header */}
          <div className="p-4 border-b border-gray-100 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kërko produkte, brende, kategori, barkod..."
              className="w-full pl-12 pr-12 py-3 text-base border-0 focus:ring-0 focus:outline-none placeholder-gray-400 bg-transparent"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Search Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="p-4 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                        <FiClock className="mr-2" size={16} />
                        Kërkimet e fundit
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Fshi të gjitha
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">Duke kërkuar...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Rezultatet e kërkimit ({results.length})
                    </h3>
                    <div className="space-y-3">
                      {results.map((product) => (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          onClick={() => {
                            addToRecentSearches(query);
                            onClose();
                          }}
                          className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={product.image || '/images/placeholder.jpg'}
                              alt={product.title}
                              fill
                              className="object-cover rounded-md"
                            />
                            {product.isNewArrival && (
                              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                            {/* Price information removed from search results */}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nuk u gjet asnjë produkt
                    </h3>
                    <p className="text-gray-500">
                      Provoni të kërkoni me fjalë të tjera ose shikoni kërkimet popullore
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Searchbar; 