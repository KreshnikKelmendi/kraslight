"use client"

import React, { useRef, useState } from 'react';
import { FiVolume1, FiVolumeX, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ShowRoom = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  
  // Intersection Observer for animation
  const [textRef, textInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: '-50px 0px'
  });

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  // Animation variants for the popping effect
  const textAnimationVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 50
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }
    }
  };

  return (
    <section className="w-full flex flex-col lg:flex-row-reverse items-center justify-center py-10 lg:py-10 px-4 lg:px-10">
      {/* Left: Text, Right: Video */}
      <div className="w-full lg:w-1/2 flex flex-col items-start justify-start z-20 mb-6 lg:mb-0  lg:ml-16">
        <motion.h2
          ref={textRef}
          variants={textAnimationVariants}
          initial="hidden"
          animate={textInView ? "visible" : "hidden"}
          className="text-3xl md:text-5xl lg:text-5xl font-bwseidoround 2xl:text-7xl lg:tracking-[1px] font-black mb-3 text-center lg:text-left tracking-tight leading-tight relative overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #0a9945 0%, #111 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 6px 24px #e0ffe6',
          }}
        >
          Ejani dhe na vizitoni
        </motion.h2>
        <p className="text-gray-600 text-base lg:text-lg text-left font-light mb-5 font-bwseidoround" style={{textShadow:'0 1px 6px #f3f4f6'}}>
          Mirësevini në showroom-in tonë! <br />Eksploroni koleksionet më të fundit të ndriçimit dhe dizajnit modern për hapësirën tuaj.
        </p>
        {/* Location Card */}
        <div className="flex flex-col items-start py-5 w-full max-w-md gap-2">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center justify-center bg-[#0a9945]/10 text-[#0a9945] p-2"><FiMapPin size={28} /></span>
            <span className="font-bold text-lg lg:text-xl text-gray-900 font-bwseidoround">Kraslight Showroom</span>
          </div>
          <div className="text-gray-700 font-bwseidoround text-sm lg:text-base font-medium mb-2 flex items-center gap-2">
          Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë
          </div>
          <button
            onClick={() => window.open('https://www.google.com/maps?q=Kraslight+Showroom', '_blank')}
            aria-label="Shiko showroom-in në hartë"
            className="flex items-center gap-2 cursor-pointer font-bwseidoround rounded-xl bg-gradient-to-br from-[#0a9945] to-gray-800 text-white px-5 py-2 shadow-md border border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0a9945] hover:scale-105 hover:shadow-xl text-base lg:text-lg mt-1"
            title="Shiko showroom-in në hartë"
          >
            <FiMapPin size={18} />
            Shiko në hartë
          </button>
        </div>
      </div>
      {/* Video Section */}
      <div className="w-full lg:w-1/2 h-[333px] lg:h-[75vh] 2xl:h-[70vh] relative flex items-center justify-center overflow-hidden rounded-xl">
        <video
          ref={videoRef}
          src="/assets/logo/kraslight-showroom.mp4"
          autoPlay
          loop
          muted={muted}
          playsInline
          className="w-full h-full object-cover object-center"
          style={{ minHeight: 120 }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-white/0 pointer-events-none" />
        {/* Mute/Unmute Button */}
        <button
          onClick={handleToggleMute}
          aria-label={muted ? 'Aktivo Zërin' : 'Çaktivizo Zërin'}
          className="absolute rounded-xl bottom-4 left-4 bg-white/70 hover:bg-blue-500/80 cursor-pointer text-green-600 hover:text-white p-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 z-10 backdrop-blur"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {muted ? <FiVolumeX size={18} /> : <FiVolume1 size={18} />}
        </button>
      </div>
    </section>
  );
};

export default ShowRoom; 