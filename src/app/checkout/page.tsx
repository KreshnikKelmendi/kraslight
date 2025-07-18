'use client';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { clearCart } from '../../lib/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CheckoutPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Kosovë');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  let shipping = 0;
  if (["Shqipëri", "Maqedoni e Veriut", "Mali i Zi"].includes(country)) {
    shipping = 10;
  }
  const itemsTotal = cart.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const totalWithShipping = itemsTotal + shipping;

  // Scroll to top when success message shows
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
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
          paymentMethod,
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
      setTimeout(() => router.push('/'), 2500);
    } catch {
      setError('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-700">Porosia u dërgua me sukses!</h2>
          <p className="text-gray-600 mb-6">Do të kontaktoheni së shpejti për konfirmim.</p>
          <div className="w-full bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-700">Duke ju ridrejtuar në faqen kryesore...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Përfundo Porosinë</h1>
          <p className="text-gray-600">Plotëso detajet për të përfunduar blerjen</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleCheckout} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              {/* Customer Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Detajet e klientit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni *</label>
                    <input 
                      type="tel" 
                      placeholder="+383 44 123 456" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emri *</label>
                    <input 
                      type="text" 
                      placeholder="Emri juaj" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mbiemri *</label>
                    <input 
                      type="text" 
                      placeholder="Mbiemri juaj" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Detajet e transportit
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shteti *</label>
                    <select 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required
                    >
                      <option value="Kosovë">Kosovë</option>
                      <option value="Shqipëri">Shqipëri</option>
                      <option value="Maqedoni e Veriut">Maqedoni e Veriut</option>
                      <option value="Mali i Zi">Mali i Zi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qyteti</label>
                    <input 
                      type="text" 
                      placeholder="Qyteti juaj" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    />
                  </div>
                </div>

                {/* Warning for non-Kosovo countries */}
                {country !== 'Kosovë' && (
                  <div className="mt-4 w-full mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Transporti ndërkombëtar</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Për transportin në {country}, kostoja shtesë është €{shipping}. Koha e dorëzimit mund të jetë 3-7 ditë pune.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresa *</label>
                    <input 
                      type="text" 
                      placeholder="Adresa e plotë" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kodi postar *</label>
                    <input 
                      type="text" 
                      placeholder="10000" 
                      value={postalCode} 
                      onChange={e => setPostalCode(e.target.value)} 
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>
                </div>

             
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shënime shtesë</label>
                <textarea 
                  placeholder="Shënime të veçanta për porosinë..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                  rows={3} 
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={loading || cart.length === 0 || !email || !firstName || !lastName || !phone || !country || !address || !postalCode}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Duke dërguar...
                  </div>
                ) : (
                  'Dërgo Porosinë'
                )}
              </button>
              
              {cart.length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500">Shporta është bosh.</p>
                </div>
              )}
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Përmbledhje e porosisë ({cart.length})
              </h3>
              
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    {item.image && (
                      <Image src={item.image} alt={item.name} width={64} height={64} className="w-16 h-16 object-cover rounded-lg border flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.brand}
                          </span>
                          {item.size && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Sasia: {item.quantity}</span>
                          {item.discountPercentage && item.discountPercentage > 0 ? (
                            <div className="text-right">
                              <div className="text-sm line-through text-gray-400">€{item.originalPrice?.toFixed(2)}</div>
                              <div className="font-semibold text-red-600">€{item.price.toFixed(2)}</div>
                              <div className="text-xs text-red-600">-{item.discountPercentage}%</div>
                            </div>
                          ) : (
                            <div className="font-semibold text-gray-900">€{item.price.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nëntotali</span>
                  <span className="font-semibold text-gray-900">€{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transporti</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? 'Falas' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-3">
                  <span className="text-gray-900">Totali</span>
                  <span className="text-blue-600">€{totalWithShipping.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-4 text-gray-900">Mënyra e pagesës</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 bg-white rounded-lg border-2 border-transparent hover:border-blue-200 cursor-pointer transition-all">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cash" 
                      checked={paymentMethod === 'cash'} 
                      onChange={e => setPaymentMethod(e.target.value)} 
                      className="mr-3 text-blue-600 focus:ring-blue-500" 
                    />
                    <div>
                      <div className="font-medium">Paguaj me kesh</div>
                      <div className="text-sm text-gray-500">Pas pranimit të porosisë</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-lg border-2 border-transparent hover:border-blue-200 cursor-pointer transition-all">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={e => setPaymentMethod(e.target.value)} 
                      className="mr-3 text-blue-600 focus:ring-blue-500" 
                    />
                    <div>
                      <div className="font-medium">Paguaj me kartelë</div>
                      <div className="text-sm text-gray-500">Online pagesë</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 