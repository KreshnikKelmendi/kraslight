"use client"
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard/ProductCard";
import { fetchJson } from "@/app/lib/fetch-json";
import type { FormattedProduct } from "@/app/lib/format-product";

const standardCategories = [
  "Ndriçim i brendshëm",
  "Ndriçim i jashtëm",
  "Materiale Elektrike",
  "Ndriçim kopshti"
];

interface OtherProductsProps {
  initialProducts?: FormattedProduct[];
}

const OtherProducts = ({ initialProducts }: OtherProductsProps) => {
  const hasServerProducts =
    Array.isArray(initialProducts) && initialProducts.length > 0;
  const [products, setProducts] = useState<FormattedProduct[]>(
    hasServerProducts ? initialProducts : []
  );
  const [isLoading, setIsLoading] = useState(!hasServerProducts);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Të gjitha");
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    if (hasServerProducts) return;

    const fetchProducts = async () => {
      try {
        const data = await fetchJson<FormattedProduct[]>('/api/products');
        const filtered = data.filter(
          (product) =>
            product.category &&
            !standardCategories.includes(product.category) &&
            product.category.trim() !== ''
        );
        setProducts(filtered);
      } catch {
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [hasServerProducts]);

  // Get unique custom categories
  const customCategories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((cat): cat is string => !!cat && cat.trim() !== "")
    )
  );

  // Filtered products based on selected category
  const filteredProducts =
    selectedCategory === "Të gjitha"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Handle category click with 500ms loading
  const handleCategoryClick = (cat: string) => {
    setFilterLoading(true);
    setSelectedCategory(cat);
    setTimeout(() => {
      setFilterLoading(false);
    }, 500);
  };

  if (isLoading) {
    return <div>Loading Other Products...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (products.length === 0) {
    return <div>No custom category products found.</div>;
  }

  return (
    <div className="py-12 lg:py-16 px-4 lg:px-10">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold font-bwseidoround">Produkte të tjera</h2>
          <p className="mt-1 text-gray-500 max-w-lg text-sm lg:text-base font-bwseidoround">Duke filluar nga vegla pune, klima, e deri te produktet më të veçanta për shtëpi dhe biznes – këtu do të gjeni zgjedhje të ndryshme që plotësojnë çdo nevojë dhe stil, përtej ndriçimit!</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
          <span
            key="all"
            onClick={() => handleCategoryClick("Të gjitha")}
            className={`inline-block cursor-pointer font-semibold px-3 py-1 rounded-xl shadow border text-sm transition-colors
              ${selectedCategory === "Të gjitha"
                ? "bg-gradient-to-r from-gray-500 to-gray-700 text-white border-gray-600"
                : "bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800 border-gray-300 hover:from-gray-200 hover:to-gray-400"}
            `}
          >
            Të gjitha
          </span>
          {customCategories.map((cat) => (
            <span
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`inline-block cursor-pointer font-semibold px-3 py-1 rounded-xl shadow border text-sm transition-colors
                ${selectedCategory === cat
                  ? "bg-gradient-to-r from-gray-500 to-gray-700 text-white border-gray-600"
                  : "bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800 border-gray-300 hover:from-gray-200 hover:to-gray-400"}
              `}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
      {filterLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={{ ...product, sizes: product.sizes ?? "", category: product.category ?? "", description: product.description ?? "" }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OtherProducts; 