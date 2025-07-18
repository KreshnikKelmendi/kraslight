'use client';

import { useState, useEffect } from 'react';
import ProductCard from '../../../components/ProductCard/ProductCard';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  stock: number;
  brand: string;
  sizes: string;
  category?: string;
  description: string;
  isNewArrival?: boolean;
  images?: string[];
  mainImage?: string;
}

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  // Transform products to always have mainImage and images
  const transformedProducts = products.map((product) => {
    const availableImages = [
      ...(product.images || []),
      ...(product.image ? [product.image] : [])
    ].filter(Boolean);
    return {
      ...product,
      mainImage: product.mainImage || availableImages[0] || '/images/placeholder.jpg',
      images: availableImages.length > 0 ? availableImages : ['/images/placeholder.jpg'],
      category: product.category || '',
      description: product.description || '',
    };
  });

  return (
    <div className="px-4 lg:px-10 py-12 md:py-16">
      {/* Elegant Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Collection</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our curated selection of premium products, carefully chosen to elevate your style and enhance your lifestyle.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
        {transformedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* No Products Message */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-500">We&apos;re currently updating our collection. Please check back soon.</p>
          </div>
        </div>
      )}
    </div>
  );
} 