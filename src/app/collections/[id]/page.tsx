"use client";

import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FaTimes, FaFilter, FaSearch, FaTimesCircle, FaChevronDown } from 'react-icons/fa';
import ProductCard, { persistListingState } from '@/components/ProductCard/ProductCard';
import { fetchCachedJson } from '@/app/lib/client-fetch-cache';
import { matchesFilterSelection, uniqueFilterValues } from '@/app/lib/filter-values';
import { WhatsAppBarButton } from '@/app/components/WhatsAppButton/WhatsAppButton';
import {
  getCollectionPath,
  looksLikeCollectionId,
} from '@/app/lib/product-display';

const SCROLL_RESTORE_KEY = 'listingScrollRestore';

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
  characteristics?: Array<{ key: string; value: string }>;
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
  /** Specifika key → selected values */
  specs: Record<string, string[]>;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

type ListingRestore = {
  path: string;
  y?: number;
  productId?: string;
  page?: number;
  sortBy?: SortOption;
  filters?: Filters;
};

const MOBILE_FILTER_MS = 320;
const PRODUCTS_PER_PAGE = 20;
const FILTER_LOADING_MS = 400;

function parseSpecNumber(value: string): number {
  const match = value.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function sortSpecValues(key: string, values: string[]): string[] {
  const unique = uniqueFilterValues(values);
  if (key.trim().toLowerCase() === 'fuqia') {
    return [...unique].sort((a, b) => {
      const diff = parseSpecNumber(a) - parseSpecNumber(b);
      if (diff !== 0) return diff;
      return a.localeCompare(b, 'sq', { sensitivity: 'base' });
    });
  }
  return unique;
}

const ALLOWED_SPEC_KEYS = ['fuqia', 'ngjyra', 'forma'] as const;

function normalizeSpecKey(key: string): string {
  return key.trim().toLowerCase();
}

function buildAvailableSpecs(
  products: Product[]
): Array<{ key: string; values: string[] }> {
  const map = new Map<string, { label: string; values: string[] }>();

  for (const product of products) {
    for (const char of product.characteristics ?? []) {
      const key = char.key?.trim();
      const value = char.value?.trim();
      if (!key || !value) continue;
      const normalized = normalizeSpecKey(key);
      if (!(ALLOWED_SPEC_KEYS as readonly string[]).includes(normalized)) continue;
      const existing = map.get(normalized) ?? { label: key, values: [] };
      existing.values.push(value);
      map.set(normalized, existing);
    }
  }

  return ALLOWED_SPEC_KEYS.map((normalized) => {
    const entry = map.get(normalized);
    if (!entry) return null;
    return {
      key: entry.label,
      values: sortSpecValues(entry.label, entry.values),
    };
  }).filter((entry): entry is { key: string; values: string[] } =>
    Boolean(entry && entry.values.length > 0)
  );
}

function countSelectedSpecs(specs: Record<string, string[]>): number {
  return Object.values(specs).reduce((sum, values) => sum + values.length, 0);
}

function productMatchesSpecs(
  product: Product,
  selectedSpecs: Record<string, string[]>
): boolean {
  const entries = Object.entries(selectedSpecs).filter(([, values]) => values.length > 0);
  if (entries.length === 0) return true;

  const chars = product.characteristics ?? [];
  return entries.every(([key, values]) =>
    values.some((selected) =>
      chars.some(
        (c) =>
          c.key?.trim().toLowerCase() === key.trim().toLowerCase() &&
          c.value?.trim().toLowerCase() === selected.trim().toLowerCase()
      )
    )
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
  prominent = false,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  prominent?: boolean;
}) {
  return (
    <div
      className={`border-b border-neutral-100 last:border-b-0 ${
        prominent ? 'rounded-lg border border-neutral-200 bg-neutral-50/70 p-2.5' : 'pb-2 mb-2'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-neutral-50"
      >
        <span
          className={`font-bwseidoround font-semibold text-neutral-900 ${
            prominent ? 'text-[15px]' : 'text-sm'
          }`}
        >
          {title}
        </span>
        <FaChevronDown
          className={`text-neutral-400 transition-transform duration-300 ease-out ${
            expanded ? 'rotate-180' : 'rotate-0'
          }`}
          size={prominent ? 13 : 11}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className={`pt-0.5 ${prominent ? 'max-h-64 space-y-2 overflow-y-auto pr-0.5' : 'space-y-0'}`}>
            {children}
          </div>
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
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-neutral-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
      />
      <span className="font-bwseidoround text-sm text-neutral-700">{label}</span>
    </label>
  );
}

function FilterPanelContent({
  availableBrands,
  availableSubcategories,
  availableSpecs,
  filters,
  expandedFilters,
  setExpandedFilters,
  handleBrandFilter,
  handleSubcategoryFilter,
  handleSpecFilter,
}: {
  availableBrands: string[];
  availableSubcategories: string[];
  availableSpecs: Array<{ key: string; values: string[] }>;
  filters: Filters;
  expandedFilters: { brands: boolean; subcategories: boolean; specs: boolean };
  setExpandedFilters: React.Dispatch<
    React.SetStateAction<{ brands: boolean; subcategories: boolean; specs: boolean }>
  >;
  handleBrandFilter: (brand: string) => void;
  handleSubcategoryFilter: (subcategory: string) => void;
  handleSpecFilter: (key: string, value: string) => void;
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

      {availableSpecs.length > 0 && (
        <FilterSection
          title="Specifikat"
          prominent
          expanded={expandedFilters.specs}
          onToggle={() => setExpandedFilters((prev) => ({ ...prev, specs: !prev.specs }))}
        >
          {availableSpecs.map(({ key, values }) => {
            const normalized = normalizeSpecKey(key);
            const valuesClass =
              normalized === 'fuqia'
                ? 'grid grid-cols-3 gap-x-1 gap-y-0'
                : normalized === 'ngjyra'
                  ? 'grid grid-cols-2 gap-x-1 gap-y-0'
                  : 'space-y-0';
            return (
              <div key={key} className="rounded-md border border-neutral-200/70 bg-white px-1.5 py-1.5">
                <p className="mb-0.5 px-1 font-bwseidoround text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {key}
                </p>
                <div className={valuesClass}>
                  {values.map((value) => (
                    <CheckboxFilter
                      key={`${key}-${value}`}
                      label={value}
                      checked={(filters.specs[key] ?? []).includes(value)}
                      onChange={() => handleSpecFilter(key, value)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </FilterSection>
      )}
    </>
  );
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

  if (showLeftEllipsis) {
    items.push('ellipsis');
  } else if (totalPages > 1) {
    items.push(2);
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page++) {
    if (page !== 1 && page !== totalPages && !items.includes(page)) {
      items.push(page);
    }
  }

  if (showRightEllipsis) {
    items.push('ellipsis');
  } else if (!items.includes(totalPages - 1) && totalPages - 1 > 1) {
    items.push(totalPages - 1);
  }

  if (!items.includes(totalPages)) {
    items.push(totalPages);
  }

  return items;
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

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1 font-bwseidoround text-sm text-neutral-600"
      aria-label="Pagination"
    >
      <button
        type="button"
        aria-label="Faqja e mëparshme"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="cursor-pointer rounded px-2 py-1.5 transition-colors enabled:hover:bg-neutral-100 enabled:hover:text-[#0a9945] disabled:cursor-not-allowed disabled:opacity-30"
      >
        ‹
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-neutral-400" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`min-w-8 cursor-pointer rounded px-2 py-1.5 transition-colors ${
              currentPage === item
                ? 'bg-[#0a9945] font-medium text-white'
                : 'hover:bg-neutral-100 hover:text-[#0a9945]'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Faqja e radhës"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="cursor-pointer rounded px-2 py-1.5 transition-colors enabled:hover:bg-neutral-100 enabled:hover:text-[#0a9945] disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>
    </nav>
  );
}

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const restoreScrollYRef = useRef<number | null>(null);
  const restoreProductIdRef = useRef<string | null>(null);
  const restoredPageRef = useRef<number | null>(null);
  const didRestoreRef = useRef(false);

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: null,
    categories: [],
    brands: [],
    subcategories: [],
    specs: {},
  });
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [availableSpecs, setAvailableSpecs] = useState<Array<{ key: string; values: string[] }>>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [mobileFiltersMounted, setMobileFiltersMounted] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brands: true,
    subcategories: true,
    specs: true,
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
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (didRestoreRef.current) return;

    const pathOnly = window.location.pathname;
    const raw = sessionStorage.getItem(SCROLL_RESTORE_KEY);

    if (raw) {
      try {
        const saved = JSON.parse(raw) as ListingRestore;
        const savedPath = (saved.path || '').split('?')[0];
        if (savedPath === pathOnly) {
          didRestoreRef.current = true;
          sessionStorage.removeItem(SCROLL_RESTORE_KEY);

          if (saved.filters) setFilters(saved.filters);
          if (saved.sortBy) setSortBy(saved.sortBy);

          const page =
            typeof saved.page === 'number' && saved.page > 0 ? saved.page : 1;
          restoredPageRef.current = page;
          setCurrentPage(page);

          const params = new URLSearchParams(window.location.search);
          if (page <= 1) params.delete('page');
          else params.set('page', String(page));
          const qs = params.toString();
          router.replace(qs ? `${pathOnly}?${qs}` : pathOnly, { scroll: false });

          if (typeof saved.productId === 'string' && saved.productId) {
            restoreProductIdRef.current = saved.productId;
          }
          if (typeof saved.y === 'number') {
            restoreScrollYRef.current = saved.y;
          }
          return;
        }
      } catch {
        sessionStorage.removeItem(SCROLL_RESTORE_KEY);
      }
    }

    const pageParam = Number(new URLSearchParams(window.location.search).get('page'));
    if (pageParam > 1) {
      restoredPageRef.current = pageParam;
      setCurrentPage(pageParam);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    persistListingState({
      path: pathname,
      page: currentPage,
      sortBy,
      filters,
    });
  }, [pathname, currentPage, sortBy, filters]);

  async function fetchCollection(id: string) {
    try {
      const data = await fetchCachedJson<Collection & { products: Product[] }>(
        `/api/collections/${encodeURIComponent(id)}`
      );
      if (data.products) {
        data.products = data.products.sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }

      const prettyPath = getCollectionPath(data);
      if (looksLikeCollectionId(id) && prettyPath !== `/collections/${id}`) {
        router.replace(prettyPath);
      }

      setCollection(data);

      setAvailableBrands(uniqueFilterValues(data.products.map((p: Product) => p.brand)));
      setAvailableSubcategories(uniqueFilterValues(data.products.map((p: Product) => p.subcategory)));
      setAvailableSpecs(buildAvailableSpecs(data.products));

      if (typeof window !== 'undefined' && restoreScrollYRef.current == null && !didRestoreRef.current) {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('Failed to load collection. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const resetToFirstPage = useCallback(() => {
    restoredPageRef.current = null;
    setCurrentPage(1);
    if (!pathname) return;
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    );
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router]);

  const handleBrandFilter = (brand: string) => {
    resetToFirstPage();
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const handleSubcategoryFilter = (subcategory: string) => {
    resetToFirstPage();
    setFilters((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(subcategory)
        ? prev.subcategories.filter((s) => s !== subcategory)
        : [...prev.subcategories, subcategory],
    }));
  };

  const handleSpecFilter = (key: string, value: string) => {
    resetToFirstPage();
    setFilters((prev) => {
      const current = prev.specs[key] ?? [];
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const nextSpecs = { ...prev.specs };
      if (nextValues.length === 0) {
        delete nextSpecs[key];
      } else {
        nextSpecs[key] = nextValues;
      }
      return { ...prev, specs: nextSpecs };
    });
  };

  const clearFilters = () => {
    resetToFirstPage();
    setFilters({
      type: null,
      categories: [],
      brands: [],
      subcategories: [],
      specs: {},
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
        const matchesCategory = matchesFilterSelection(product.category, filters.categories);
        const matchesBrand = matchesFilterSelection(product.brand, filters.brands);
        const matchesSubcategory = matchesFilterSelection(product.subcategory, filters.subcategories);
        const matchesSpecs = productMatchesSpecs(product, filters.specs);
        return (
          matchesType &&
          matchesCategory &&
          matchesBrand &&
          matchesSubcategory &&
          matchesSpecs
        );
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

      if (restoredPageRef.current != null) {
        const page = restoredPageRef.current;
        const maxPage = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
        setCurrentPage(Math.min(page, maxPage));
        restoredPageRef.current = null;
      }

      setFilterLoading(false);
    }, FILTER_LOADING_MS);

    return () => window.clearTimeout(timer);
  }, [collection, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    if (loading || filterLoading || !collection) return;
    if (restoreProductIdRef.current == null && restoreScrollYRef.current == null) return;

    const productId = restoreProductIdRef.current;
    const y = restoreScrollYRef.current;
    let done = false;

    const restorePosition = () => {
      if (done) return true;

      if (productId) {
        const el = document.querySelector(
          `[data-product-id="${CSS.escape(productId)}"]`
        ) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'auto' });
          done = true;
          restoreProductIdRef.current = null;
          restoreScrollYRef.current = null;
          return true;
        }
      }

      if (typeof y === 'number') {
        window.scrollTo({ top: y, behavior: 'auto' });
      }
      return false;
    };

    const timers = [0, 50, 120, 250, 450, 700, 1100].map((delay) =>
      window.setTimeout(() => {
        if (restorePosition()) return;
        if (delay >= 1100) {
          restoreProductIdRef.current = null;
          restoreScrollYRef.current = null;
        }
      }, delay)
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [
    loading,
    filterLoading,
    collection,
    safePage,
    paginatedProducts.map((p) => p._id).join(','),
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    restoredPageRef.current = null;
    setCurrentPage(page);

    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    );
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(nextUrl, { scroll: false });

    persistListingState({
      path: pathname,
      page,
      sortBy,
      filters,
    });

    window.scrollTo(0, 0);
  };

  const handleSortChange = (value: SortOption) => {
    if (value === sortBy) return;
    resetToFirstPage();
    setSortBy(value);
  };

  const filterPanelProps = {
    availableBrands,
    availableSubcategories,
    availableSpecs,
    filters,
    expandedFilters,
    setExpandedFilters,
    handleBrandFilter,
    handleSubcategoryFilter,
    handleSpecFilter,
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
    filters.brands.length +
    filters.subcategories.length +
    filters.categories.length +
    countSelectedSpecs(filters.specs);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-4 lg:px-10 lg:py-6 2xl:px-24">
      <div className="flex gap-6 lg:gap-10 2xl:gap-12">
      <aside className="sticky top-28 hidden max-h-[calc(100vh-7rem)] w-80 shrink-0 self-start overflow-y-auto rounded-xl border border-neutral-200 bg-white px-4 py-4 lg:block xl:w-96">
        <div className="mb-4 flex items-center justify-between">
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
        <div className="pb-28 pt-3 lg:pb-8 lg:pt-0">
          <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-neutral-200/70 pb-2.5 lg:mb-5 lg:pb-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-bwseidoround text-lg font-medium tracking-tight text-neutral-900 sm:text-xl lg:text-2xl lg:font-light truncate">
                {collection.name}
              </h1>
              {totalPages > 1 && !filterLoading && (
                <p className="mt-0.5 font-bwseidoround text-xs text-neutral-400 sm:text-sm">
                  Faqja {safePage} / {totalPages}
                </p>
              )}
            </div>

            <label className="relative shrink-0">
              <span className="sr-only">Rendit</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="cursor-pointer appearance-none rounded-lg border border-neutral-900 bg-white py-2.5 pl-3.5 pr-8 font-bwseidoround text-xs text-neutral-900 transition-colors hover:bg-neutral-50 focus:outline-none sm:text-sm"
              >
                <option value="default" disabled>
                  Rendit
                </option>
                <option value="price-asc">Çmimi: më i ulët</option>
                <option value="price-desc">Çmimi: më i larti</option>
                <option value="name-asc">Emri: A-Z</option>
                <option value="name-desc">Emri: Z-A</option>
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>
          </div>

          {filterLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
              <p className="mt-4 font-bwseidoround text-sm text-neutral-500">Duke filtruar...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-5 xl:gap-y-10">
                {paginatedProducts.map((product: Product) => (
                  <div key={product._id} data-product-id={product._id}>
                    <ProductCard
                      product={{
                        ...product,
                        stock: undefined,
                        description: product.description || '',
                      }}
                    />
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={safePage}
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
      </div>

      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-neutral-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={openMobileFilters}
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 border-r border-neutral-200 bg-white py-3 font-bwseidoround text-sm text-neutral-900 transition-colors active:bg-neutral-100"
          >
            <FaFilter size={14} />
            Shfaq filtrat
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <WhatsAppBarButton variant="bar" />
        </div>
      </div>
    </div>
  );
}
