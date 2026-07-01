'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { clearCart } from '../../lib/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaCheck } from 'react-icons/fa';
import {
  displayMoney,
  formatEuroPrice,
  hasDisplayPrice,
  sumPricedCartItems,
} from '@/app/lib/images';

const inputClass =
  'w-full rounded-md border border-neutral-200 bg-white px-4 py-3 font-bwseidoround text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none';

function parseShippingAddress(fullAddress: string) {
  const parts = fullAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return {
      address: fullAddress.trim(),
      city: parts[parts.length - 2],
      postalCode: parts[parts.length - 1],
    };
  }

  if (parts.length === 2) {
    return {
      address: fullAddress.trim(),
      city: parts[0],
      postalCode: parts[1],
    };
  }

  return {
    address: fullAddress.trim(),
    city: '',
    postalCode: fullAddress.trim() || '00000',
  };
}

export default function CheckoutPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Kosovë');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmedCustomer, setConfirmedCustomer] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  const shipping = ['Shqipëri', 'Maqedoni e Veriut', 'Mali i Zi'].includes(country) ? 10 : 0;
  const itemsTotal = sumPricedCartItems(cart);
  const totalWithShipping = itemsTotal + shipping;
  const showSubtotal = itemsTotal > 0;
  const showTotal = totalWithShipping > 0;

  const canSubmit =
    !loading &&
    cart.length > 0 &&
    email &&
    firstName &&
    lastName &&
    phone &&
    shippingAddress.trim() &&
    country;

  useEffect(() => {
    if (success) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [success]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const { address, city, postalCode } = parseShippingAddress(shippingAddress);

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          country,
          address,
          city,
          postalCode,
          notes,
          items: cart,
          paymentMethod: 'cash',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.details ? `${data.error}: ${data.details}` : data.error || 'Porosia dështoi');
        setLoading(false);
        return;
      }
      setConfirmedCustomer({ firstName, lastName, email });
      setSuccess(true);
      dispatch(clearCart());
      setTimeout(() => router.push('/'), 6000);
    } catch {
      setError('Porosia dështoi');
    } finally {
      setLoading(false);
    }
  };

  if (success && confirmedCustomer) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 2xl:px-24">
        <div className="w-full max-w-lg px-6 py-14 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#0a9945] text-white">
            <FaCheck className="h-5 w-5" />
          </div>
          <p className="font-serif text-3xl text-neutral-900 sm:text-4xl">
            Faleminderit, {confirmedCustomer.firstName} {confirmedCustomer.lastName}!
          </p>
          <p className="mt-4 font-bwseidoround text-base leading-relaxed text-neutral-600">
            Porosia juaj u dërgua me sukses. Do të kontaktoheni së shpejti për konfirmim.
          </p>
          <div className="mx-auto mt-8 max-w-md rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-left">
            <p className="font-bwseidoround text-sm leading-relaxed text-neutral-700">
              Kontrolloni email-in tuaj{' '}
              <span className="font-semibold text-neutral-900">{confirmedCustomer.email}</span>.
            </p>
            <p className="mt-2 font-bwseidoround text-sm leading-relaxed text-neutral-500">
              Nëse nuk e gjeni në inbox, kontrolloni në spam ose junk.
            </p>
          </div>
          <p className="mt-8 font-bwseidoround text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            Duke ju ridrejtuar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        {/* Left — form */}
        <form onSubmit={handleCheckout} className="min-w-0 border-b border-neutral-200 px-5 py-10 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-12 xl:px-16 2xl:px-24">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-neutral-900 sm:text-[2.75rem]">Pagesa</h1>
              <p className="mt-3 font-bwseidoround text-[11px] uppercase tracking-[0.22em] text-neutral-400">
                Detajet e kontaktit dhe dërgesës
              </p>
            </div>
            <Link
              href="/cart"
              className="font-bwseidoround text-xs text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
            >
              ← Kthehu te shporta
            </Link>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="mb-4 font-bwseidoround text-sm font-semibold text-neutral-900">
                Informacioni i kontaktit
              </h2>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Emri"
                    className={inputClass}
                    required
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mbiemri"
                    className={inputClass}
                    required
                  />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={inputClass}
                  required
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Numri i telefonit"
                  className={inputClass}
                  required
                />
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-bwseidoround text-sm font-semibold text-neutral-900">
                Shteti i dërgimit
              </h2>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
                required
              >
                <option value="Kosovë">Kosovë — transport falas</option>
                <option value="Shqipëri">Shqipëri — {displayMoney(10)} transport</option>
                <option value="Maqedoni e Veriut">Maqedoni e Veriut — {displayMoney(10)} transport</option>
                <option value="Mali i Zi">Mali i Zi — {displayMoney(10)} transport</option>
              </select>
            </section>

            <section>
              <h2 className="mb-4 font-bwseidoround text-sm font-semibold text-neutral-900">
                Adresa e dërgimit
              </h2>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Rruga, qyteti, kodi postar"
                rows={4}
                className={`${inputClass} resize-none`}
                required
              />
            </section>

            <section>
              <p className="mb-4 font-bwseidoround text-[11px] uppercase tracking-[0.22em] text-neutral-400">
                Pagesa
              </p>
              <div className="rounded-md border border-neutral-200 px-4 py-3.5">
                <p className="font-bwseidoround text-sm text-neutral-800">
                  Pagesa CASH (paguani në momentin kur pranoni porosinë)
                </p>
              </div>
            </section>

            <section>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Shënime shtesë (opsionale)"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </section>

            {error && (
              <p className="rounded-md bg-red-50 px-4 py-3 font-bwseidoround text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-md border py-3.5 font-bwseidoround text-sm transition-colors duration-300 ${
                canSubmit
                  ? 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white'
                  : 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
              }`}
            >
              {loading ? 'Duke dërguar...' : 'Dërgo porosinë'}
            </button>

            {cart.length === 0 && (
              <p className="text-center font-bwseidoround text-sm text-neutral-400">
                Shporta është bosh.
              </p>
            )}
          </div>
        </form>

        {/* Right — order summary */}
        <aside className="min-w-0 self-start px-5 py-10 sm:px-8 lg:sticky lg:top-28 lg:px-10 lg:py-12 xl:px-12 2xl:px-24">
          <h2 className="font-serif text-3xl text-neutral-900 sm:text-4xl">Porosia juaj</h2>

          <div className="mt-8 space-y-4">
            {cart.length === 0 ? (
              <p className="py-8 text-center font-bwseidoround text-sm text-neutral-400">
                Nuk ka produkte në shportë.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-md border border-neutral-200 p-4"
                >
                  {item.image && (
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-neutral-50">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bwseidoround text-sm font-medium leading-snug text-neutral-900 line-clamp-2">
                        {item.name}
                      </p>
                      {hasDisplayPrice(item.price) && (
                        <p className="shrink-0 font-bwseidoround text-sm text-neutral-900">
                          {formatEuroPrice(item.price! * item.quantity)}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5 font-bwseidoround text-[11px] uppercase tracking-wider text-neutral-500">
                      <p>Sasia: {item.quantity}</p>
                      {item.brand && <p>Marka: {item.brand}</p>}
                      {item.size && <p>Madhësia: {item.size}</p>}
                    </div>
                    {hasDisplayPrice(item.price) && (
                      <p className="mt-2 font-bwseidoround text-xs text-neutral-500">
                        {item.quantity} × {formatEuroPrice(item.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 space-y-3 border-t border-neutral-200 pt-6 font-bwseidoround text-sm">
            {showSubtotal && (
              <div className="flex justify-between text-neutral-600">
                <span>Nëntotali</span>
                <span className="text-neutral-900">{displayMoney(itemsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 text-neutral-600">
              <span className="min-w-0">
                Dërgimi në {country}
                {shipping > 0 ? ` (${displayMoney(shipping)})` : ' (Falas)'}
              </span>
              <span className="shrink-0 text-neutral-900">
                {shipping === 0 ? 'Falas' : displayMoney(shipping)}
              </span>
            </div>
            {showTotal && (
              <div className="flex justify-between border-t border-neutral-200 pt-4 font-bwseidoround text-lg text-neutral-900">
                <span className="font-semibold">Totali</span>
                <span className="font-semibold">{displayMoney(totalWithShipping)}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
