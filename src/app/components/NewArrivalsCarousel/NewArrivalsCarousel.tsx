'use client';

import React, { useState, useEffect } from 'react';
// import ProductCard from '../../../components/ProductCard/ProductCard';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';

/* Add global CSS for the zoom-in-special animation */
<style jsx global>{`
  .zoom-in-special {
    opacity: 1 !important;
    transform: scale(1) !important;
    animation: zoomInSpecial 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes zoomInSpecial {
    0% {
      opacity: 0;
      transform: scale(0.5) rotate(-10deg);
      filter: blur(2px);
    }
    60% {
      opacity: 1;
      transform: scale(1.1) rotate(2deg);
      filter: blur(0);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
      filter: blur(0);
    }
  }
`}</style>

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
}

const NewArrivalsCarousel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed unused: currentIndex, isAutoPlaying, carouselRef
  const [isMobile, setIsMobile] = useState(false);
  const { ref: sectionRef, inView: titleInView } = useInView({ threshold: 0.3, triggerOnce: true });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch new arrivals products
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const newArrivalsProducts = data.filter((product: Product) => product.isNewArrival === true);
        setProducts(newArrivalsProducts);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Removed all auto-play and slide logic; static grid only

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

  if (products.length === 0) {
    return null;
  }

  // Always show 9 images if available
  const visibleProducts = products.slice(0, 9);

  return (
    <section className="overflow-hidden relative pt-8 pb-2 lg:pb-12 px-4 lg:px-10 mt-6 lg:mt-12 animate-fade-in-up" ref={sectionRef}>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-2/3 h-2/3 bg-gradient-to-tr from-pink-200/40 via-purple-100/30 to-white rounded-full blur-3xl absolute -top-16 -left-24"></div>
        <div className="w-1/2 h-1/2 bg-gradient-to-br from-purple-200/40 via-pink-100/30 to-white rounded-full blur-2xl absolute bottom-0 right-0"></div>
      </div>
      <div className=" relative z-10">
        {/* Flex Layout Container */}
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-16">
          {/* Left Side - Text Content */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-8">
            {/* Title wrapper */}
            <div className="text-left px-0 lg:px-0">
              {/* Title */}
              <h2 className="font-bwseidoround text-5xl md:text-7xl lg:text-7xl font-extrabold mb-4 lg:mb-6 tracking-tight leading-tight flex flex-col items-center lg:items-start min-h-[5rem] lg:min-h-[7.5rem] relative">
                {/* Mobile: Arritjet (gradient, bold, animated), e reja (block, different gradient/shadow, fade-in), both centered and larger */}
                <span className="block lg:hidden w-full text-center ">
                  <span className=" text-5xl font-extrabold text-transparent bg-clip-text bg-black animate-pulse">Arritjet </span>
                  <span className=" text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-[#0a9945] mt-2 animate-fade-in">e reja</span>
                </span>
                {/* Desktop: original style */}
                <span className="hidden lg:inline-flex items-center gap-3">
                  <span className="inline-block bg-gradient-to-tr from-green-400 to-green-800 p-2 rounded-full shadow-lg animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9H3" /></svg>
                  </span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.3, y: 60, rotate: -8, filter: 'blur(4px)' }}
                    animate={titleInView ? { opacity: 1, scale: 1.08, y: 0, rotate: 0, filter: 'blur(0)', textShadow: '0 8px 32px rgba(180, 100, 255, 0.25)' } : {}}
                    transition={{ duration: 0.9, delay: 0.1, type: 'spring', bounce: 0.55 }}
                    className="inline-block drop-shadow-lg"
                  >
                    Arritjet
                  </motion.span>
                </span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.3, y: 60, rotate: 8, filter: 'blur(4px)' }}
                  animate={titleInView ? { opacity: 1, scale: 1.08, y: 0, rotate: 0, filter: 'blur(0)', textShadow: '0 8px 32px rgba(255, 100, 180, 0.25)' } : {}}
                  transition={{ duration: 0.9, delay: 0.7, type: 'spring', bounce: 0.55 }}
                  className="hidden lg:inline-block drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-[#0a9945] to-gray-800"
                >
                  e reja
                </motion.span>
              </h2>
              {/* Divider */}
              <div className="w-24 lg:w-32 h-1 bg-gradient-to-r from-[#0a9945] to-gray-800 mx-auto lg:mx-0 mb-6 lg:mb-8 rounded-full shadow-lg animate-pulse"></div>
              {/* Description */}
              <p className="text-base lg:text-lg font-bwseidoround text-gray-700 font-light tracking-wide leading-relaxed mb-6 lg:mb-8 px-2 lg:px-0">
                Zbuloni koleksionet më të fundit dhe produktet e reja që sapo kanë mbërritur në Kraslight
              </p>
              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-md">{products.length}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Produkte të Reja</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-md">{Math.ceil(products.length / (isMobile ? 2 : 3))}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Koleksione</div>
                </div>
              </div>
              {/* View All Button - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
                <a
                  href="/shop/new-arrivals"
                  className="group inline-flex items-center bg-gradient-to-r from-[#0a9945] to-gray-800 cursor-pointer hover:from-gray-800 hover:to-[#0a9945] font-bwseidoround text-white px-14 py-3 text-lg shadow-xl hover:shadow-2xl transition-all z-10 border-0 uppercase tracking-wide w-[90%] lg:w-fit animate-fade-in"
                >
                  <span className="mr-3 tracking-wide">Shiko Të Gjitha</span>
                  <svg className="w-7 h-7 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          {/* Right Side - Carousel */}
          <div className="w-full lg:w-1/2 px-0 lg:px-0">
            <div 
              className="relative overflow-visible"
            >
              {/* Products Grid */}
              <div className="grid grid-cols-3 gap-2">
                {visibleProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-center">
                    <Link href={`/products/${product._id}`} className="group relative w-full h-full">
                      <Image
                        src={product.mainImage || product.image || (product.images && product.images[0]) || '/public/images/placeholder.jpg'}
                        alt={product.title}
                        width={200}
                        height={200}
                        className="aspect-square w-full h-auto object-cover shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-lg font-bold text-center px-2 drop-shadow">{product.title}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {/* View All Button - Shown on mobile, hidden on desktop */}
              <div className="lg:hidden flex justify-center mt-6 lg:mt-8 w-full">
                <a
                  href="/shop/new-arrivals"
                  className="group flex justify-center items-center bg-gradient-to-r from-[#0a9945] to-gray-800 cursor-pointer hover:from-gray-800 hover:to-[#0a9945] font-bwseidoround text-white px-12 py-3 text-base shadow-lg hover:shadow-2xl transition-all z-10 border-0 uppercase tracking-wide w-full animate-fade-in text-center"
                >
                  <span className="w-full text-center flex justify-center">Shiko Të Gjitha</span>
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:translate-x-1 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsCarousel; 