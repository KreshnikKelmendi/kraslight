"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FiMapPin, FiArrowUpRight } from "react-icons/fi";

export default function TextAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [inViewRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Track the scroll progress of this specific container section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transformations: Video stays still or moves slower, content shifts up faster
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-120px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[75vh] lg:h-auto bg-neutral-950 text-white font-bwseidoround "
    >
      {/* 
        Sticky Viewport Window: 
        This keeps the viewport occupied so layers can scroll over it smoothly.
      */}
      <div className="sticky top-0 h-[75vh] lg:h-auto 2xl:h-screen w-full overflow-hidden ">
        
        {/* Parallax Background Video Layer */}
        <motion.div 
          style={{ y: videoY }}
          className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none"
        >
          <video
            src="/assets/logo/kraslight-showroom.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Deep luxurious vignette filter overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-950/60 to-neutral-900/50 mix-blend-multiply" />
          
          {/* Dynamic Ambient Blur Spotlights */}
          <div className="absolute top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-[#0a9945]/10 blur-[140px] mix-blend-screen animate-pulse [animation-duration:8s]" />
          <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full bg-radial-gradient from-neutral-400/10 to-transparent blur-[120px] mix-blend-plus-lighter" />
        </motion.div>

        {/* Foreground Content Window */}
        <motion.div 
          ref={inViewRef}
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 mx-auto  h-full px-6 lg:px-16 2xl:px-36 flex flex-col justify-center items-start gap-y-10 lg:justify-between lg:gap-y-0 py-12 lg:py-24"
        >
          
          {/* Top Logo Mark */}
          <div className="w-full">
            <motion.p
              initial={{ opacity: 0, filter: "blur(4px)", letterSpacing: "0.2em" }}
              animate={inView ? { opacity: 1, filter: "blur(0px)", letterSpacing: "0.4em" } : {}}
              transition={{ duration: 1.5, ease: premiumEase }}
              className="text-[10px] uppercase text-stone-300/80 font-medium tracking-[0.3em] sm:text-[11px]"
            >
              Kraslight
            </motion.p>
          </div>

          {/* Hero Headline */}
          <div className="max-w-4xl relative w-full">
            <h1 className="text-[clamp(3.25rem,9vw,8.5rem)] font-light tracking-tight leading-[1.05] flex flex-col">
              
              {/* "Light the" - Smooth Scale & Dissolve */}
              <motion.span
                initial={{ opacity: 0, filter: "blur(20px)", y: 20, scale: 0.96 }}
                animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 } : {}}
                transition={{ duration: 1.6, ease: premiumEase }}
                className="text-neutral-100 pr-10"
              >
                Light the
              </motion.span>
              
              {/* "way." - Flat Brand Emerald `#0a9945` */}
              <motion.span
                initial={{ opacity: 0, filter: "blur(30px)", y: 30, scale: 0.94 }}
                animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 } : {}}
                transition={{ duration: 1.8, delay: 0.2, ease: premiumEase }}
                className="font-serif italic font-normal pl-4 sm:pl-20 mt-2 text-[#0a9945] drop-shadow-[0_0_40px_rgba(10,153,69,0.25)]"
              >
                way.
              </motion.span>
            </h1>
          </div>

          {/* Showroom + location */}
          <div className="w-full max-w-xl border-l border-[#0a9945]/30 pl-6 py-2">
            <motion.p
              initial={{ opacity: 0, filter: "blur(8px)", x: -10 }}
              animate={inView ? { opacity: 1, filter: "blur(0px)", x: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.6, ease: premiumEase }}
              className="text-sm leading-relaxed text-stone-300/90 sm:text-base font-light max-w-md"
            >
              Ndriçim që transformon hapësirën tuaj — elegancë, funksionalitet dhe stil në çdo detaj.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.85, ease: premiumEase }}
              className="mt-8 border-t border-white/10 pt-6"
            >
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#0a9945] font-medium mb-2">
                Showroomi ynë
              </p>
              <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white lg:text-4xl">
                Ejani dhe na vizitoni
              </h2>
              <p className="mt-3 flex items-start gap-2 text-sm font-extralight leading-relaxed text-stone-300/90">
                <FiMapPin size={16} className="mt-0.5 shrink-0 text-[#0a9945]" />
                Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë
              </p>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://www.google.com/maps?q=Kraslight+Showroom",
                    "_blank"
                  )
                }
                aria-label="Shiko showroom-in në hartë"
                className="pointer-events-auto cursor-pointer mt-5 inline-flex items-center gap-2 border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-[#0a9945] hover:bg-[#0a9945]/20"
              >
                Shiko në hartë
                <FiArrowUpRight size={16} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}