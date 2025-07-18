'use client';
// import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const sliderImages = [
  '/uploads/products/37ef206b-0259-49e2-a1de-7c9b4540c8b8-alexander-mcqueen-rtw-aw24-look-01-65e4617b6c308.jpg',
  '/uploads/products/52827481-16b9-45a0-9f1e-af106d22c916.jpg',
  '/uploads/products/a371121f-4899-49fe-9fde-166375653749-15270-3840x2160-desktop-4k-gigi-hadid-background-image.jpg',
  '/uploads/products/12075f73-a91b-44ad-bd25-5d37277ef50e-hbz-liz-hurley-00-index-1553010048.jpg',
  '/uploads/products/09d31f29-9598-4715-8519-7ee6ad4cdd40-HD-wallpaper-gigi-hadid-latest-gigi-hadid-celebrities-girls-model.jpg',
  '/uploads/products/3e723abe-b057-40f7-aec9-d0288f4d5fc0.jpg',
  '/uploads/products/5b0821c2-54b1-4c22-8bbc-78b81e7d29e8.jpg',
];

const SecondBanner = () => {
  const [current, setCurrent] = useState(0);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
      // Toggle grayscale effect every 2 slides
      setIsGrayscale((prev) => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
    <section className="w-full bg-white py-16 PX-4 lg:py-32 flex justify-center lg:px-10">
      <div className="flex items-center gap-6 md:gap-10">
        {/* Small Left Image Slider */}
        <div className="flex-shrink-0 w-20 h-28 md:w-36 2xl:w-52 md:h-full relative overflow-hidden shadow-md">
          {sliderImages.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={`Slider ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
              style={{ zIndex: idx === current ? 2 : 1 }}
            />
          ))}
          {/* Dots */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {sliderImages.map((_, idx) => (
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
            It's the perfect
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
            <span className="text-black italic font-extrabold">RUNWAY.</span>
          </motion.span>
        </div>
      </div>
    </section>
  );
};

export default SecondBanner;