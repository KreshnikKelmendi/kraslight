"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Collection {
  _id: string;
  name: string;
  image: string;
}

export default function CollectionsShowcase() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data);
  }

  function handleClick(id: string) {
    router.push(`/collections/${id}`);
    if (typeof window !== 'undefined') {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  }

  return (
    <div className="bg-white py-10 px-4 lg:px-10">
      {/* Original Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {collections.map(collection => (
          <div
            key={collection._id}
            className="cursor-pointer group transition-all duration-300 hover:shadow-2xl"
            onClick={() => handleClick(collection._id)}
          >
            <div className="relative w-full h-[37vh] lg:h-[77vh] overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl">
              {collection.image && (
                <Image
                  src={collection.image}
                  alt={collection.name ? `Koleksioni ${collection.name}` : 'Koleksion'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={false}
                />
              )}
              {/* Always visible text overlay */}
              <div className="absolute inset-0 flex items-end justify-start pointer-events-none">
                <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent h-full flex flex-col items-start justify-end pl-4 lg:pl-6 pb-6 transition-all duration-300 group-hover:from-black/90 group-hover:via-black/60">
                    <p className="text-white bg-gradient-to-r from-[#0a9945] to-gray-800 px-3 lg:px-4 py-0.5 lg:py-1 text-xs lg:text-base font-bwseidoround font-semibold drop-shadow-sm mb-2 transition-all duration-300 group-hover:text-yellow-300 group-hover:scale-105">
                    {collection.name}
                  </p>
                  <div className="flex items-center space-x-2 transition-all duration-300 group-hover:text-gray-200">
                    <span className="text-white text-xs lg:text-sm font-bwseidoround drop-shadow-sm">
                      Eksploroni koleksionin
                    </span>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <svg 
                        className="w-3 h-3 text-white transform group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 