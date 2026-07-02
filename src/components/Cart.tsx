'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../lib/store';
import { removeFromCart, updateQuantity, clearCart } from '../lib/cartSlice';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  displayMoney,
  formatEuroPrice,
  hasDisplayPrice,
  hasTrackedStock,
  sumPricedCartItems,
} from '@/app/lib/images';

type CartProps = {
  onClose?: () => void;
  highlightItemId?: string | null;
};

export default function Cart({ onClose, highlightItemId }: CartProps) {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const highlightedItem = highlightItemId
    ? cart.find((item) => item.id === highlightItemId)
    : cart[cart.length - 1];

  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const itemsTotal = sumPricedCartItems(cart);

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    const item = cart.find((i) => i.id === itemId);
    if (item && hasTrackedStock(item.stock)) {
      const maxQuantity = Math.min(newQuantity, item.stock!);
      if (maxQuantity > 0) {
        dispatch(updateQuantity({ id: itemId, quantity: maxQuantity }));
      }
    } else if (newQuantity > 0) {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleContinueToCheckout = () => {
    onClose?.();
    router.push('/checkout');
  };

  const cartContent = (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={`fixed z-[10000] flex flex-col bg-white font-bwseidoround shadow-2xl
          inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl animate-slide-up-sheet
          lg:inset-x-auto lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:h-full lg:w-[420px] lg:rounded-none lg:animate-slide-in lg:will-change-transform`}
        role="dialog"
        aria-modal="true"
        aria-label="Shporta"
      >
        <div className="flex shrink-0 justify-center pt-3 lg:hidden">
          <span className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        <div className="relative flex shrink-0 items-center justify-center border-b border-neutral-100 px-5 py-4">
          {highlightedItem && cart.length > 0 ? (
            <p className="max-w-[85%] text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
              {highlightedItem.size ? `${highlightedItem.size} · ` : ''}
              {highlightedItem.name.toUpperCase()} · SHTUAR NË SHPORTË
            </p>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-900">
              Shporta juaj
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-500 transition-colors hover:text-neutral-900"
            aria-label="Mbyll shportën"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-2xl text-neutral-900">Shporta është bosh</p>
              <p className="mt-2 text-sm text-neutral-500">Shtoni produkte për të vazhduar.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-4 border-b border-neutral-100 pb-6 last:border-0 last:pb-0 ${
                    highlightItemId === item.id ? 'rounded-lg bg-[#0a9945]/5 p-3 -mx-1' : ''
                  }`}
                >
                  {item.image && (
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-neutral-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-neutral-900">
                          {item.name}
                        </h3>
                        {hasDisplayPrice(item.price) && (
                          <p className="mt-1 text-sm font-medium text-neutral-900">
                            {formatEuroPrice(item.price! * item.quantity)}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                          Sasia: {item.quantity}
                          {hasDisplayPrice(item.price) && item.quantity > 1 && (
                            <span className="font-normal normal-case text-neutral-400">
                              {' '}
                              ({item.quantity} × {formatEuroPrice(item.price)})
                            </span>
                          )}
                        </p>
                        {(item.size || item.brand) && (
                          <p className="mt-1 text-xs uppercase tracking-wider text-neutral-400">
                            {[item.size, item.brand].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
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
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          disabled={
                            hasTrackedStock(item.stock) && item.quantity >= (item.stock ?? 0)
                          }
                          aria-label="Rrit sasinë"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        Hiq
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="shrink-0 border-t border-neutral-100 bg-white px-5 pb-6 pt-4 lg:pb-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Shporta
                </p>
                <p className="mt-1 text-sm text-neutral-600">Sasia totale: {totalUnits} copë</p>
              </div>
              {itemsTotal > 0 && (
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Nëntotali
                  </p>
                  <p className="mt-1 text-xl font-semibold text-neutral-900">
                    {displayMoney(itemsTotal)}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinueToCheckout}
              className="w-full cursor-pointer border border-neutral-900 bg-white py-4 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors duration-300 hover:bg-neutral-900 hover:text-white"
            >
              Vazhdo me porosinë
            </button>

            <button
              type="button"
              onClick={() => {
                onClose?.();
                router.push('/cart');
              }}
              className="mt-3 w-full cursor-pointer border border-neutral-200 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-900 transition-colors duration-300 hover:border-neutral-900"
            >
              Shiko shportën
            </button>

            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              className="mt-4 w-full cursor-pointer text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 transition-colors hover:text-neutral-900"
            >
              Pastro shportën
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (!mounted) return null;

  return createPortal(cartContent, document.body);
}
