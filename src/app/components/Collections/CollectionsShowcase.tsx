"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { optimizeImageUrl } from "@/app/lib/images";

interface Collection {
  _id: string;
  name: string;
  image: string;
}

interface CollectionsShowcaseProps {
  initialCollections?: Collection[];
}

export default function CollectionsShowcase({
  initialCollections,
}: CollectionsShowcaseProps) {
  const [collections, setCollections] = useState<Collection[]>(
    initialCollections ?? []
  );
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (initialCollections?.length) return;

    async function fetchCollections() {
      const res = await fetch('/api/collections');
      const data = await res.json();
      setCollections(data);
    }
    fetchCollections();
  }, [initialCollections]);

  function handleClick(id: string) {
    router.push(`/collections/${id}`);
    if (typeof window !== 'undefined') {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-white py-12 px-4 lg:px-10">
      {/* Original Grid Layout */}
      <motion.div 
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {collections
          .filter((collection) => collection.image)
          .map((collection) => (
          <motion.div
            key={collection._id}
            variants={cardVariants}
            className="cursor-pointer group transition-all duration-300 hover:shadow-2xl"
            onClick={() => handleClick(collection._id)}
          >
            <div className="relative w-full h-[35vh] lg:h-[63vh] rounded-t-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl">
              {collection.image && (
                <Image
                  src={optimizeImageUrl(collection.image, { width: 800, quality: 'auto:good' })}
                  alt={collection.name ? `Koleksioni ${collection.name}` : 'Koleksion'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={false}
                />
              )}
            </div>
            {/* Text container visually unified with image */}
            <div className="bg-slate-50 rounded-b-xl p-3 lg:p-4 flex flex-col items-start justify-end w-full">
              <p className="text-black py-0.5 lg:py-1 text-[13px] lg:text-base 2xl:text-xl font-bwseidoround mb-1 lg:mb-0 uppercase transition-colors duration-200 group-hover:text-green-600">
                {collection.name}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 text-xs lg:text-sm font-bwseidoround transition-colors duration-200 group-hover:text-green-600">
                  Eksploroni koleksionin
                </span>
                <div className="w-6 h-6 bg-black/10 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-3 h-3 text-black transition-colors duration-200 group-hover:text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 