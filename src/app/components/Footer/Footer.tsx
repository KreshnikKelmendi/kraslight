'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from 'react-icons/md';
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
    <footer className="w-full bg-gradient-to-r from-[#0a9945] to-gray-800 text-white font-bwseidoround relative overflow-hidden">
      
      <div className="max-w-[1920px] mx-auto px-4 lg:px-10 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company Info Section */}
          <div className="space-y-6">
            <Link href="/" className="block group">
              <Image
                src="/assets/logo/kraslight-white.png"
                alt="Kraslight Logo"
                width={140}
                height={50}
                priority
                className="h-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Destinacioni juaj kryesor për produkte elektrike të cilësisë së lartë. 
              Zbuloni produktet më të fundit dhe inovacionet më të reja në koleksionin tonë.
            </p>
            
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <BsLightningCharge className="text-white text-lg" />
                <span className="text-gray-300">Produkte të Energjisë</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <BsShieldCheck className="text-white text-lg" />
                <span className="text-gray-300">Garantia 2 Vite</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <BsTruck className="text-white text-lg" />
                <span className="text-gray-300">Dërgesa e Shpejtë</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:text-[#0a9945]"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:text-[#0a9945]"
              >
                <FaFacebookF className="text-lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#0a9945]">
              Lidhje të Shpejta
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-[#0a9945] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Produktet Tona
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-[#0a9945] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Rreth Nesh
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-[#0a9945] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Garantia
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-[#0a9945] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Mbështetja Teknike
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm flex items-center group">
                  <span className="w-1 h-1 bg-[#0a9945] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Kontakti
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#0a9945]">
              Na Kontaktoni
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <MdLocationOn className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë
                  </p>
                  <p className="text-gray-400 text-xs">Adresa Jonë</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <MdPhone className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">049 666 678</p>
                  <p className="text-gray-400 text-xs">Telefoni</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <MdEmail className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">info@kraslight.com</p>
                  <p className="text-gray-400 text-xs">Email</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <MdAccessTime className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">8:00 - 19:00</p>
                  <p className="text-gray-400 text-xs">Orari i Punës</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#0a9945]">
                Mbani Lidhje
              </h3>
              <div className="text-2xl font-bold text-[#0a9945] mt-2">
                KRASLIGHT
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Abonohuni për përditësimet e fundit dhe ofertat ekskluzive për produkte elektronike.
            </p>
            
            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                messageType === 'success' 
                  ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-900/20 border border-red-500/30 text-red-400'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="Shkruani email-in tuaj"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 text-sm backdrop-blur-sm"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Duke u abonuar...' : 'Abonohu Tani'}
              </button>
            </form>

            {/* WhatsApp Contact */}
            <div className="mt-4">
              <a 
                href="https://wa.me/049666678" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                <FaWhatsapp className="text-lg" />
                <span>Na Kontaktoni në WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-gray-400 text-xs">
              <span>© {new Date().getFullYear()} Kraslight. Të gjitha të drejtat e rezervuara.</span>
              <span>•</span>
              <span>Developed by Sync Code</span>
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-xs">
              <Link href="/privacy" className="hover:text-white transition-colors">Privatësia</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">Kushtet</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 