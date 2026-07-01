'use client';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { fetchCachedJson } from '@/app/lib/client-fetch-cache';
import { IMAGE_PLACEHOLDER, optimizeImageUrl } from '@/app/lib/images';

const SecondBanner = () => {
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, amount: 0.3 });

  useEffect(() => {
    fetchCachedJson<{ slides: { image: string }[] }>('/api/sliders')
      .then((data) => {
        const urls = (data.slides ?? [])
          .map((s) => s.image)
          .filter((url) => url && url.includes('res.cloudinary.com'));
        setBannerImages(urls.length ? urls : [IMAGE_PLACEHOLDER]);
      })
      .catch(() => setBannerImages([IMAGE_PLACEHOLDER]));
  }, []);

  useEffect(() => {
    if (bannerImages.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: i * 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    })
  };

  return (
    <section className="w-full bg-white py-16 PX-4 lg:py-32 flex justify-center lg:px-10 2xl:px-24">
      <div className="flex items-center gap-6 md:gap-10">
        {/* Small Left Image Slider */}
        <div className="flex-shrink-0 w-20 h-28 md:w-36 2xl:w-52 md:h-full relative overflow-hidden shadow-md">
          {bannerImages.map((img, idx) => (
            <Image
              key={`${img}-${idx}`}
              src={optimizeImageUrl(img, { width: 400, quality: 'auto:good' })}
              alt={`Slider ${idx + 1}`}
              fill
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
              style={{ zIndex: idx === current ? 2 : 1 }}
            />
          ))}
          {/* Dots */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-[#8a6a45]' : 'bg-[#8a6a45]/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        {/* Text */}
        <div ref={textRef} className="flex flex-col justify-center">
          <motion.span 
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="block text-3xl lg:text-7xl text-gray-400 font-bwseidoround leading-tight"
          >
            It&apos;s the perfect
          </motion.span>
          <motion.span 
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="block text-3xl lg:text-9xl font-bwseidoround text-gray-400 leading-tight"
          >
            time to change
          </motion.span>
          <motion.span 
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="block text-3xl lg:text-7xl font-bold font-bwseidoround leading-tight mt-1"
          >
            with {' '}
                            <span className="text-black italic font-extrabold">KRASLIGHT.</span>
          </motion.span>
        </div>
      </div>
    </section>
  );
};

export default SecondBanner;