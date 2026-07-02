'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchCachedJson,
  seedFetchCache,
} from '@/app/lib/client-fetch-cache';
import type {
  StorefrontCollection,
  StorefrontGlobalDiscount,
  StorefrontShellData,
} from '@/app/lib/storefront-data';

interface StorefrontDataContextValue {
  collections: StorefrontCollection[];
  globalDiscount: StorefrontGlobalDiscount;
  isLoadingCollections: boolean;
}

const StorefrontDataContext = createContext<StorefrontDataContextValue | null>(null);

export function StorefrontDataProvider({
  initialData,
  children,
}: {
  initialData: StorefrontShellData;
  children: ReactNode;
}) {
  const [collections, setCollections] = useState<StorefrontCollection[]>(
    initialData.collections
  );
  const [globalDiscount, setGlobalDiscount] = useState<StorefrontGlobalDiscount>(
    initialData.globalDiscount
  );
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  useEffect(() => {
    seedFetchCache('/api/collections', initialData.collections);
    seedFetchCache('/api/products/bulk-discount', initialData.globalDiscount);

    if (initialData.collections.length > 0) {
      return;
    }

    let cancelled = false;
    setIsLoadingCollections(true);

    Promise.all([
      fetchCachedJson<StorefrontCollection[]>('/api/collections'),
      fetchCachedJson<StorefrontGlobalDiscount>('/api/products/bulk-discount').catch(
        () => ({ isGlobalDiscount: false })
      ),
    ])
      .then(([collectionsData, discountData]) => {
        if (cancelled) return;
        setCollections(collectionsData);
        setGlobalDiscount(discountData);
      })
      .catch((error) => {
        console.error('Failed to load storefront data:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCollections(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialData.collections, initialData.globalDiscount]);

  const value = useMemo(
    () => ({ collections, globalDiscount, isLoadingCollections }),
    [collections, globalDiscount, isLoadingCollections]
  );

  return (
    <StorefrontDataContext.Provider value={value}>
      {children}
    </StorefrontDataContext.Provider>
  );
}

export function useStorefrontData() {
  const context = useContext(StorefrontDataContext);
  if (!context) {
    throw new Error('useStorefrontData must be used within StorefrontDataProvider');
  }
  return context;
}

export function useOptionalStorefrontData() {
  return useContext(StorefrontDataContext);
}
