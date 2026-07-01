'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface AdminCollection {
  _id: string;
  name: string;
  categories?: string[];
}

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

interface CollectionSelectProps {
  value: string;
  onChange: (collectionId: string, categoryValue: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

/** Category stored on product — matches how collections pull products by category */
export function categoryFromCollection(collection: AdminCollection): string {
  if (collection.categories?.length) {
    return collection.categories[0];
  }
  return collection.name;
}

export default function CollectionSelect({
  value,
  onChange,
  label = 'Koleksioni',
  required = true,
  className = inputClass,
}: CollectionSelectProps) {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/collections');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setCollections(data);
        }
      } catch {
        if (!cancelled) setCollections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCollection = collections.find((c) => c._id === value);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {loading ? (
        <p className="text-sm text-gray-500">Duke ngarkuar koleksionet...</p>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Nuk ka koleksione. Shtoni fillimisht koleksione në{' '}
          <Link href="/admin/products/collections" className="font-semibold underline">
            Menaxho Koleksionet
          </Link>
          .
        </div>
      ) : (
        <>
          <select
            value={value}
            required={required}
            onChange={(e) => {
              const id = e.target.value;
              const col = collections.find((c) => c._id === id);
              onChange(id, col ? categoryFromCollection(col) : '');
            }}
            className={className}
          >
            <option value="">Zgjidh koleksionin</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>
                {col.name}
              </option>
            ))}
          </select>
          {selectedCollection && (
            <p className="mt-1.5 text-xs text-gray-500">
              Produkti do të shfaqet automatikisht në këtë koleksion (kategoria:{' '}
              <span className="font-medium text-gray-700">
                {categoryFromCollection(selectedCollection)}
              </span>
              ).
            </p>
          )}
        </>
      )}
    </div>
  );
}
