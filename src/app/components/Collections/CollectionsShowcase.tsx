"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FiArrowRight } from "react-icons/fi";
import { optimizeImageUrl, IMAGE_PLACEHOLDER } from "@/app/lib/images";
import { fetchCachedJson } from "@/app/lib/client-fetch-cache";
import { useOptionalStorefrontData } from "@/app/lib/StorefrontDataContext";

interface Collection {
  _id: string;
  name: string;
  image: string;
}

interface CollectionsShowcaseProps {
  initialCollections?: Collection[];
}

function getGridClass(count: number) {
  const bentoFourLg =
    "lg:grid-cols-4 lg:grid-rows-2 lg:auto-rows-[minmax(340px,1fr)] 2xl:auto-rows-[minmax(440px,1fr)]";
  const bentoThreeLg =
    "lg:grid-cols-2 lg:grid-rows-2 lg:min-h-[68vh] lg:auto-rows-[1fr] 2xl:min-h-[85vh]";

  if (count === 1) return "grid-cols-1 max-w-xl mx-auto lg:max-w-2xl";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return `grid-cols-1 ${bentoThreeLg}`;
  return `grid-cols-2 ${bentoFourLg}`;
}

function getItemClass(index: number, count: number) {
  if (count <= 2) return "";
  if (count === 3) {
    if (index === 0) return "lg:col-start-1 lg:row-start-1 lg:row-span-2";
    if (index === 1) return "lg:col-start-2 lg:row-start-1";
    if (index === 2) return "lg:col-start-2 lg:row-start-2";
    return "";
  }
  if (index === 0) return "lg:col-span-2 lg:row-span-2";
  if (count === 4 && index === 3) return "lg:col-span-2";
  if (count >= 5 && index === 4) return "lg:col-span-2";
  return "";
}

function getCardClass(index: number, count: number) {
  const simpleTall =
    "aspect-[4/5] lg:aspect-auto lg:h-[48vh] xl:h-[72vh] 2xl:h-[85vh]";

  if (count <= 2) return simpleTall;
  if (count === 3) {
    return "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-0";
  }
  if (index === 0) {
    return "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[420px] 2xl:min-h-[560px]";
  }
  return "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[300px] 2xl:min-h-[400px]";
}

export default function CollectionsShowcase({
  initialCollections,
}: CollectionsShowcaseProps) {
  const storefrontData = useOptionalStorefrontData();
  const [collections, setCollections] = useState<Collection[]>(
    initialCollections ?? storefrontData?.collections ?? []
  );
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 });

  useEffect(() => {
    if (initialCollections?.length) return;
    if (storefrontData?.collections.length) {
      setCollections(storefrontData.collections);
      return;
    }

    async function fetchCollections() {
      try {
        const data = await fetchCachedJson<Collection[]>("/api/collections");
        setCollections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load collections:", error);
      }
    }
    fetchCollections();
  }, [initialCollections, storefrontData?.collections]);

  const visibleCollections = collections.filter((c) => c.image);
  const count = visibleCollections.length;
  const useBento = count >= 3;

  if (count === 0) return null;

  function handleNavigate(id: string) {
    setNavigatingId(id);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <section className="bg-neutral-50 py-20 lg:py-24 2xl:py-32 px-4 lg:px-10 2xl:px-24 font-bwseidoround">
      <div className=" mx-auto">
       

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.08 },
            },
          }}
          className={`grid gap-4 lg:gap-6 ${getGridClass(count)}`}
        >
          {visibleCollections.map((collection, index) => {
            const isNavigating = navigatingId === collection._id;
            const isFeatured = useBento && index === 0;

            return (
              <motion.div
                key={collection._id}
                variants={{
                  hidden: { opacity: 0, y: 36 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className={`${getItemClass(index, count)} ${count === 3 ? "h-full min-h-0" : ""}`}
              >
                <Link
                  href={`/collections/${collection._id}`}
                  onClick={() => handleNavigate(collection._id)}
                  aria-busy={isNavigating}
                  className={`group relative block h-full overflow-hidden bg-neutral-900 ring-1 ring-neutral-200/60 transition-all duration-500 hover:ring-[#0a9945]/40 hover:shadow-[0_28px_60px_-24px_rgba(10,153,69,0.35)] ${getCardClass(index, count)} ${
                    isNavigating ? "pointer-events-none" : ""
                  }`}
                >
                  <Image
                    src={optimizeImageUrl(collection.image || IMAGE_PLACEHOLDER, {
                      width: 900,
                      quality: "auto:good",
                    })}
                    alt={collection.name}
                    fill
                    sizes={
                      isFeatured
                        ? "(max-width: 1024px) 100vw, 50vw"
                        : "(max-width: 1024px) 50vw, 25vw"
                    }
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 transition-opacity duration-500 group-hover:from-black/85" />
                  <div className="absolute inset-0 bg-[#0a9945]/0 transition-colors duration-500 group-hover:bg-[#0a9945]/10" />

                  <div className="absolute top-3 left-3 lg:top-6 lg:left-5">
                    <span className="inline-block border border-white/25 bg-white/10 px-2 py-0.5 lg:px-2.5 lg:py-1 text-[9px] lg:text-[10px] uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-3.5 lg:p-5">
                    <h3
                      className={`font-light text-white tracking-tight leading-tight transition-transform duration-500 group-hover:-translate-y-0.5 ${
                        isFeatured ? "text-base lg:text-4xl" : "text-sm lg:text-2xl"
                      }`}
                    >
                      {collection.name}
                    </h3>
                    <div className="mt-2 lg:mt-4 flex items-center gap-1.5 text-[9px] lg:text-[11px] uppercase tracking-[0.22em] text-white/90">
                      <span>Eksploroni koleksionin</span>
                      <FiArrowRight
                        size={12}
                        className="lg:w-3.5 lg:h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                    <div className="mt-2 lg:mt-4 hidden h-px w-0 max-w-[120px] bg-gradient-to-r from-[#0a9945] to-white/40 transition-all duration-500 group-hover:w-full lg:block" />
                  </div>

                  <div
                    className={`absolute inset-0 z-10 flex items-center justify-center bg-white/65 backdrop-blur-[2px] transition-opacity duration-200 ${
                      isNavigating ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full border-2 border-neutral-200 border-t-[#0a9945] ${
                        isNavigating ? "animate-spin" : ""
                      }`}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
