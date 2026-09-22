'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getValidImage, optimizeImageUrl, hasDisplayPrice } from '@/app/lib/images';
import { formatProductDisplayTitle, getProductPath } from '@/app/lib/product-display';

const SCROLL_RESTORE_KEY = 'listingScrollRestore';

interface Product {
  _id: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock?: number | null;
  brand: string;
  sizes: string;
  image?: string;
  images?: string[];
  mainImage?: string;
  category: string;
  description: string;
  isNewArrival?: boolean;
  subcategory?: string;
  gender?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'admin';
  className?: string;
  onWishlistClick?: () => void;
  isWishlisted?: boolean;
}

function collectImages(product: Product): string[] {
  const candidates = [
    product.mainImage,
    ...(product.images ?? []),
    product.image,
  ].filter((img): img is string => Boolean(img && img.trim()));

  return [...new Set(candidates)];
}

export function saveListingScrollAndGoTop() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    SCROLL_RESTORE_KEY,
    JSON.stringify({
      path: window.location.pathname + window.location.search,
      y: window.scrollY,
    })
  );
  window.scrollTo({ top: 0, behavior: 'auto' });
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { _id, title, price, originalPrice, discountPercentage, brand } = product;
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const images = useMemo(() => collectImages(product), [product]);
  const primaryImage = optimizeImageUrl(
    images[0] ?? getValidImage(product.mainImage, product.images?.[0], product.image),
    { width: 700, quality: 'auto:good' }
  );
  const hoverImage = optimizeImageUrl(
    images.length > 1 ? images[1] : images[0],
    { width: 700, quality: 'auto:good' }
  );
  const hasHoverImage = images.length > 1 && hoverImage !== primaryImage;

  const discountPrice =
    originalPrice && discountPercentage
      ? originalPrice * (1 - discountPercentage / 100)
      : price;

  const productHref = getProductPath({ _id, title });

  const handleNavigate = () => {
    saveListingScrollAndGoTop();
    setIsNavigating(true);
  };

  return (
    <article
      className={`group relative bg-white ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={productHref}
        className="block cursor-pointer"
        onClick={handleNavigate}
        aria-busy={isNavigating}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image
            src={primaryImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-opacity duration-500 ease-in-out ${
              isHovered && hasHoverImage ? 'opacity-0' : 'opacity-100'
            }`}
            priority={false}
          />

          {hasHoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center transition-opacity duration-500 ease-in-out ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />
          )}

          {discountPercentage && discountPercentage > 0 && (
            <span className="absolute left-3 top-3 z-10 bg-red-600 px-2 py-0.5 font-bwseidoround text-[10px] uppercase tracking-wider text-white">
              -{discountPercentage}%
            </span>
          )}

          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-500 ease-in-out ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="block text-center font-bwseidoround text-[10px] uppercase tracking-[0.22em] text-white/95">
              Shiko më shumë
            </span>
          </div>

          <div
            className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] transition-opacity duration-200 ${
              isNavigating ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`h-9 w-9 rounded-full border-2 border-neutral-200 border-t-neutral-900 transition-opacity duration-200 ${
                isNavigating ? 'animate-spin opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </Link>

      <div className="px-2 pt-2 pb-1">
        <p className="font-bwseidoround text-[10px] uppercase tracking-[0.18em] text-neutral-400 leading-none">
          {brand}
        </p>

        <Link href={productHref} className="mt-1.5 block cursor-pointer" onClick={handleNavigate}>
          <h3 className="text-[0.95rem] font-semibold leading-snug tracking-tight text-[#0a9945] line-clamp-2">
            {formatProductDisplayTitle(title)}
          </h3>
        </Link>

        {product.subcategory && (
          <p className="mt-1.5 font-bwseidoround text-[10px] uppercase tracking-[0.14em] text-neutral-500 leading-none">
            {product.subcategory}
          </p>
        )}

        {hasDisplayPrice(price) && (
          <div className="mt-2 flex items-baseline gap-2">
            {discountPercentage && discountPercentage > 0 && hasDisplayPrice(originalPrice) ? (
              <>
                <span className="font-bwseidoround text-sm text-neutral-900">
                  €{discountPrice?.toFixed(2)}
                </span>
                <span className="font-bwseidoround text-xs text-neutral-400 line-through">
                  €{originalPrice?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bwseidoround text-sm text-neutral-900">
                €{price!.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
