'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import { FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  brand: string;
  gender: string;
  category: string;
  isNewArrival?: boolean;
  stock?: number;
  sizes: string;
  description: string;
  images?: string[];
  mainImage?: string;
  subcategory?: string;
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

function formatProductTitle(title: string) {
  return title
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const NewArrivalsCarousel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false); // NEW
  const { ref: sectionRef, inView: titleInView } = useInView({ threshold: 0.3, triggerOnce: true });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Fetch new arrivals products
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setError(null);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const newArrivalsProducts = data.filter((product: Product) => product.isNewArrival === true);
        setProducts(newArrivalsProducts);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setError('Failed to load new arrivals');
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  const productsPerView = mounted && isMobile ? 2 : 5;
  const maxIndex = Math.max(0, products.length - productsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => {
      if (prev >= maxIndex) return 0; // Loop to start
      return Math.min(prev + 1, maxIndex);
    });
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  // Auto-slide effect
  useEffect(() => {
    if (products.length <= productsPerView) return; // No need to auto-slide
    if (isCarouselHovered) return; // Pause on hover
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, [products.length, productsPerView, maxIndex, isCarouselHovered]);

  const visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 font-light tracking-wide">Duke ngarkuar produktet e reja...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600 font-light tracking-wide">Gabim në ngarkimin e produkteve. Ju lutem provoni përsëri.</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-10 lg:py-20" ref={sectionRef}
      onMouseEnter={() => setIsCarouselHovered(true)}
      onMouseLeave={() => setIsCarouselHovered(false)}
    >
      <div className=" mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-0 lg:mb-12">
          {/* Left Side - Title */}
          <div className="text-left mb-6 lg:mb-0">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold mb-1 font-bwseidoround"
            >
              Arritjet e reja
            </motion.h2>
          
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm lg:text-base text-gray-500 max-w-lg font-bwseidoround"
            >
              Zbuloni koleksionet më të fundit dhe produktet e reja që sapo kanë mbërritur në Kraslight
            </motion.p>
          </div>
          
          {/* Right Side - Button */}
          <div className="flex justify-center lg:justify-end w-full lg:w-auto">
            <Link
              href="/shop/new-arrivals"
              className="hidden lg:w-auto lg:inline-flex items-center lg:justify-center text-[#0a9945] lg:px-8 py-3 rounded-xl hover:from-gray-800 hover:to-[#0a9945] transition-all duration-300 hover:shadow-xl group"
            >
              <span className="mr-2 font-bwseidoround border-b-2">Shiko të gjitha</span>
              <FaChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Mobile Only: Button above images, right aligned */}
          <div className="flex justify-end mb-2 lg:hidden">
            <Link
              href="/shop/new-arrivals"
              className="inline-flex items-center text-[#0a9945] px-4 py-2 rounded-xl hover:from-gray-800 hover:to-[#0a9945] transition-all duration-300 hover:shadow-xl group"
            >
              <span className="mr-2 font-bwseidoround underline underline-offset-[5px]">Shiko të gjitha</span>
              <FaChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white group"
            >
              <FaChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-[#0a9945] transition-colors" />
            </button>
          )}
          
          {currentIndex < maxIndex && (
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white group"
            >
              <FaChevronRight className="w-6 h-6 text-gray-700 group-hover:text-[#0a9945] transition-colors" />
            </button>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Dots Indicator */}
          {products.length > productsPerView && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.ceil(products.length / productsPerView) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * productsPerView)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === Math.floor(currentIndex / productsPerView)
                      ? 'bg-[#0a9945] scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        
      </div>
    </section>
  );
};

// Product Card Component
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    _id,
    title,
    price,
    originalPrice,
    discountPercentage,
    stock,
    brand
  } = product;

  const displayImage = getValidImage(product.mainImage, product.images?.[0], product.image);
  const discountPrice = originalPrice && discountPercentage
    ? originalPrice * (1 - discountPercentage / 100)
    : price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-[#0a9945]/30 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${_id}`} className="block">
        <div className="relative aspect-[3/4] lg:aspect-auto lg:h-[42vh] overflow-hidden bg-gray-50">
          <Image
            src={displayImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 20vw"
            className="object-cover object-center transition-all duration-500"
            priority={false}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder.jpg';
            }}
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
              <div className="bg-gradient-to-l from-[#0a9945] to-gray-800 font-bwseidoround text-white font-medium px-1.5 py-0.5 rounded text-xs shadow-sm">
                NEW
              </div>
            )}
          </div>

          {/* Stock Status */}
          {stock !== undefined && stock > 0 && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-white/90 backdrop-blur-sm text-green-600 font-bwseidoround px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
                In Stock
              </span>
            </div>
          )}

          {/* Quick View Button */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-white transition-all duration-300">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bwseidoround">Shiko më shumë</span>
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
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide font-bwseidoround">
            {brand}
          </span>
        </div>

        {/* Title */}
        <Link href={`/products/${_id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-gray-700 transition-colors leading-tight font-bwseidoround">
            {formatProductTitle(title)}
          </h3>
        </Link>

        {/* Subcategory Badge */}
        {product.subcategory && (
          <div className="inline-block mb-2 px-2 py-0.5 bg-slate-100 text-gray-500 text-xs rounded-xl font-bwseidoround">
            {product.subcategory}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between font-bwseidoround">
          <div className="flex items-center gap-2">
            {discountPercentage && discountPercentage > 0 ? (
              <>
                <span className="text-lg text-gray-900">
                  €{discountPrice.toFixed(2)}
                </span>
                <span className="text-sm line-through text-gray-400">
                  €{originalPrice?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg text-gray-900">
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
    </motion.div>
  );
};

export default NewArrivalsCarousel; 