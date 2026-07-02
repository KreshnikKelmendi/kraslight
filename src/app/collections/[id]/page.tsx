"use client";

import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { FaTimes, FaFilter, FaSearch, FaTimesCircle, FaChevronDown } from 'react-icons/fa';
import ProductCard from '@/components/ProductCard/ProductCard';
import { fetchCachedJson } from '@/app/lib/client-fetch-cache';

interface Product {
  _id: string;
  title: string;
  image: string;
  images?: string[];
  mainImage?: string;
  price?: number;
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
  createdAt?: string;
}

interface Collection {
  _id: string;
  name: string;
  description?: string;
  image: string;
  products: Product[];
}

interface Filters {
  type: string | null;
  categories: string[];
  brands: string[];
  subcategories: string[];
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const MOBILE_FILTER_MS = 320;
const PRODUCTS_PER_PAGE = 16;
const FILTER_LOADING_MS = 400;

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-100 pb-4 mb-4 last:mb-0">
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-50"
      >
        <span className="font-bwseidoround text-sm font-semibold text-neutral-900">{title}</span>
        <FaChevronDown
          className={`text-neutral-400 transition-transform duration-300 ease-out ${
            expanded ? 'rotate-180' : 'rotate-0'
          }`}
          size={12}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-neutral-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
      />
      <span className="font-bwseidoround text-sm text-neutral-700">{label}</span>
    </label>
  );
}

function FilterPanelContent({
  availableBrands,
  availableSubcategories,
  filters,
  expandedFilters,
  setExpandedFilters,
  handleBrandFilter,
  handleSubcategoryFilter,
}: {
  availableBrands: string[];
  availableSubcategories: string[];
  filters: Filters;
  expandedFilters: { brands: boolean; subcategories: boolean };
  setExpandedFilters: React.Dispatch<React.SetStateAction<{ brands: boolean; subcategories: boolean }>>;
  handleBrandFilter: (brand: string) => void;
  handleSubcategoryFilter: (subcategory: string) => void;
}) {
  return (
    <>
      {availableBrands.length > 0 && (
        <FilterSection
          title="Brendet"
          expanded={expandedFilters.brands}
          onToggle={() => setExpandedFilters((prev) => ({ ...prev, brands: !prev.brands }))}
        >
          {availableBrands.map((brand) => (
            <CheckboxFilter
              key={brand}
              label={brand}
              checked={filters.brands.includes(brand)}
              onChange={() => handleBrandFilter(brand)}
            />
          ))}
        </FilterSection>
      )}

      {availableSubcategories.length > 0 && (
        <FilterSection
          title="Nënkategoritë"
          expanded={expandedFilters.subcategories}
          onToggle={() => setExpandedFilters((prev) => ({ ...prev, subcategories: !prev.subcategories }))}
        >
          {availableSubcategories.map((subcategory) => (
            <CheckboxFilter
              key={subcategory}
              label={subcategory}
              checked={filters.subcategories.includes(subcategory)}
              onChange={() => handleSubcategoryFilter(subcategory)}
            />
          ))}
        </FilterSection>
      )}
    </>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`min-w-10 cursor-pointer rounded-md border px-3 py-2 font-bwseidoround text-sm transition-colors ${
            currentPage === page
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900'
          }`}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}

