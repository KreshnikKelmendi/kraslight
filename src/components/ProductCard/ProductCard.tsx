'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getValidImage, optimizeImageUrl, hasDisplayPrice } from '@/app/lib/images';

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

function formatProductTitle(title: string) {
  return title
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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

  const productHref = `/products/${_id}`;

  const handleImageClick = () => {
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
        onClick={handleImageClick}
        aria-busy={isNavigating}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <div
            className={`absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
              isHovered && hasHoverImage ? '-translate-y-full' : 'translate-y-0'
            }`}
          >
            <Image
              src={primaryImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              priority={false}
            />
          </div>

          {hasHoverImage && (
            <div
              className={`absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                isHovered ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                aria-hidden
              />
            </div>
          )}

          {discountPercentage && discountPercentage > 0 && (
            <span className="absolute left-3 top-3 z-10 bg-neutral-900 px-2 py-0.5 font-bwseidoround text-[10px] uppercase tracking-wider text-white">
              -{discountPercentage}%
            </span>
          )}

          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/50 via-black/20 to-transparent px-4 pb-4 pt-16 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <span className="font-bwseidoround text-xs uppercase tracking-[0.2em] text-white">
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

      <div className="space-y-2 px-1 pt-4">
        <p className="font-bwseidoround text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          {brand}
        </p>

        <Link href={productHref} className="block cursor-pointer">
          <h3 className="font-bwseidoround text-sm leading-snug text-neutral-900 line-clamp-2 transition-colors group-hover:text-neutral-600">
            {formatProductTitle(title)}
          </h3>
        </Link>

        {product.subcategory && (
          <span className="inline-block font-bwseidoround text-[10px] uppercase tracking-wider text-neutral-500">
            {product.subcategory}
          </span>
        )}

        {hasDisplayPrice(price) && (
          <div className="flex items-baseline gap-2 pt-1">
            {discountPercentage && discountPercentage > 0 && hasDisplayPrice(originalPrice) ? (
              <>
                <span className="font-bwseidoround text-base text-neutral-900">
                  €{discountPrice?.toFixed(2)}
                </span>
                <span className="font-bwseidoround text-xs text-neutral-400 line-through">
                  €{originalPrice?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bwseidoround text-base text-neutral-900">
                €{price!.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
