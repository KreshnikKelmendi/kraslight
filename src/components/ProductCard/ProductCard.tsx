'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock?: number;
  brand: string;
  sizes: string;
  image?: string;
  images?: string[];
  mainImage?: string;
  category: string;
  description: string;
  isNewArrival?: boolean;
  subcategory?: string; // Added subcategory to the interface
  gender?: string; // Added gender to the interface
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'admin';
  className?: string;
  onWishlistClick?: () => void;
  isWishlisted?: boolean;
}

function getValidImage(...candidates: (string | undefined)[]) {
  return candidates.find(
    (img) => typeof img === 'string' && img.trim().length > 1 && (
      img.trim().startsWith('/') || 
      img.trim().startsWith('http://') || 
      img.trim().startsWith('https://')
    )
  ) || '/images/placeholder.jpg';
}

// Format product title for better display
function formatProductTitle(title: string) {
  return title
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function ProductCard({ 
  product, 
  // removed unused props: variant, onWishlistClick, isWishlisted
  className = ''
}: ProductCardProps) {
  const {
    _id,
    title,
    price,
    originalPrice,
    discountPercentage,
    stock,
    brand
  } = product;

  const [isHovered, setIsHovered] = useState(false);

  // Use mainImage, images[0], image, or placeholder
  const displayImage = getValidImage(product.mainImage, product.images?.[0], product.image);

  // Calculate discount price
  const discountPrice = originalPrice && discountPercentage
    ? originalPrice * (1 - discountPercentage / 100)
    : price;

  return (
    <div 
      className={`group relative bg-white border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-[#0a9945]/30 hover:-translate-y-1 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${_id}`} className="block">
        <div className="relative aspect-[3/4] lg:aspect-auto lg:h-[50vh] overflow-hidden bg-gray-50">
          <Image
            src={displayImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-all duration-500"
            priority={false}
          />
        
        {/* Subtle overlay on hover */}
        <div className={`absolute inset-0 bg-black/5 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Discount Badge */}
          {discountPercentage && discountPercentage > 0 && (
            <div className="bg-red-500 text-white font-medium px-1.5 py-0.5 rounded text-xs shadow-sm">
              -{discountPercentage}%
            </div>
          )}
          
          {/* New Arrivals Badge */}
          {product.isNewArrival && (
            <div className="bg-emerald-500 text-white font-medium px-1.5 py-0.5 rounded text-xs shadow-sm">
              NEW
            </div>
          )}
        </div>

        {/* Stock Status */}
        {stock !== undefined && stock > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm text-green-600 px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
              In Stock
            </span>
          </div>
        )}

        {/* Quick View Button */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-sm">Quick View</span>
              <FaEye className="text-xs" />
            </div>
          </div>
        </div>
      </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {brand}
          </span>
        </div>

        {/* Title */}
        <Link href={`/products/${_id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-gray-700 transition-colors leading-tight">
            {formatProductTitle(title)}
          </h3>
        </Link>
        {/* Subcategory Badge */}
        {product.subcategory && (
          <div className="inline-block mb-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-semibold">
            {product.subcategory}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {discountPercentage && discountPercentage > 0 ? (
              <>
                <span className="text-lg font-semibold text-gray-900">
                  €{discountPrice.toFixed(2)}
                </span>
                <span className="text-sm line-through text-gray-400">
                  €{originalPrice?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                €{price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Subtle arrow indicator */}
          <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-gray-200' : ''}`}>
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 