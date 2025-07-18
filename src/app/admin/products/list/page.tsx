'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEdit, FaTrash, FaSpinner, FaImage, FaChevronLeft, FaChevronRight, FaChevronDown, FaFilter, FaTimes, FaPercent } from 'react-icons/fa';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock: number;
  brand: string;
  image?: string;
  category: string;
  mainImage?: string;
  images?: string[];
  isNewArrival?: boolean;
}

interface Filters {
  search: string;
  brand: string;
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  minStock: number | '';
  maxStock: number | '';
  stockStatus: string;
  newArrivals: boolean;
  onSale: boolean;
  // Bulk discount options
  showBulkDiscount: boolean;
  bulkDiscountPercentage: number;
  bulkDiscountType: 'all' | 'brand' | 'category';
  bulkDiscountTarget: string;
}

const ITEMS_PER_PAGE = 12;

function getValidImage(...candidates: (string | undefined)[]) {
  return candidates.find(
    (img) => typeof img === 'string' && img.trim().startsWith('/') && img.trim().length > 1
  ) || '/images/placeholder.jpg';
}

export default function ProductsList() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    stockStatus: '',
    newArrivals: false,
    onSale: false,
    showBulkDiscount: false,
    bulkDiscountPercentage: 50,
    bulkDiscountType: 'all',
    bulkDiscountTarget: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkDiscount, setShowBulkDiscount] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [bulkDiscountLoading, setBulkDiscountLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Get unique brands and categories for filters
  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories.sort();
  }, [products]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?admin=true');
      const data = await response.json();
      console.log('Products data received:', data); // Debug log
      setProducts(data);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProductsMemo = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesBrand = !filters.brand || product.brand === filters.brand;
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesPrice = (!filters.minPrice || product.price >= filters.minPrice) &&
                          (!filters.maxPrice || product.price <= filters.maxPrice);
      const matchesStock = (!filters.minStock || product.stock >= filters.minStock) &&
                          (!filters.maxStock || product.stock <= filters.maxStock);
      
      // Stock status filter
      let matchesStockStatus = true;
      if (filters.stockStatus === 'jashte-stokut') {
        matchesStockStatus = product.stock === 0;
      } else if (filters.stockStatus === 'ne-stok') {
        matchesStockStatus = product.stock > 0;
      }

      // New arrivals filter
      const matchesNewArrivals = !filters.newArrivals || product.isNewArrival === true;

      // Sale filter
      const matchesSale = !filters.onSale || (product.discountPercentage && product.discountPercentage > 0);

      return matchesSearch && matchesBrand && matchesCategory && matchesPrice && matchesStock && matchesStockStatus && matchesNewArrivals && matchesSale;
    });
  }, [products, filters]);

  // Update pagination to use filtered products
  const totalPages = Math.ceil(filteredProductsMemo.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProductsMemo.slice(startIndex, endIndex);

  // Select all logic
  const allCurrentSelected = currentProducts.length > 0 && currentProducts.every(p => selectedProducts.includes(p._id));
  const someCurrentSelected = currentProducts.some(p => selectedProducts.includes(p._id));

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedProducts(prev => prev.filter(id => !currentProducts.some(p => p._id === id)));
    } else {
      setSelectedProducts(prev => [
        ...prev,
        ...currentProducts.filter(p => !prev.includes(p._id)).map(p => p._id)
      ]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm('A jeni të sigurt që doni të fshini produktet e zgjedhura?')) return;
    setBulkDeleteLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedProducts }),
      });
      if (response.ok) {
        setProducts(products.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
      } else {
        setError('Dështoi fshirja e produkteve të zgjedhura');
      }
    } catch {
      setError('Dështoi fshirja e produkteve të zgjedhura');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë produkt?')) {
      setDeleteLoading(id);
      try {
        // Replace with your actual API endpoint
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        setProducts(products.filter(p => p._id !== id));
      } catch {
        setError('Dështoi fshirja e produktit');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleBulkDiscount = async () => {
    if (filteredProductsMemo.length === 0) {
      setError('Nuk ka produkte për të aplikuar zbritjen');
      return;
    }

    // Validate target selection for brand/category specific discounts
    if (filters.bulkDiscountType !== 'all' && !filters.bulkDiscountTarget) {
      setError('Ju lutem zgjidhni një brend ose kategori për zbritjen');
      return;
    }

    setBulkDiscountLoading(true);
    try {
      const response = await fetch('/api/products/bulk-discount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: filteredProductsMemo.map(p => p._id),
          discountPercentage: filters.bulkDiscountPercentage,
          bulkDiscountType: filters.bulkDiscountType,
          bulkDiscountTarget: filters.bulkDiscountTarget,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success result:', result);
        // Refresh products after applying discount
        await fetchProducts();
        
        const action = filters.bulkDiscountPercentage === 0 ? 'u hoq' : 'u aplikua';
        const message = `✅ Zbritja ${action} me sukses në ${result.updatedCount} produkte!`;
        setModalMessage(message);
        setShowSuccessModal(true);
        
        // Hide modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          setModalMessage('');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        const errorMessage = `Dështoi aplikimi i zbritjes: ${errorData.error || 'Gabim i panjohur'}`;
        setModalMessage(errorMessage);
        setShowErrorModal(true);
        
        // Hide modal after 3 seconds
        setTimeout(() => {
          setShowErrorModal(false);
          setModalMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error('Exception during bulk discount:', err);
      const errorMessage = `Gabim gjatë aplikimit të zbritjes: ${err instanceof Error ? err.message : 'Gabim i panjohur'}`;
      setModalMessage(errorMessage);
      setShowErrorModal(true);
      
      // Hide modal after 3 seconds
      setTimeout(() => {
        setShowErrorModal(false);
        setModalMessage('');
      }, 3000);
    } finally {
      setBulkDiscountLoading(false);
    }
  };

  const handleRemoveDiscounts = async () => {
    if (filteredProductsMemo.length === 0) {
      setError('Nuk ka produkte për të hequr zbritjet');
      return;
    }

    // Validate target selection for brand/category specific discounts
    if (filters.bulkDiscountType !== 'all' && !filters.bulkDiscountTarget) {
      setError('Ju lutem zgjidhni një brend ose kategori për zbritjen');
      return;
    }

    setBulkDiscountLoading(true);
    try {
      const response = await fetch('/api/products/bulk-discount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: filteredProductsMemo.map(p => p._id),
          discountPercentage: 0, // Always set to 0 for removal
          bulkDiscountType: filters.bulkDiscountType,
          bulkDiscountTarget: filters.bulkDiscountTarget,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success result:', result);
        // Refresh products after applying discount
        await fetchProducts();
        
        const message = `✅ Zbritjet u hoqën me sukses në ${result.updatedCount} produkte!`;
        setModalMessage(message);
        setShowSuccessModal(true);
        
        // Hide modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          setModalMessage('');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        const errorMessage = `Dështoi heqja e zbritjeve: ${errorData.error || 'Gabim i panjohur'}`;
        setModalMessage(errorMessage);
        setShowErrorModal(true);
        
        // Hide modal after 3 seconds
        setTimeout(() => {
          setShowErrorModal(false);
          setModalMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error('Exception during bulk discount removal:', err);
      const errorMessage = `Gabim gjatë heqjes së zbritjeve: ${err instanceof Error ? err.message : 'Gabim i panjohur'}`;
      setModalMessage(errorMessage);
      setShowErrorModal(true);
      
      // Hide modal after 3 seconds
      setTimeout(() => {
        setShowErrorModal(false);
        setModalMessage('');
      }, 3000);
    } finally {
      setBulkDiscountLoading(false);
    }
  };

  const handleFilterChange = (type: keyof Filters, value: string | number | boolean) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      stockStatus: '',
      newArrivals: false,
      onSale: false,
      showBulkDiscount: false,
      bulkDiscountPercentage: 50,
      bulkDiscountType: 'all',
      bulkDiscountTarget: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, Math.max(currentPage + 2, 5));

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-1 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-1 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
    );

    return pages;
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

    if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">


      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">Sukses!</h3>
              <p className="text-sm text-green-700">{modalMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Gabim!</h3>
              <p className="text-sm text-red-700">{modalMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Lista e Produkteve</h1>
            <p className="mt-1 text-sm text-gray-500">
              Menaxho të gjitha produktet në sistem
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFilter className="mr-2 h-4 w-4" />
              Filtro
            </button>

            <button
              onClick={() => router.push('/admin/products/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Shto Produkt
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {filteredProductsMemo.length} produkte
            {(filters.brand || filters.category || filters.minPrice || filters.maxPrice || filters.minStock || filters.maxStock || filters.stockStatus || filters.newArrivals || filters.onSale) && (
              <span className="ml-2">
                (duke përdorur filtra)
              </span>
            )}
          </div>
          {(filters.brand || filters.category || filters.minPrice || filters.maxPrice || filters.minStock || filters.maxStock || filters.stockStatus || filters.newArrivals || filters.onSale) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaTimes className="mr-1 h-3 w-3" />
              Pastro Filtrot
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Kërko</h3>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Kërko produkte..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Brendi</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option key="all-brands" value="">Të gjitha</option>
                  {uniqueBrands.map(brand => (
                    <option key={`brand-${brand}`} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Kategoria</h3>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option key="all-categories" value="">Të gjitha</option>
                  {uniqueCategories.map(category => (
                    <option key={`category-${category}`} value={category}>{category}</option>
                  ))}
                </select>
              </div>



              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Çmimi (€)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Stock Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Stoku</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minStock}
                    onChange={(e) => handleFilterChange('minStock', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.maxStock}
                    onChange={(e) => handleFilterChange('maxStock', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Stock Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Statusi i Stokut</h3>
                <select
                  value={filters.stockStatus}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Të gjitha</option>
                  <option value="jashte-stokut">Jashtë stokut</option>
                  <option value="ne-stok">Në stok</option>
                </select>
              </div>

              {/* New Arrivals Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Produktet e Reja</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newArrivals"
                    checked={filters.newArrivals}
                    onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="newArrivals" className="text-sm text-gray-700">
                    Vetëm produktet e reja
                  </label>
                </div>
              </div>

              {/* Sale Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Produktet në Zbritje</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="onSale"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    className="w-4 h-4 text-red-600 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <label htmlFor="onSale" className="text-sm text-gray-700">
                    Vetëm produktet në zbritje
                  </label>
                </div>
              </div>

              {/* Bulk Discount Section */}
              <div className="md:col-span-4">
                <div className="border-t pt-6 mt-6">
                  <button
                    onClick={() => setShowBulkDiscount(!showBulkDiscount)}
                    className="w-full flex items-center justify-between text-lg font-medium text-gray-900 mb-4 hover:text-orange-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <FaPercent className="mr-2 h-5 w-5 text-orange-500" />
                      Zbritje Masive
                    </div>
                    <FaChevronDown 
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        showBulkDiscount ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {showBulkDiscount && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Discount Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lloji i Zbritjes
                          </label>
                          <select
                            value={filters.bulkDiscountType}
                            onChange={(e) => handleFilterChange('bulkDiscountType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="all">Të gjitha produktet e filtruara</option>
                            <option value="brand">Brend specifik</option>
                            <option value="category">Kategori specifike</option>
                          </select>
                        </div>

                        {/* Target Selection */}
                        {filters.bulkDiscountType !== 'all' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {filters.bulkDiscountType === 'brand' ? 'Zgjidh Brendin' : 'Zgjidh Kategorinë'}
                            </label>
                            <select
                              value={filters.bulkDiscountTarget}
                              onChange={(e) => handleFilterChange('bulkDiscountTarget', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="">Zgjidh...</option>
                              {filters.bulkDiscountType === 'brand' 
                                ? uniqueBrands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                  ))
                                : uniqueCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                  ))
                              }
                            </select>
                          </div>
                        )}

                        {/* Discount Percentage */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Përqindja e Zbritjes (%)
                          </label>
                          <input
                            type="number"
                            value={filters.bulkDiscountPercentage === 0 ? '' : filters.bulkDiscountPercentage}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                handleFilterChange('bulkDiscountPercentage', 0);
                              } else {
                                handleFilterChange('bulkDiscountPercentage', Number(value));
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                handleFilterChange('bulkDiscountPercentage', 0);
                              }
                            }}
                            min="0"
                            max="99"
                            placeholder="50"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleBulkDiscount}
                          disabled={filteredProductsMemo.length === 0 || 
                                   (filters.bulkDiscountType !== 'all' && !filters.bulkDiscountTarget) ||
                                   filters.bulkDiscountPercentage === 0 ||
                                   bulkDiscountLoading}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkDiscountLoading ? (
                            <>
                              <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                              Duke Aplikuar...
                            </>
                          ) : (
                            <>
                              <FaPercent className="mr-2 h-4 w-4" />
                              Apliko Zbritjen
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleRemoveDiscounts}
                          disabled={filteredProductsMemo.length === 0 || 
                                   (filters.bulkDiscountType !== 'all' && !filters.bulkDiscountTarget) ||
                                   bulkDiscountLoading}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkDiscountLoading ? (
                            <>
                              <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                              Duke Hequr...
                            </>
                          ) : (
                            <>
                              <FaTimes className="mr-2 h-4 w-4" />
                              Hiq Zbritjet
                            </>
                          )}
                        </button>
                      </div>

                      {/* Info Text */}
                      <div className="text-sm text-gray-600">
                        {filters.bulkDiscountType === 'all' && (
                          <span>Do të aplikohet në <strong>{filteredProductsMemo.length}</strong> produkte</span>
                        )}
                        {filters.bulkDiscountType === 'brand' && filters.bulkDiscountTarget && (
                          <span>Do të aplikohet në produktet e brendit <strong>{filters.bulkDiscountTarget}</strong></span>
                        )}
                        {filters.bulkDiscountType === 'category' && filters.bulkDiscountTarget && (
                          <span>Do të aplikohet në produktet e kategorisë <strong>{filters.bulkDiscountTarget}</strong></span>
                        )}
                      </div>

                      {/* Warning */}
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                        <p className="text-sm text-orange-800">
                          <strong>Kujdes:</strong> Kjo veprim do të ndryshojë çmimet e produkteve të zgjedhura.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="mt-6 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Bulk Delete Button (simple, icon only, right aligned) */}
            <div className="p-2 flex items-center justify-end">
              <div className="relative">
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedProducts.length === 0 || bulkDeleteLoading}
                  title="Fshi të zgjedhurat"
                  className="p-2 rounded-full text-white bg-red-500 hover:bg-red-600 disabled:bg-red-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {bulkDeleteLoading ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <FaTrash className="w-5 h-5" />
                  )}
                  {selectedProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center border border-white">
                      {selectedProducts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      ref={el => { if (el) el.indeterminate = !allCurrentSelected && someCurrentSelected; }}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imazhi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titulli
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brendi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Çmimi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stoku
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProducts.map((product) => {
                  const displayImage = getValidImage(product.mainImage, product.images?.[0], product.image);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 relative bg-white flex items-center justify-center rounded overflow-hidden">
                          {displayImage ? (
                            <Image
                              src={displayImage}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="w-12 h-12 object-contain bg-white"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                              <FaImage className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {product.title}
                          {product.isNewArrival && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              NEW
                            </span>
                          )}
                          {product.discountPercentage && product.discountPercentage > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              SALE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {product.brand || 'Të tjera'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {product.category || 'Të tjera'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.discountPercentage && product.discountPercentage > 0 ? (
                          <div className="block">
                            <div className="text-sm line-through text-gray-500">
                              €{product.originalPrice?.toFixed(2)}
                            </div>
                            <div className="text-sm font-bold text-red-600">
                              €{product.price.toFixed(2)}
                              <span className="ml-1">(-{product.discountPercentage}%)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            €{product.price.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-md text-base font-medium ${
                            product.stock === 0
                              ? 'text-red-500 bg-red-100'
                              : product.stock <= 5
                              ? 'text-yellow-500 bg-yellow-100'
                              : 'text-green-500 bg-green-100'
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product._id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ndrysho"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteLoading === product._id}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Fshi"
                          >
                            {deleteLoading === product._id ? (
                              <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                              <FaTrash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {renderPagination()}
            </div>
          </div>
        )}

        {/* No Products Message */}
        {filteredProductsMemo.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="max-w-md mx-auto">
              <FaImage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka produkte</h3>
              <p className="text-gray-500">Nuk u gjetën produkte që përputhen me kriteret e kërkimit.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 
