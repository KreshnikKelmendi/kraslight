"use client";

import React from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { removeFromCart, updateQuantity, clearCart } from '../../lib/cartSlice';
import { FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  displayMoney,
  formatEuroPrice,
  hasDisplayPrice,
  hasTrackedStock,
  sumPricedCartItems,
} from '@/app/lib/images';

const primaryBtn =
  'inline-flex w-full items-center justify-center gap-2 border border-neutral-900 bg-white py-3.5 font-bwseidoround text-sm text-neutral-900 transition-colors duration-300 hover:bg-neutral-900 hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400';

const ghostBtn =
  'font-bwseidoround text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 transition-colors hover:text-neutral-900 cursor-pointer';

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();
  const itemsTotal = sumPricedCartItems(cart);
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = 0;
  const totalWithShipping = itemsTotal + shipping;

  return (
    <div className="min-h-screen w-full bg-neutral-50 font-bwseidoround">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-10 2xl:px-24 lg:py-16">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a9945]">
              Kraslight
            </p>
            <h1 className="mt-2 font-serif text-4xl text-neutral-900 sm:text-5xl">Shporta juaj</h1>
            {cart.length > 0 && (
              <p className="mt-2 text-sm text-neutral-500">
                {totalUnits} {totalUnits === 1 ? 'copë' : 'copë'} në shportë
              </p>
            )}
          </div>
          <Link
            href="/"
            className="font-bwseidoround text-xs text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
          >
            ← Vazhdo blerjen
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-neutral-100 bg-white px-8 py-16 text-center">
            <p className="font-serif text-2xl text-neutral-900">Shporta është bosh</p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Shtoni produkte për të vazhduar me porosinë.
            </p>
            <button type="button" onClick={() => router.push('/')} className={`${primaryBtn} mt-8`}>
              Shfleto produktet
            </button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 border border-neutral-100 bg-white p-4 sm:gap-5 sm:p-5"
                >
                  {item.image && (
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-neutral-100 sm:h-32 sm:w-28">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-bwseidoround text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
                          {item.name}
                        </h2>
                        {(item.brand || item.size) && (
                          <p className="mt-1 text-[11px] uppercase tracking-wider text-neutral-400">
                            {[item.size, item.brand].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                          Sasia: {item.quantity}
                          {hasTrackedStock(item.stock) && (
                            <span className="font-normal normal-case text-neutral-400">
                              {' '}
                              · {item.stock} në stok
                            </span>
                          )}
                        </p>
                      </div>

                      {hasDisplayPrice(item.price) && (
                        <div className="shrink-0 text-right">
                          <p className="font-bwseidoround text-sm font-semibold text-neutral-900 sm:text-base">
                            {formatEuroPrice(item.price! * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="mt-1 text-xs text-neutral-400">
                              {item.quantity} × {formatEuroPrice(item.price)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center border border-neutral-200">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Zvogëlo sasinë"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="flex h-9 min-w-[2.25rem] items-center justify-center border-x border-neutral-200 text-sm font-semibold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                          }
                          className="flex h-9 w-9 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          disabled={hasTrackedStock(item.stock) && item.quantity >= (item.stock ?? 0)}
                          aria-label="Rrit sasinë"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className={ghostBtn}
                      >
                        Hiq
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <button type="button" onClick={() => dispatch(clearCart())} className={`${ghostBtn} pt-2`}>
                Pastro shportën
              </button>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-neutral-100 bg-white p-6 sm:p-8">
                <h2 className="font-serif text-2xl text-neutral-900">Përmbledhje</h2>

                <div className="mt-6 space-y-3 font-bwseidoround text-sm">
                  {itemsTotal > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Nëntotali</span>
                      <span className="text-neutral-900">{displayMoney(itemsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Transporti</span>
                    <span className="text-neutral-900">Falas</span>
                  </div>
                  {totalWithShipping > 0 && (
                    <div className="flex justify-between border-t border-neutral-200 pt-4 text-base">
                      <span className="font-semibold text-neutral-900">Totali</span>
                      <span className="font-semibold text-neutral-900">
                        {displayMoney(totalWithShipping)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className={`${primaryBtn} mt-8`}
                >
                  Vazhdo me porosinë
                  <FiArrowRight size={16} />
                </button>

                <p className="mt-4 text-center text-[11px] text-neutral-400">
                  Transporti llogaritet në pagesë
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
