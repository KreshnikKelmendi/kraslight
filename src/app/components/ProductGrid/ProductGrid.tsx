import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  brand: string;
  gender: string;
  category: string;
  isNewArrival?: boolean;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link 
          href={`/product/${product._id}`} 
          key={product._id}
          className="group"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {/* Product Image */}
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {product.discountPercentage && product.discountPercentage > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  -{product.discountPercentage}%
                </div>
              )}
              {product.isNewArrival && (
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  NEW
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              
              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {product.price.toLocaleString('sq-AL')} €
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {product.originalPrice.toLocaleString('sq-AL')} €
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid; 