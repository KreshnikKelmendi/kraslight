import React from 'react';

interface GlobalDiscountRibbonProps {
  discountPercentage: number;
}

const GlobalDiscountRibbon: React.FC<GlobalDiscountRibbonProps> = ({ discountPercentage }) => {
  return (
    <div className="w-full z-50">
      <div className="relative w-full bg-white border-green-100 py-2 px-0 overflow-hidden">
        <div className="w-full">
          <div
            className="marquee whitespace-nowrap flex items-center"
            style={{
              animation: 'marquee 40s cubic-bezier(0.4, 0.2, 0.2, 1) infinite',
              willChange: 'transform',
            }}
            onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {[...Array(5)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#0a9945] to-gray-800 text-white font-bold rounded-full w-10 h-10 text-sm p-2 mr-10">
                  -{discountPercentage}%
                </span>
                <span className="font-semibold text-sm tracking-wide mr-36 text-gray-700 font-bwseidoround">
                  ZBRITJE NË TË GJITHA PRODUKTET
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default GlobalDiscountRibbon; 