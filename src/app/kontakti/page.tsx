'use client';

import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import WorkHoursInfo from '@/app/components/WorkHoursInfo';
import {
  PHONE_DISPLAY,
  PHONE_TEL_HREF,
  WHATSAPP_URL,
} from '@/app/lib/contact';

const contactItems = [
  {
    icon: MdLocationOn,
    label: 'Adresa',
    value: 'Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë',
  },
  {
    icon: MdPhone,
    label: 'Telefoni',
    value: PHONE_DISPLAY,
    href: PHONE_TEL_HREF,
  },
  {
    icon: MdEmail,
    label: 'Email',
    value: 'info@kraslight.com',
    href: 'mailto:info@kraslight.com',
  },
];

export default function KontaktiPage() {
  return (
    <div className="min-h-screen bg-white font-bwseidoround">
      <section className="border-b border-neutral-100 bg-neutral-50 px-4 py-16 lg:px-10 2xl:px-24 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a9945]">
            Kraslight
          </p>
          <h1 className="mt-3 font-serif text-4xl text-neutral-900 sm:text-5xl">Kontakti</h1>
          <p className="mt-6 text-base leading-relaxed text-neutral-600 sm:text-lg">
            Jemi këtu për çdo pyetje rreth produkteve, porosive apo projekteve tuaja të ndriçimit.
            Na kontaktoni në dyqan, telefon, email ose rrjetet sociale.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-10 2xl:px-24 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4 rounded-xl border border-neutral-100 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0a9945]/10 text-[#0a9945]">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="mt-1 block text-base font-medium text-neutral-900 transition-colors hover:text-[#0a9945]"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-base font-medium text-neutral-900">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-neutral-100 p-5">
              <WorkHoursInfo />
            </div>

            <div className="flex gap-4 pt-2">
              <a
                href="https://www.instagram.com/kraslight.ks/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-[#0a9945] hover:text-[#0a9945]"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/kraslight"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-[#0a9945] hover:text-[#0a9945]"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-[#0a9945] hover:text-[#0a9945]"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
            <iframe
              title="Kraslight lokacioni"
              src="https://maps.google.com/maps?q=Rruga+e+Pej%C3%ABs,+Sllatin%C3%AB+e+Madhe,+Fush%C3%AB+Kosov%C3%AB&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="h-[400px] w-full border-0 lg:h-full lg:min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
