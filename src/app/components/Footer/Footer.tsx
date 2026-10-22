'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import WorkHoursInfo from '@/app/components/WorkHoursInfo';
import {
  PHONE_DISPLAY,
  PHONE_TEL_HREF,
  MAP_LABEL,
  MAP_URL,
  STORE_ADDRESS,
  WHATSAPP_URL,
} from '@/app/lib/contact';
import { BsLightningCharge, BsShieldCheck, BsTruck } from 'react-icons/bs';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage('Ju lutem shkruani një email të vlefshëm');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Abonimi u krye me sukses!');
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.error || 'Gabim gjatë abonimit');
        setMessageType('error');
      }
    } catch {
      setMessage('Gabim i lidhjes me serverin');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-r from-[#0a9945] to-gray-800 font-bwseidoround text-white">
      <div className="relative z-10 mx-auto max-w-[1920px] px-4 py-8 lg:px-10 lg:py-14 2xl:px-24">
        {/* Mobile: compact */}
        <div className="mb-8 space-y-6 md:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="block">
              <Image
                src="/assets/logo/kraslight-white.png"
                alt="Kraslight"
                width={120}
                height={42}
                priority
                className="h-auto w-auto"
              />
            </Link>
            <div className="flex gap-1">
              <a
                href="https://www.instagram.com/kraslight.ks/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center text-white"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a
                href="https://www.facebook.com/kraslight"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center text-white"
              >
                <FaFacebookF className="text-lg" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-200">
            <Link href="/products" className="hover:text-white">
              Produktet
            </Link>
            <Link href="/rreth-nesh" className="hover:text-white">
              Rreth Nesh
            </Link>
            <Link href="/kontakti" className="hover:text-white">
              Kontakti
            </Link>
          </div>

          <div className="space-y-2 text-sm text-gray-200">
            <a href={PHONE_TEL_HREF} className="flex items-center gap-2 hover:text-white">
              <MdPhone className="text-base" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <FaWhatsapp className="text-base" />
              WhatsApp
            </a>
            <a href="mailto:info@kraslight.com" className="flex items-center gap-2 hover:text-white">
              <MdEmail className="text-base" />
              info@kraslight.com
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white">Abonohu</p>
            {message && (
              <div
                className={`rounded-lg p-2.5 text-xs ${
                  messageType === 'success'
                    ? 'border border-green-500/30 bg-green-900/20 text-green-400'
                    : 'border border-red-500/30 bg-red-900/20 text-red-400'
                }`}
              >
                {message}
              </div>
            )}
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Email-i juaj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-300 focus:border-white focus:outline-none"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0 rounded-lg bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Abonohu'}
              </button>
            </form>
          </div>
        </div>

        {/* Desktop / tablet */}
        <div className="mb-10 hidden grid-cols-2 gap-8 md:grid lg:mb-12 lg:grid-cols-4">
          <div className="space-y-5">
            <Link href="/" className="group block">
              <Image
                src="/assets/logo/kraslight-white.png"
                alt="Kraslight"
                width={140}
                height={50}
                priority
                className="h-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="hidden text-sm leading-relaxed text-gray-300 lg:block">
              Destinacioni juaj kryesor për produkte elektrike të cilësisë së lartë.
            </p>
            <div className="hidden space-y-2.5 lg:block">
              <div className="flex items-center space-x-3 text-sm">
                <BsLightningCharge className="text-lg text-white" />
                <span className="text-gray-300">Produkte Ndriqimi & Elektrike</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <BsShieldCheck className="text-lg text-white" />
                <span className="text-gray-300">Garancion</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <BsTruck className="text-lg text-white" />
                <span className="text-gray-300">Dërgesë e Shpejtë</span>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/kraslight.ks/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center text-white transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a
                href="https://www.facebook.com/kraslight"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center text-white transition-all duration-300 hover:scale-110"
              >
                <FaFacebookF className="text-lg" />
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg text-white">Lidhje të Shpejta</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className="text-sm text-gray-300 transition-colors hover:text-white">
                  Produktet Tona
                </Link>
              </li>
              <li>
                <Link href="/rreth-nesh" className="text-sm text-gray-300 transition-colors hover:text-white">
                  Rreth Nesh
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-sm text-gray-300 transition-colors hover:text-white">
                  Garantia
                </Link>
              </li>
              <li>
                <Link href="/kontakti" className="text-sm text-gray-300 transition-colors hover:text-white">
                  Kontakti
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg text-white">Na Kontaktoni</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MdLocationOn className="mt-0.5 shrink-0 text-lg text-white" />
                <div>
                  <p className="text-sm text-white">{STORE_ADDRESS}</p>
                  <a
                    href={MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-white/80 hover:underline"
                  >
                    {MAP_LABEL}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MdPhone className="shrink-0 text-lg text-white" />
                <a href={PHONE_TEL_HREF} className="text-sm text-white hover:underline">
                  {PHONE_DISPLAY}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MdEmail className="shrink-0 text-lg text-white" />
                <a href="mailto:info@kraslight.com" className="text-sm text-white hover:underline">
                  info@kraslight.com
                </a>
              </div>
              <div className="hidden lg:block">
                <WorkHoursInfo theme="dark" />
              </div>
            </div>
          </div>

          <div className="hidden space-y-5 lg:block">
            <h3 className="text-lg text-white">Mbani Lidhje</h3>
            <p className="text-sm text-gray-300">
              Abonohuni për përditësimet dhe ofertat.
            </p>

            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  messageType === 'success'
                    ? 'border border-green-500/30 bg-green-900/20 text-green-400'
                    : 'border border-red-500/30 bg-red-900/20 text-red-400'
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="Shkruani email-in tuaj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-400 backdrop-blur-sm transition-all focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Duke u abonuar...' : 'Abonohu Tani'}
              </button>
            </form>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-gray-900"
            >
              <FaWhatsapp className="text-lg" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/15 pt-5">
          <div className="text-center text-xs leading-relaxed text-gray-400 md:text-left">
            <span>© {new Date().getFullYear()} Kraslight. Të gjitha të drejtat e rezervuara.</span>
            <span className="mx-2 hidden md:inline">•</span>
            <br className="md:hidden" />
            <span>Developed by Sync Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
