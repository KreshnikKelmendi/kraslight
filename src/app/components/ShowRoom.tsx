"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FiAward,
  FiCheckCircle,
  FiShield,
  FiLayers,
  FiShoppingBag,
  FiMessageCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const ease = [0.16, 1, 0.3, 1] as const;

const features: {
  icon: IconType;
  title: string;
  description: string;
  parallaxOffset: number;
}[] = [
  {
    icon: FiAward,
    title: "Kualitet i lartë",
    description: "Standarde të larta në çdo produkt që ofrojmë për ndriçimin perfekt.",
    parallaxOffset: -12,
  },
  {
    icon: FiCheckCircle,
    title: "Produkte cilësore",
    description: "Zgjedhim vetëm marka dhe materiale më të besueshme globale.",
    parallaxOffset: 8,
  },
  {
    icon: FiShield,
    title: "Garancion",
    description: "Mbrojtje e plotë dhe siguri absolute për çdo blerje tuaj.",
    parallaxOffset: -4,
  },
  {
    icon: FiLayers,
    title: "Zgjedhje e gjerë",
    description: "Ndriçim modern, materiale elektrike dhe zgjidhje për çdo ambient.",
    parallaxOffset: 14,
  },
  {
    icon: FiShoppingBag,
    title: "Blerje online & në dyqan",
    description:
      "Porositni nga website-i ynë me lehtësi, ose na vizitoni në showroom për ta parë produktin nga afër.",
    parallaxOffset: -8,
  },
  {
    icon: FiMessageCircle,
    title: "Këshillim profesional",
    description: "Mbështetje e dedikuar dhe ndihmë teknike para dhe pas blerjes.",
    parallaxOffset: 12,
  },
];

export default function ShowRoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [inViewRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: "-20px 0px",
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={containerRef}
      className="w-full bg-neutral-50 py-16 lg:py-24 px-6 lg:px-12 2xl:px-24 font-bwseidoround overflow-hidden"
    >
      <div ref={inViewRef} className="mx-auto w-full max-w-7xl">
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 lg:mb-14 flex flex-col items-start gap-1 border-l-2 border-[#0a9945] pl-5"
        >
          <span className="text-[10px] uppercase tracking-[0.38em] text-neutral-400 font-medium">
            Kraslight
          </span>
          <p className="flex flex-wrap items-baseline gap-x-2 text-[clamp(1.5rem,3.5vw,2.25rem)] font-extralight leading-none tracking-tight text-neutral-900">
            <span>Light</span>
            <span className="text-neutral-500">the</span>
            <span className="font-serif italic text-[#0a9945]">way.</span>
          </p>
        </motion.div>

        {/* Typographic List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col w-full"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const yParallax = useTransform(scrollYProgress, [0, 1], [feature.parallaxOffset, -feature.parallaxOffset]);

            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                style={{ y: yParallax }}
                className="group relative w-full will-change-transform"
              >
                {/* Horizontal Layout Frame */}
                <div className="flex items-center justify-between py-6 lg:py-8 cursor-pointer">
                  
                  {/* Title and Subtitle stacked vertically */}
                  <div className="flex flex-col gap-1.5 transition-transform duration-300 group-hover:translate-x-1">
                    {/* Clean & Sharp Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-neutral-900">
                      {feature.title}
                    </h2>
                    
                    {/* Elegant Description text down the title */}
                    <p className="text-xs sm:text-sm font-light text-neutral-400 max-w-xl transition-colors duration-300 group-hover:text-neutral-500">
                      {feature.description}
                    </p>
                  </div>

                  {/* Right Green Icon Box Frame */}
                  <div className="shrink-0 flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 bg-[#0a9945] text-white rounded-none transition-all duration-300 group-hover:bg-neutral-900">
                    <Icon size={18} />
                  </div>
                </div>

                {/* Dotted Divider Line matching Screenshot 2026-07-01 164439_2.png */}
                <motion.div
                  variants={lineVariants}
                  className="absolute bottom-0 left-0 w-full h-[1px] border-b border-dashed border-neutral-300 origin-left"
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}