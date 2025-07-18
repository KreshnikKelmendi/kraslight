'use client';

import React from 'react';
import { FaTimes, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Filters {
  minPrice: number | '';
  maxPrice: number | '';
  brands: string[];
  categories: string[];
}

interface ProductFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  uniqueBrands: string[];
  uniqueCategories: string[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export default function ProductFilters({
  filters,
  setFilters,
  uniqueBrands,
  uniqueCategories,
  isOpen,
  onToggle,
  onClear
}: ProductFiltersProps) {
  const handleFilterChange = (type: keyof Filters, value: string | number | string[]) => {
    setFilters({
      ...filters,
      [type]: value
    });
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors shadow-sm"
      >
        <FaFilter size={16} />
        <span>Filters</span>
      </button>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClear}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={onToggle}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="€0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="€1000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Brands Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Brands</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uniqueBrands.map((brand) => (
                  <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('brands', [...filters.brands, brand]);
                        } else {
                          handleFilterChange('brands', filters.brands.filter(b => b !== brand));
                        }
                      }}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uniqueCategories.map((category) => (
                  <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('categories', [...filters.categories, category]);
                        } else {
                          handleFilterChange('categories', filters.categories.filter(c => c !== category));
                        }
                      }}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.minPrice || filters.maxPrice || filters.brands.length > 0 || filters.categories.length > 0) && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.minPrice && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Min: €{filters.minPrice}
                      <button
                        onClick={() => handleFilterChange('minPrice', '')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Max: €{filters.maxPrice}
                      <button
                        onClick={() => handleFilterChange('maxPrice', '')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.brands.map((brand) => (
                    <span key={brand} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {brand}
                      <button
                        onClick={() => handleFilterChange('brands', filters.brands.filter(b => b !== brand))}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                  {filters.categories.map((category) => (
                    <span key={category} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {category}
                      <button
                        onClick={() => handleFilterChange('categories', filters.categories.filter(c => c !== category))}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 