'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ShowRoom from '@/app/components/ShowRoom';

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
            biznese dhe projekte arkitektonike.
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
            <h2 className="font-serif text-3xl text-neutral-900">Light the way.</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Misioni ynë është të ndriçojmë çdo hapësirë me produkte të besueshme, dizajn
              modern dhe shërbim profesional. Gjindemi në Sllatinë e Madhe — Rruga e Pejës,
              Fushë Kosovë — ku na vizitoni në dyqan, ose porositni online me lehtësi.
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