export default function CollectionPage() {
  const params = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: null,
    categories: [],
    brands: [],
    subcategories: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [mobileFiltersMounted, setMobileFiltersMounted] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brands: true,
    subcategories: true,
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const openMobileFilters = useCallback(() => {
    setMobileFiltersMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsMobileFiltersOpen(true));
    });
  }, []);

  const closeMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(false);
  }, []);

  useEffect(() => {
    if (params?.id) fetchCollection(params.id as string);
  }, [params?.id]);

  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
      return;
    }

    if (!mobileFiltersMounted) return;

    const timer = window.setTimeout(() => {
      setMobileFiltersMounted(false);
      document.body.style.overflow = '';
    }, MOBILE_FILTER_MS);

    return () => window.clearTimeout(timer);
  }, [isMobileFiltersOpen, mobileFiltersMounted]);

  useEffect(() => {
    if (loading || !collection) return;

    const raw = sessionStorage.getItem('listingScrollRestore');
    if (!raw) return;

    try {
      const { path, y } = JSON.parse(raw) as { path: string; y: number };
      const current = window.location.pathname + window.location.search;
      if (path === current && typeof y === 'number') {
        sessionStorage.removeItem('listingScrollRestore');
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'auto' });
        });
      }
    } catch {
      sessionStorage.removeItem('listingScrollRestore');
    }
  }, [loading, collection]);

  async function fetchCollection(id: string) {
    try {
      const data = await fetchCachedJson<Collection & { products: Product[] }>(
        `/api/collections/${id}`
      );
      if (data.products) {
        data.products = data.products.sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }
      setCollection(data);

      const brands = Array.from(new Set(data.products.map((p: Product) => p.brand).filter(Boolean)));
      setAvailableBrands(brands as string[]);

      const subcategories = Array.from(
        new Set(data.products.map((p: Product) => p.subcategory).filter(Boolean))
      );
      setAvailableSubcategories(subcategories as string[]);

      if (typeof window !== 'undefined') {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('Failed to load collection. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const handleBrandFilter = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const handleSubcategoryFilter = (subcategory: string) => {
    setFilters((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategory)
        ? prev.subcategories.filter((s) => s !== subcategory)
        : [...prev.subcategories, subcategory],
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: null,
      categories: [],
      brands: [],
      subcategories: [],
    });
  };

  useEffect(() => {
    if (!collection) {
      setFilteredProducts([]);
      setFilterLoading(false);
      return;
    }

    setFilterLoading(true);
    const timer = window.setTimeout(() => {
      const filtered = collection.products.filter((product) => {
        const matchesType = !filters.type || product.category === filters.type;
        const matchesCategory =
          filters.categories.length === 0 || filters.categories.includes(product.category);
        const matchesBrand =
          filters.brands.length === 0 || filters.brands.includes(product.brand);
        const matchesSubcategory =
          filters.subcategories.length === 0 ||
          filters.subcategories.includes(product.subcategory || '');
        return matchesType && matchesCategory && matchesBrand && matchesSubcategory;
      });

      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => {
            const priceA = a.price ?? Infinity;
            const priceB = b.price ?? Infinity;
            return priceA - priceB;
          });
          break;
        case 'price-desc':
          filtered.sort((a, b) => {
            const priceA = a.price ?? -Infinity;
            const priceB = b.price ?? -Infinity;
            return priceB - priceA;
          });
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
        default:
          filtered.sort(
            (a: Product, b: Product) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          break;
      }

      setFilteredProducts(filtered);
      setCurrentPage(1);
      setFilterLoading(false);
    }, FILTER_LOADING_MS);

    return () => window.clearTimeout(timer);
  }, [collection, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterPanelProps = {
    availableBrands,
    availableSubcategories,
    filters,
    expandedFilters,
    setExpandedFilters,
    handleBrandFilter,
    handleSubcategoryFilter,
  };

  if (loading) {
    return <PageLoadingSpinner className="min-h-screen" label="Duke ngarkuar koleksionin" />;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!collection) return null;

  const activeFilterCount =
    filters.brands.length + filters.subcategories.length + filters.categories.length;

  return (
    <div className="flex min-h-screen bg-neutral-50 py-6 lg:py-10">
      <aside className="sticky top-28 hidden max-h-[calc(100vh-7rem)] w-72 shrink-0 self-start overflow-y-auto border-r border-neutral-200 bg-white px-6 py-8 lg:block xl:w-80">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFilter className="text-neutral-500" size={14} />
            <h2 className="font-bwseidoround text-sm font-semibold uppercase tracking-[0.15em] text-neutral-900">
              Filtro
            </h2>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="flex cursor-pointer items-center gap-1 font-bwseidoround text-xs text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <FaTimesCircle size={12} />
            Pastro
          </button>
        </div>
        <FilterPanelContent {...filterPanelProps} />
      </aside>

      {mobileFiltersMounted && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!isMobileFiltersOpen}>
          <button
            type="button"
            aria-label="Close filters"
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${
              isMobileFiltersOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileFilters}
          />
          <div
            className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-neutral-600" />
                <h2 className="font-bwseidoround text-base font-semibold text-neutral-900">Filtro</h2>
              </div>
              <button
                type="button"
                onClick={closeMobileFilters}
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-neutral-100"
                aria-label="Close filters"
              >
                <FaTimes className="text-neutral-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <FilterPanelContent {...filterPanelProps} />
            </div>

            <div className="border-t border-neutral-200 bg-neutral-50 p-4">
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  closeMobileFilters();
                }}
                className="w-full cursor-pointer rounded-md border border-neutral-900 bg-white py-3 font-bwseidoround text-sm text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Pastro filtrat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="px-4 py-8 pb-28 lg:px-10 2xl:px-24 lg:py-12 lg:pb-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-bwseidoround text-2xl font-light tracking-tight text-neutral-900 sm:text-3xl">
                {collection.name}
              </h1>
              <p className="mt-2 font-bwseidoround text-sm text-neutral-500">
                {filteredProducts.length} produkte
                {totalPages > 1 && !filterLoading && (
                  <span className="text-neutral-400">
                    {' '}
                    · Faqja {currentPage} / {totalPages}
                  </span>
                )}
              </p>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="cursor-pointer rounded-md border border-neutral-200 bg-white px-3 py-2.5 font-bwseidoround text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
            >
              <option value="default" disabled>
                Rendit
              </option>
              <option value="price-asc">Çmimi: më i ulët</option>
              <option value="price-desc">Çmimi: më i larti</option>
              <option value="name-asc">Emri: A-Z</option>
              <option value="name-desc">Emri: Z-A</option>
            </select>
          </div>

          {filterLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
              <p className="mt-4 font-bwseidoround text-sm text-neutral-500">Duke filtruar...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-14">
                {paginatedProducts.map((product: Product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      stock: undefined,
                      description: product.description || '',
                    }}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </>
          ) : (
            <div className="rounded-md border border-neutral-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                <FaSearch className="text-neutral-500" />
              </div>
              <h3 className="font-bwseidoround text-lg text-neutral-900">Nuk ka produkte të gjetura</h3>
              <p className="mt-2 font-bwseidoround text-sm text-neutral-500">
                Provoni të ndryshoni filtrat për të gjetur produkte të tjera.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 cursor-pointer border border-neutral-900 px-5 py-2.5 font-bwseidoround text-sm text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Pastro filtrat
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={openMobileFilters}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-900 bg-white py-3 font-bwseidoround text-sm text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <FaFilter size={14} />
          Shfaq filtrat
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
