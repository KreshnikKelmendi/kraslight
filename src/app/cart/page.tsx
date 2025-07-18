"use client";

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { removeFromCart, updateQuantity, clearCart } from '../../lib/cartSlice';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let shipping = 0;
  if (["Shqipëri", "Maqedoni e Veriut", "Mali i Zi"].includes('Kosovë')) {
    shipping = 10;
  }
  const totalWithShipping = total + shipping;

  return (
    <div className="min-h-screen w-full bg-gray-100 py-10 px-4 lg:px-10 flex justify-center">
      <div className="w-full flex flex-col lg:flex-row gap-10">
        {/* Cart Items Section */}
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center lg:text-left tracking-tight">Shporta juaj</h1>
          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-xl mx-auto flex flex-col items-center">
              {/* SVG Illustration */}
              <svg width="120" height="120" fill="none" viewBox="0 0 120 120" className="mb-6">
                <circle cx="60" cy="60" r="60" fill="#e0f2fe" />
                <rect x="35" y="50" width="50" height="30" rx="8" fill="#bae6fd" />
                <rect x="45" y="60" width="30" height="10" rx="3" fill="#7dd3fc" />
                <circle cx="50" cy="85" r="5" fill="#38bdf8" />
                <circle cx="70" cy="85" r="5" fill="#38bdf8" />
              </svg>
              <p className="text-xl text-gray-700 font-semibold mb-2">Shporta juaj është bosh</p>
              <p className="text-gray-500 mb-6">Shto produkte për të vazhduar me porosinë.</p>
              <button
                onClick={() => router.push('/shop/new-arrivals')}
                className="bg-gradient-to-r from-[#0a9945] to-gray-800 text-white px-8 py-3 rounded-lg font-semibold shadow hover:from-[#0a9945]/90 hover:to-gray-800/90 transition-all cursor-pointer"
              >
                Shfleto produktet
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-6 p-6 hover:shadow-2xl transition-shadow">
                  <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.brand && (
                            <span className="bg-gray-900 text-white px-2 py-0.5 text-xs font-bold rounded">{item.brand}</span>
                          )}
                          {item.size && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded">{item.size}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                            className="px-2 py-1 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                            disabled={item.quantity <= 1}
                          >-
                          </button>
                          <span className="px-3 py-1 text-gray-900 font-bold bg-gray-50 rounded text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                            className="px-2 py-1 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >+
                          </button>
                          <span className="text-xs text-gray-500 ml-2">{item.stock !== undefined ? `${item.stock} në stok` : ''}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[120px]">
                        {item.discountPercentage && item.discountPercentage > 0 ? (
                          <>
                            <span className="text-xs line-through text-gray-400">€{item.originalPrice?.toFixed(2)}</span>
                            <span className="font-bold text-lg text-red-600">€{item.price.toFixed(2)}</span>
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 font-bold rounded">-{item.discountPercentage}%</span>
                          </>
                        ) : (
                          <span className="font-bold text-lg text-gray-900">€{item.price.toFixed(2)}</span>
                        )}
                        <span className="text-xs text-gray-500">€{(item.price * item.quantity).toFixed(2)} total</span>
                        <button
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="mt-2 text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        >
                          <FaTrash className="w-3 h-3" />
                          Hiq nga shporta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => dispatch(clearCart())}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 font-semibold rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <FaTrash className="w-4 h-4" />
                Pastro Shportën
              </button>
            </div>
          )}
        </div>
        {/* Summary Sidebar */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0">
          <div className="sticky top-10">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center lg:text-left">Përmbledhje</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium text-base">Nëntotali:</span>
                  <span className="font-bold text-gray-900 text-base">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium text-base">Transporti:</span>
                  <span className="font-bold text-gray-900 text-base">{shipping === 0 ? 'Falas' : `€${shipping}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Totali:</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-[#0a9945] to-gray-800 bg-clip-text text-transparent">€{totalWithShipping.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-[#0a9945] to-gray-800 hover:from-[#0a9945]/90 hover:to-gray-800/90 text-white py-4 px-4 font-bold rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2 text-lg cursor-pointer"
                disabled={cart.length === 0}
              >
                Vazhdo me Porosinë
                <FaArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 