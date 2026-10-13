'use client';

import Image from 'next/image';

export default function LaunchPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f7f8f7]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,153,69,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center px-6 text-center">
        <div className="launch-logo mb-10">
          <Image
            src="/assets/logo/kraslight-logo.png"
            alt="Kraslight"
            width={220}
            height={78}
            priority
            className="h-auto w-[180px] object-contain sm:w-[220px]"
          />
        </div>

        <p className="launch-fade font-bwseidoround text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0a9945]">
          Under construction
        </p>
        <h1 className="launch-fade-delay mt-4 font-bwseidoround text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          kraslight.com
        </h1>
        <p className="launch-fade-delay-2 mt-3 max-w-sm font-bwseidoround text-sm leading-relaxed text-neutral-500 sm:text-base">
          Will be online very soon.
        </p>

        <div className="launch-fade-delay-2 mt-8 flex items-center gap-2">
          <span className="launch-dot h-1.5 w-1.5 rounded-full bg-[#0a9945]" />
          <span className="launch-dot launch-dot-2 h-1.5 w-1.5 rounded-full bg-[#0a9945]" />
          <span className="launch-dot launch-dot-3 h-1.5 w-1.5 rounded-full bg-[#0a9945]" />
        </div>
      </div>

      <style jsx>{`
        .launch-logo {
          animation: launchBounce 1.15s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .launch-fade {
          animation: launchFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
        }

        .launch-fade-delay {
          animation: launchFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }

        .launch-fade-delay-2 {
          animation: launchFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.65s both;
        }

        .launch-dot {
          animation: launchDot 1.2s ease-in-out infinite;
        }

        .launch-dot-2 {
          animation-delay: 0.2s;
        }

        .launch-dot-3 {
          animation-delay: 0.4s;
        }

        @keyframes launchBounce {
          0% {
            opacity: 0;
            transform: translateY(-28px) scale(0.92);
          }
          55% {
            opacity: 1;
            transform: translateY(6px) scale(1.03);
          }
          75% {
            transform: translateY(-4px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes launchFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes launchDot {
          0%,
          80%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
      `}</style>
    </div>
  );
}
