'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ShowRoom from '@/app/components/ShowRoom';
import { MAP_URL, STORE_ADDRESS } from '@/app/lib/contact';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease },
  }),
};

export default function RrethNeshPage() {
  return (
    <div className="min-h-screen bg-white font-bwseidoround">
      <section className="border-b border-neutral-100 bg-neutral-50 px-4 py-16 lg:px-10 2xl:px-24 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a9945]"
          >
            Kraslight
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mt-3 font-serif text-4xl text-neutral-900 sm:text-5xl"
          >
            Rreth Nesh
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mt-6 max-w-3xl text-base leading-relaxed text-neutral-600 sm:text-lg"
          >
            Kraslight është destinacioni juaj kryesor për produkte ndriçimi dhe materiale elektrike
            të cilësisë së lartë. Me përvojë të gjatë në treg, ofrojmë zgjidhje për shtëpi,
            biznese dhe projekte të ndryshme.
          </motion.p>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-10 2xl:px-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100"
          >
            <Image
              src="/assets/logo/kraslight-logo.png"
              alt="Kraslight"
              fill
              className="object-contain p-12"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <h2 className="font-serif text-3xl text-neutral-900">Misioni ynë</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Misioni ynë është të ndriçojmë çdo hapësirë me produkte të besueshme, dizajn
              modern dhe shërbim profesional. Gjindemi në{' '}
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline cursor-pointer no-underline"
                aria-label="Shiko në hartë"
              >
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 ease-out scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                >
                  Shiko në hartë
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-neutral-900"
                  />
                </span>
                <span className="font-semibold text-neutral-900 transition-colors duration-200 ease-out group-hover:text-[#0a9945]">
                  {STORE_ADDRESS}
                </span>
              </a>
              {' '}— ku na vizitoni në dyqan, ose porositni online me lehtësi.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Besojmë në partneritet afatgjatë me klientët — nga zgjedhja e produktit deri
              te instalimi dhe mbështetja pas blerjes.
            </p>
          </motion.div>
        </div>
      </section>

      <ShowRoom />
    </div>
  );
}
