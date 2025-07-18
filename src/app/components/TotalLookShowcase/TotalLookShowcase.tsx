"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import ProductCard from '../../../components/ProductCard/ProductCard';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  title: string;
  images?: string[];
  image?: string;
  mainImage?: string;
  category?: string;
  description?: string;
  price?: number;
  brand?: string;
  sizes?: string;
  gender?: string;
  stock?: number;
  originalPrice?: number;
  discountPercentage?: number;
  isNewArrival?: boolean;
}

interface TotalLook {
  _id: string;
  name: string;
  description?: string;
  image: string;
  products: Product[];
}

export default function TotalLookShowcase() {
  const [looks, setLooks] = useState<TotalLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [openLookId] = useState<string | null>(null);
  const [selectedLook, setSelectedLook] = useState<TotalLook | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/total-look")
      .then(res => res.json())
      .then(data => {
        setLooks(data);
        setLoading(false);
      });
  }, []);

  const handleShopLook = (look: TotalLook) => {
    setSelectedLook(look);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedLook(null);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!looks.length) {
    return null;
  }

  return (
    <>
      <section className="w-full bg-white py-10 px-4 lg:px-10 lg:py-16">
        <div className="mx-auto">
          
          <div className={`grid gap-8 ${looks.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {looks.map(look => (
              <div key={look._id} className="w-full shadow-lg overflow-hidden bg-white">
                <div className="relative w-full h-[45vh] lg:h-[75vh] 2xl:h-[80vh]">
                  <Image 
                    src={look.image} 
                    alt={look.name} 
                    fill 
                    className="object-cover w-full h-full" 
                    priority={true}
                    sizes="100vw"
                  />
                  {/* Gradient overlay for better text visibility */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <button
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0 bg-white cursor-pointer hover:border-black font-bwseidoround text-black px-12 py-2 font-bold text-sm shadow-lg hover:bg-black hover:text-white transition-all z-10 border-2 border-white uppercase tracking-wide w-[90%] lg:w-fit"
                    onClick={() => handleShopLook(look)}
                  >
                    Shop The Look
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-20 lg:left-8 lg:bottom-8 lg:translate-x-0 text-center lg:text-left">
                    <h3 className="text-2xl md:text-3xl font-light text-white mb-2 font-bwseidoround tracking-wide">
                      {look.name}
                    </h3>
                    {look.description && (
                      <p className="text-white/90 text-sm md:text-base font-light font-bwseidoround">
                        {look.description}
                      </p>
                    )}
                  </div>
                </div>
                {/* Products Reveal */}
                {openLookId === look._id && (
                  <div className="w-full bg-gray-50 border-t border-gray-200 px-8 py-8 animate-fade-in">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Produktet në këtë look:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                      {look.products.length === 0 && (
                        <span className="text-gray-500">Nuk ka produkte për këtë look.</span>
                      )}
                      {look.products.map(product => {
                        // Transform product to match ProductCard props
                        const availableImages = [
                          ...(product.images || []),
                          ...(product.image ? [product.image] : [])
                        ].filter(Boolean);
                        const transformedProduct = {
                          ...product,
                          mainImage: product.mainImage || availableImages[0] || '/images/placeholder.jpg',
                          images: availableImages.length > 0 ? availableImages : ['/images/placeholder.jpg'],
                          category: product.category || '',
                          description: product.description || '',
                          price: product.price || 0,
                          brand: product.brand || '',
                          sizes: product.sizes || '',
                          gender: product.gender || '',
                          stock: product.stock || 0,
                          originalPrice: product.originalPrice,
                          discountPercentage: product.discountPercentage,
                        };
                        return (
                          <ProductCard key={product._id} product={transformedProduct} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop Look Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && selectedLook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] sm:w-96 lg:w-[500px] bg-white shadow-2xl z-50"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 font-bwseidoround">Shop The Look</h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedLook.name}</p>
                    </div>
                    <button
                      onClick={closeSidebar}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-bwseidoround">
                    Produktet në këtë look:
                  </h3>
                  
                  {selectedLook.products.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nuk ka produkte për këtë look.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLook.products.map(product => {
                        // Transform product to match ProductCard props
                        const availableImages = [
                          ...(product.images || []),
                          ...(product.image ? [product.image] : [])
                        ].filter(Boolean);
                        const transformedProduct = {
                          ...product,
                          mainImage: product.mainImage || availableImages[0] || '/images/placeholder.jpg',
                          images: availableImages.length > 0 ? availableImages : ['/images/placeholder.jpg'],
                          category: product.category || '',
                          description: product.description || '',
                          price: product.price || 0,
                          brand: product.brand || '',
                          sizes: product.sizes || '',
                          gender: product.gender || '',
                          stock: product.stock || 0,
                          originalPrice: product.originalPrice,
                          discountPercentage: product.discountPercentage,
                        };
                        return (
                          <ProductCard key={product._id} product={transformedProduct} />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 