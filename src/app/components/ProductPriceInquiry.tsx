import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_URL } from '@/app/lib/contact';

const socialLink =
  'inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-bwseidoround text-xs text-neutral-800 transition-colors';

export default function ProductPriceInquiry({ productName }: { productName: string }) {
  return (
    <div className="max-w-sm rounded-lg border border-neutral-200/80 bg-neutral-50 px-3.5 py-3">
      <p className="font-bwseidoround text-xs text-neutral-600 sm:text-xs">
        Për çmim dhe detaje tjera të produktit{' '}
        <span className="font-bwseidoround font-medium text-sm text-[#0a9945]">{productName}</span> na shkruani
        në WhatsApp ose rrjetet tona sociale.
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLink} hover:border-[#0a9945] hover:text-[#0a9945]`}
        >
          <FaWhatsapp className="text-[#0a9945]" size={14} />
          WhatsApp
        </a>
        <a
          href="https://www.instagram.com/kraslight.ks/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLink} hover:border-neutral-400`}
        >
          <FaInstagram size={13} />
          Instagram
        </a>
        <a
          href="https://www.facebook.com/kraslight"
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLink} hover:border-neutral-400`}
        >
          <FaFacebookF size={12} />
          Facebook
        </a>
      </div>
    </div>
  );
}
