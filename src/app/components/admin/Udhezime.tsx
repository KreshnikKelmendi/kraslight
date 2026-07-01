'use client';

import Link from 'next/link';
import { FiBookOpen, FiLayers, FiPackage, FiGlobe, FiImage, FiShoppingBag } from 'react-icons/fi';

const steps = [
  {
    icon: FiLayers,
    title: '1. Krijoni koleksionet kryesore',
    body:
      'Shkoni te Menaxho Koleksionet dhe shtoni kategoritë kryesore si Ndriçim i brendshëm, Ndriçim i jashtëm, Materiale elektrike, etj. Çdo koleksion është faqja ku klientët shohin produktet e atij grupi.',
    href: '/admin/products/collections',
    linkLabel: 'Menaxho Koleksionet',
  },
  {
    icon: FiPackage,
    title: '2. Shtoni produktet një e nga një',
    body:
      'Nga Lista e Produkteve → Shto Produkt. Zgjidhni koleksionin (jo listën e vjetër me sugjerime). Produkti merr automatikisht kategorinë e duhur dhe shfaqet në koleksionin përkatës në website.',
    href: '/admin/products/list?add=1',
    linkLabel: 'Shto produkt',
  },
  {
    icon: FiImage,
    title: '3. Slider dhe faqja kryesore',
    body:
      'Menaxho Slider për banner-at në faqen kryesore. Lidhjet e slider-it mund të drejtojnë te koleksionet ose ballina.',
    href: '/admin/slider',
    linkLabel: 'Menaxho Slider',
  },
  {
    icon: FiShoppingBag,
    title: '4. Porositë',
    body:
      'Porositë nga website shfaqen te Porositë. Klientët paguajnë me para në dorë kur marrin paketën.',
    href: '/admin/orders',
    linkLabel: 'Shiko porositë',
  },
];

export default function Udhezime() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm">
          <FiBookOpen className="h-6 w-6 text-[#0a9945]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Udhëzime</h1>
          <p className="mt-1 text-gray-600">
            Si funksionon paneli i administrimit dhe website-i Kraslight
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        <p className="font-semibold">Këshillë për fillim</p>
        <p className="mt-2 leading-relaxed">
          Ju lutem shtoni <strong>fillimisht koleksionet kryesore</strong> (p.sh. ndriçim i brendshëm,
          ndriçim i jashtëm), pastaj <strong>shtoni produktet një e nga një</strong> duke zgjedhur
          koleksionin e duhur. Produktet kalojnë automatikisht në atë koleksion në website — nuk
          duhet t’i shtoni manualisht dy herë.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.body}</p>
                  <Link
                    href={step.href}
                    className="mt-3 inline-block text-sm font-medium text-[#0a9945] hover:underline"
                  >
                    {step.linkLabel} →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <FiGlobe className="h-4 w-4" />
          Website për klientët
        </div>
        <ul className="mt-3 list-inside list-disc space-y-1.5 leading-relaxed">
          <li>Faqja kryesore: slider, koleksione dhe produkte të reja.</li>
          <li>Çdo koleksion hapet nga menu / faqet e koleksioneve.</li>
          <li>Imazhet kompresohen automatikisht gjatë ngarkimit (cilësi e mirë, madhësi më e vogël).</li>
          <li>Çmimi mund të lihet bosh nëse produkti nuk ka çmim fiks.</li>
        </ul>
      </div>
    </div>
  );
}
