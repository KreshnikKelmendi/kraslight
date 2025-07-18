'use client';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../lib/store';
import { removeFromCart, updateQuantity, clearCart } from '../lib/cartSlice';
import { FaTimes, FaTrash, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function Cart({ onClose }: { onClose?: () => void }) {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Kosovë');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate shipping
  let shipping = 0;
  if (["Shqipëri", "Maqedoni e Veriut", "Mali i Zi"].includes(country)) {
    shipping = 10;
  }
  const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWithShipping = itemsTotal + shipping;

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    const item = cart.find(i => i.id === itemId);
    if (item && item.stock !== undefined) {
      // Ensure quantity doesn't exceed stock
      const maxQuantity = Math.min(newQuantity, item.stock);
      if (maxQuantity > 0) {
        dispatch(updateQuantity({ id: itemId, quantity: maxQuantity }));
      }
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleCheckout = async () => {
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
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to place order');
        setLoading(false);
        return;
      }
      setSuccess(true);
      dispatch(clearCart());
      setShowCheckout(false);
    } catch {
      setError('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToCheckout = () => {
    if (onClose) {
      onClose();
    }
    router.push('/checkout');
  };

  const cartContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" 
        onClick={onClose}
      />
      
      {/* Cart Container */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[380px] md:w-[420px] bg-white shadow-2xl z-[10000] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0a9945] to-gray-800 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20">
              <FaShoppingBag className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold">Shporta</h2>
              <p className="text-gray-300 text-xs">{cart.length} artikuj</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Cart Items - Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-gray-100 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <FaShoppingBag className="text-gray-400 text-xl" />
                </div>
                <h3 className="text-gray-600 text-base font-semibold mb-1">Shporta është bosh</h3>
                <p className="text-gray-400 text-sm">Shto artikuj për të vazhduar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 p-3 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      {item.image && (
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                          <button
                            onClick={() => {
                              if (window.confirm('A jeni i sigurtë se doni ta fshini?')) {
                                dispatch(removeFromCart(item.id));
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 ml-1 flex-shrink-0 cursor-pointer"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.brand && (
                            <span className="bg-gray-900 text-white px-1.5 py-0.5 text-xs font-bold">
                              {item.brand}
                            </span>
                          )}
                          {item.size && (
                            <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 text-xs">
                              {item.size}
                            </span>
                          )}
                        </div>
                        
                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => handleQuantityUpdate(item.id, Math.max(1, item.quantity - 1))}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-gray-900 font-bold bg-gray-50 min-w-[24px] text-center text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                              >
                                +
                              </button>
                            </div>
                            {item.stock !== undefined && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5">
                                {item.stock} në stok
                              </span>
                            )}
                          </div>
                          
                          <div className="text-right">
                            {item.discountPercentage && item.discountPercentage > 0 ? (
                              <div>
                                <p className="text-xs line-through text-gray-400">€{item.originalPrice?.toFixed(2)}</p>
                                <p className="font-bold text-base text-red-600">€{item.price.toFixed(2)}</p>
                                <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 font-bold mt-0.5">
                                  -{item.discountPercentage}%
                                </div>
                              </div>
                            ) : (
                              <p className="font-bold text-base text-gray-900">€{item.price.toFixed(2)}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">€{(item.price * item.quantity).toFixed(2)} total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white flex-shrink-0">
          <div className="p-3">
            {cart.length > 0 && (
              <>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium text-sm">Nëntotali:</span>
                    <span className="font-bold text-gray-900 text-sm">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium text-sm">Transporti:</span>
                    <span className="font-bold text-gray-900 text-sm">{shipping === 0 ? 'Falas' : `€${shipping}`}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-base text-gray-900">Totali:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#0a9945] to-gray-800 bg-clip-text text-transparent">€{totalWithShipping.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => dispatch(clearCart())} 
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 font-semibold transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer" 
                  >
                    <FaTrash className="w-3 h-3" />
                    Pastro Shportën
                  </button>

                  {/* Shiko shportën button */}
                  <button
                    onClick={() => {
                      if (onClose) onClose();
                      router.push('/cart');
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 font-semibold transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <FaShoppingBag className="w-3 h-3" />
                    Shiko shportën
                  </button>
                  
                  <button 
                    onClick={handleContinueToCheckout}
                    className="w-full bg-gradient-to-r from-[#0a9945] to-gray-800 hover:from-[#0a9945]/90 hover:to-gray-800/90 text-white py-2 px-4 font-semibold transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    Vazhdo me Porosinë
                    <FaArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            {/* Checkout Form */}
            {showCheckout && (
              <div className="mt-3 p-3 border border-gray-200 bg-gray-50">
                <h3 className="font-bold mb-3 text-gray-900 text-base">Detajet e klientit</h3>
                <div className="space-y-2">
                  <input 
                    type="email" 
                    placeholder="Email për konfirmim të porosisë *" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Emri *" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                      required 
                    />
                    <input 
                      type="text" 
                      placeholder="Mbiemri *" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                      required 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Telefoni *" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                    required 
                  />
                  
                  <h3 className="font-bold mb-2 mt-4 text-gray-900 text-base">Detajet e transportit</h3>
                  <select 
                    value={country} 
                    onChange={e => setCountry(e.target.value)} 
                    className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                    required
                  >
                    <option value="Kosovë">Kosovë</option>
                    <option value="Shqipëri">Shqipëri</option>
                    <option value="Maqedoni e Veriut">Maqedoni e Veriut</option>
                    <option value="Mali i Zi">Mali i Zi</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Adresa *" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Qyteti" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                    />
                    <input 
                      type="text" 
                      placeholder="Kodi postar *" 
                      value={postalCode} 
                      onChange={e => setPostalCode(e.target.value)} 
                      className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 bg-white text-sm" 
                      required 
                    />
                  </div>
                  <textarea 
                    placeholder="Shënime shtesë" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="w-full p-2 border border-gray-300 focus:ring-1 focus:ring-[#0a9945] focus:border-transparent transition-all duration-200 resize-none bg-white text-sm" 
                    rows={2}
                  />
                  
                  <div className="bg-gray-100 p-2 border border-gray-200">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 font-medium text-sm">Transporti:</span>
                      <span className="font-bold text-sm">{shipping === 0 ? 'Falas' : `€${shipping}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                      <span>Totali me transport:</span>
                      <span className="text-black">€{totalWithShipping.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCheckout} 
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer" 
                    disabled={loading || !email || !firstName || !lastName || !phone || !country || !address || !postalCode}
                  >
                    {loading ? 'Duke dërguar...' : 'Dërgo Porosinë'}
                  </button>
                  <button 
                    onClick={() => setShowCheckout(false)} 
                    className="w-full text-gray-500 hover:text-gray-700 py-1 transition-colors duration-200 font-medium text-sm cursor-pointer"
                  >
                    Anulo
                  </button>
                  {error && <div className="text-red-500 mt-2 p-2 bg-red-50 border border-red-200 text-sm">{error}</div>}
                </div>
              </div>
            )}
            {success && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200">
                <div className="text-green-600 font-bold text-center text-sm">Porosia u dërgua me sukses!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render at document root level
  if (!mounted) return null;
  
  return createPortal(cartContent, document.body);
} 