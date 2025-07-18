'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  image: string;
  title: string;
  description: string;
  link: string;
}

interface Slider {
  _id: string;
  slides: Slide[];
}

// Helper function to validate a slide
function isValidSlide(slide: unknown): slide is Slide {
  if (!slide || typeof slide !== 'object') return false;
  const s = slide as Record<string, unknown>;
  return (
    typeof s.image === 'string' &&
    s.image.trim() !== ''
  );
}

export default function Main() {
  const [slider, setSlider] = useState<Slider | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const response = await fetch('/api/sliders');
        const data = await response.json();

        // Handle empty slides array
        if (!data.slides || data.slides.length === 0) {
          setSlider({
            _id: data._id || 'default',
            slides: []
          });
          setError('No slider content available. Please create a slider through the admin interface.');
          return;
        }

        // Validate slides
        const validSlides = (data.slides as unknown[])
          .filter(isValidSlide)
          .map((slide: Slide) => ({
            image: slide.image.trim(),
            title: slide.title.trim(),
            description: slide.description.trim(),
            link: slide.link.trim()
          }));

        if (validSlides.length === 0) {
          setSlider({
            _id: data._id || 'default',
            slides: []
          });
          setError('No valid slides found. Please check the slider content.');
          return;
        }

        setSlider({
          _id: data._id,
          slides: validSlides
        });
        setError(null);
      } catch (err: any) {
        console.error('Error fetching slider:', err);
        setSlider({
          _id: 'error',
          slides: []
        });
        setError('Failed to load slider content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlider();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!slider?.slides?.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slider.slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slider]);

  const nextSlide = () => {
    if (!slider?.slides?.length) return;
    setCurrentSlide((prev) => (prev + 1) % slider.slides.length);
  };

  const prevSlide = () => {
    if (!slider?.slides?.length) return;
    setCurrentSlide((prev) => (prev - 1 + slider.slides.length) % slider.slides.length);
  };

  const currentSlideContent = slider?.slides[currentSlide];

  const renderSlide = () => {
    if (!currentSlideContent) return null;

    return (
      <motion.div
        key={`slide-${currentSlide}`}
        initial={{ opacity: 0, scale: 1.08, x: 60 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.96, x: -60 }}
        transition={{ duration: 0.85, ease: [0.4, 0.01, 0.165, 0.99] }}
        className="absolute inset-0"
        style={{ boxShadow: '0 8px 32px 0 rgba(10,153,69,0.18)' }}
      >
        <motion.div
          initial={{ scale: 1.08, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 5, ease: [0.4, 0.01, 0.165, 0.99] }}
          className="relative h-full w-full"
        >
          <Image
            src={currentSlideContent.image}
            alt={currentSlideContent.title || 'Slider image'}
            fill
            className="object-cover"
            priority={currentSlide === 0}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent" />
        {/* Slide Content */}
        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="max-w-4xl px-4 lg:px-10 py-2 sm:py-0 mb-10 sm:mb-0 w-full">
            {currentSlideContent.title && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-2 sm:mb-6 leading-tight font-bwseidoround drop-shadow-xl">
                  {currentSlideContent.title}
                </h2>
              </motion.div>
            )}
            {currentSlideContent.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-2 sm:mb-8 max-w-2xl leading-relaxed font-bwseidoround drop-shadow-md">
                  {currentSlideContent.description}
                </p>
              </motion.div>
            )}
            {currentSlideContent.link && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Link
                  href={currentSlideContent.link}
                  className="inline-block px-8 sm:px-16 py-2 sm:py-3 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white font-semibold hover:from-[#0a9945] hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg font-bwseidoround border-none"
                  style={{ borderRadius: 0 }}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Shiko më shumë
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="relative h-[60vh] lg:h-screen bg-gray-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"
        />
      </div>
    );
  }

  if (error || !slider?.slides?.length) {
    return (
      <div className="relative h-[60vh] lg:h-screen bg-gray-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center px-4"
        >
          <p className="text-gray-600 mb-4 text-lg lg:text-xl font-bwseidoround">{error || 'No slider content available'}</p>
          {error?.includes('admin interface') && (
            <Link 
              href="/admin/slider"
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg font-bwseidoround"
            >
              Go to Admin Panel
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[62vh] lg:h-screen bg-gray-900 overflow-hidden">
      {/* Slider Content */}
      <AnimatePresence mode="wait">
        {renderSlide()}
      </AnimatePresence>

      {/* Right Arrow Navigation Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 sm:p-3 bg-transparent text-white border border-white/20 ring-2 ring-[#0a9945]/30 hover:ring-[#0a9945]/60 focus:ring-4 focus:ring-[#0a9945]/70 transition-all transform hover:scale-110 hover:shadow-[0_4px_24px_0_rgba(10,153,69,0.25)] shadow-lg"
        aria-label="Next slide"
        style={{ borderRadius: 8, width: '42px', height: '42px', minWidth: 'unset', minHeight: 'unset', boxShadow: '0 2px 12px 0 rgba(10,153,69,0.10)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

      {/* Slide Indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-3"
      >
        {slider?.slides.map((_, index) => (
          <button
            key={`indicator-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 transition-all transform hover:scale-110 border-none focus:outline-none ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 scale-110' 
                : 'bg-gray-300 hover:bg-gradient-to-r hover:from-[#0a9945] hover:to-gray-800'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            style={{ borderRadius: 0 }}
          />
        ))}
      </motion.div>
    </div>
  );
} 