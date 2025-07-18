'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactToPdf from 'react-to-pdf';
import logo from '@/public/assets/logo/adidas-logo.png';
import { HiOutlineDocumentArrowDown, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineXMark, HiOutlineCalendar, HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineShoppingBag, HiOutlineCreditCard, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  quantity: number;
  brand?: string;
  size?: string;
  category?: string;
  gender?: string;
  stock?: number;
  description?: string;
}

interface Order {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  address: string;
  city?: string;
  postalCode: string;
  notes?: string;
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Në pritje',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: <HiOutlineClock className="w-4 h-4" />
  },
  processing: {
    label: 'Po procesohet',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <HiOutlineClock className="w-4 h-4" />
  },
  shipped: {
    label: 'U dërgua',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: <HiOutlineTruck className="w-4 h-4" />
  },
  delivered: {
    label: 'U dorëzua',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: <HiOutlineCheckCircle className="w-4 h-4" />
  },
  completed: {
    label: 'Përfunduar',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: <HiOutlineCheckCircle className="w-4 h-4" />
  },
  cancelled: {
    label: 'U anulua',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: <HiOutlineExclamationTriangle className="w-4 h-4" />
  },
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Kesh',
  card: 'Kartelë',
};

// Calculate shipping cost based on country
const calculateShipping = (country: string): number => {
  if (['Shqipëri', 'Maqedoni e Veriut', 'Mali i Zi'].includes(country)) {
    return 10;
  }
  return 0;
};

// Calculate items total
const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// Helper to map Albanian country names to ISO country codes
const countryToCode: Record<string, string> = {
  'Shqipëri': 'al',
  'Kosovë': 'xk',
  'Maqedoni e Veriut': 'mk',
  'Mali i Zi': 'me',
  'Greqi': 'gr',
  'Itali': 'it',
  'Gjermani': 'de',
  'Francë': 'fr',
  'Angli': 'gb',
  'Turqi': 'tr',
  'Shtetet e Bashkuara': 'us',
  // add more as needed
};

function getFlagUrl(country: string) {
  const code = countryToCode[country] || 'un';
  return `https://flagcdn.com/16x12/${code}.png`;
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  // Function to update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      
      // Update the orders list with the new status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      );

      console.log(`Order status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Gabim gjatë përditësimit të statusit');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get status options based on current status
  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = [
      { value: 'pending', label: 'Në pritje', emoji: '⏳' },
      { value: 'processing', label: 'Po procesohet', emoji: '🔄' },
      { value: 'shipped', label: 'U dërgua', emoji: '📦' },
      { value: 'delivered', label: 'U dorëzua', emoji: '✅' },
      { value: 'cancelled', label: 'U anulua', emoji: '❌' },
    ];

    return allStatuses.filter(status => status.value !== currentStatus);
  };

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchOrders() {
        try {
          const res = await fetch('/api/orders');
          if (!res.ok) throw new Error('Failed to fetch orders');
          const data = await res.json();
          setOrders(data);
          setFilteredOrders(data);
        } catch (err) {
          setError('Nuk mund të ngarkohen porositë');
        } finally {
          setLoading(false);
        }
      }
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'yesterday':
            return orderDate >= yesterday && orderDate < today;
          case 'lastWeek':
            return orderDate >= lastWeek;
          case 'lastMonth':
            return orderDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bwseidoround font-light text-slate-900 mb-3 tracking-tight">
              Menaxhimi i Porosive
            </h1>
            <p className="text-slate-600 text-base font-bwseidoround font-light max-w-2xl mx-auto">
              Monitoroni dhe menaxhoni të gjitha porositë e klientëve me efikasitet profesional
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <HiOutlineShoppingBag className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 uppercase tracking-wide mb-2">Totali i Porosive</p>
                <p className="text-4xl font-light text-slate-900">{filteredOrders.length}</p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                  <HiOutlineClock className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 uppercase tracking-wide mb-2">Në Pritje</p>
                <p className="text-4xl font-light text-amber-600">
                  {filteredOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                  <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 uppercase tracking-wide mb-2">Përfunduar</p>
                <p className="text-4xl font-light text-emerald-600">
                  {filteredOrders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <HiOutlineCreditCard className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 uppercase tracking-wide mb-2">Vlera Totale</p>
                <p className="text-4xl font-light text-slate-900">
                  €{filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineFunnel className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-medium text-slate-900">Filtrat e Kërkimit</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineMagnifyingGlass className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Kërko sipas emrit, email, telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-slate-900 bg-white"
              >
                <option value="all">Të gjitha statuset</option>
                <option value="pending">Në pritje</option>
                <option value="processing">Po procesohet</option>
                <option value="shipped">U dërgua</option>
                <option value="delivered">U dorëzua</option>
                <option value="completed">Përfunduar</option>
                <option value="cancelled">Anuluar</option>
              </select>
            </div>

            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-slate-900 bg-white"
              >
                <option value="all">Të gjitha datat</option>
                <option value="today">Sot</option>
                <option value="yesterday">Dje</option>
                <option value="lastWeek">Javën e kaluar</option>
                <option value="lastMonth">Muajin e kaluar</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
            >
              <HiOutlineXMark className="w-4 h-4" />
              Largo Filtrat
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-slate-600 text-xl font-light">Duke ngarkuar porositë...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-rose-600" />
              <p className="text-rose-800 text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingBag className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-3xl font-light text-slate-900 mb-3">Nuk u gjetën porosi</h3>
            <p className="text-slate-600 text-xl font-light max-w-md mx-auto">
              Provo të ndryshosh filtrat ose kriteret e kërkimit për të gjetur porositë që po kërkosh.
            </p>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const itemsTotal = calculateItemsTotal(order.items);
              const shipping = calculateShipping(order.country);
              const status = statusConfig[order.status] || statusConfig.pending;
              
              return (
                <div 
                  key={order._id} 
                  className="bg-white shadow-sm border border-slate-400 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group relative flex flex-col min-h-[180px]"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetails(true);
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-5deg)',
                        width: '220px',
                        height: '220px',
                        borderRadius: '0',
                        background: 'rgba(30, 144, 255, 0.07)',
                        border: '5px solid #2563eb',
                        boxShadow: '0 0 24px 4px rgba(37,99,235,0.10)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.09,
                        pointerEvents: 'none',
                      }}
                    >
                      <img
                        src="/assets/logo/adidas-logo.png"
                        alt="Adidas Logo"
                        style={{
                          width: '140px',
                          height: '140px',
                          filter: 'grayscale(100%)',
                          userSelect: 'none',
                          opacity: 0.92,
                        }}
                      />
                      <span
                        style={{
                          marginTop: 8,
                          fontSize: 22,
                          fontWeight: 700,
                          color: '#2563eb',
                          letterSpacing: 1,
                          textShadow: '0 1px 4px #fff',
                          userSelect: 'none',
                        }}
                      >
                        Porosi e re
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col gap-3 p-3 text-[15px] text-slate-800">
                    <div className="flex flex-col gap-1">
                      <div className="font-extrabold text-lg text-blue-900 tracking-tight truncate drop-shadow-sm">{order.firstName} {order.lastName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${status.bgColor} ${status.color}`}>{status.label}</span>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateOrderStatus(order._id, e.target.value);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={updatingStatus === order._id}
                          className="text-xs bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                        >
                          <option value="">Ndrysho statusin e porosisë</option>
                          {getStatusOptions(order.status).map((status) => (
                            <option key={status.value} value={status.value} className="text-slate-900">
                              {status.emoji} {status.label}
                            </option>
                          ))}
                        </select>
                        {updatingStatus === order._id && (
                          <div className="ml-2 inline-block align-middle">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-300 border-t-slate-600"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                      <span>{order.email}</span>
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{new Date(order.createdAt).toLocaleDateString('sq-AL', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>Produkte: {order.items.length}</span>
                      <span>•</span>
                      <span className='font-bold text-black'>Totali: <span className="font-bold text-slate-900 bg-gray-200 p-1">{order.total.toFixed(2)} €</span></span>
                    </div>
                    {/* Product Images Preview */}
                    <div className="flex flex-col gap-2 mt-1">
                      {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-50 px-2 py-1">
                          <img
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border border-slate-200 bg-white"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-xs truncate max-w-[120px]">{item.name}</span>
                            <div className="flex flex-wrap items-center gap-1">
                              {item.brand && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">{item.brand}</span>}
                              {item.size && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">{item.size}</span>}
                              <span className="text-slate-500 text-[10px]">x{item.quantity}</span>
                              <span className="text-emerald-700 font-bold text-xs ml-2">{item.price.toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-slate-500">+{order.items.length - 3} më shumë</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[15px] text-slate-700 mt-1">
                      <span>Pagesa: <span className="font-semibold">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <HiOutlineTruck className="w-5 h-5 text-blue-600 inline-block" />
                        <span className="font-semibold">Transporti:</span>
                        <span className="font-semibold text-slate-900 text-[12px] underline flex items-center gap-1">
                          <img src={getFlagUrl(order.country)} alt={order.country} className="inline-block w-4 h-3 rounded-sm border border-slate-200" />
                          {order.country}
                        </span>
                        {calculateShipping(order.country) === 0 ? <span className="ml-1">Falas</span> : <span className="ml-1">€{calculateShipping(order.country).toFixed(2)}</span>}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-slate-700 mt-1">
                      <span className="font-bold underline underline-offset-2 text-blue-600">Adresa e dërgimit të porosisë</span>
                      <span className="">{order.address}</span>
                      <span className="font-bold flex items-center gap-1">{order.city},
                        <img src={getFlagUrl(order.country)} alt={order.country} className="inline-block w-4 h-3 rounded-sm border border-slate-200" />
                        {order.country}
                      </span>
                    </div>
                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-100 text-xs text-blue-900">
                        <span className="font-medium">Shënim:</span> {order.notes.length > 40 ? `${order.notes.slice(0, 40)}...` : order.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-light text-slate-900 mb-2">
                      Detajet e Porosisë #{selectedOrder._id.slice(-8)}
                    </h2>
                    <p className="text-slate-600 text-lg">
                      {selectedOrder.firstName} {selectedOrder.lastName} • {new Date(selectedOrder.createdAt).toLocaleDateString('sq-AL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-slate-400 hover:text-slate-600 text-3xl font-light hover:bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* PDF Download Button */}
              <div className="flex justify-end px-8 pt-4">
                <ReactToPdf
                  targetRef={invoiceRef}
                  filename={`invoice-${selectedOrder._id.slice(-8)}.pdf`}
                  options={{ orientation: 'portrait', unit: 'px'}}
                  x={0}
                  y={0}
                  scale={0.8}
                >
                  {({ toPdf }: any) => (
                    <button
                      onClick={toPdf}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl shadow-lg hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                      <HiOutlineDocumentArrowDown className="w-5 h-5" />
                      Shkarko Faturën PDF
                    </button>
                  )}
                </ReactToPdf>
              </div>

              {/* Invoice Content for PDF */}
              <div
                ref={invoiceRef}
                style={{
                  minHeight: '297mm',
                  background: '#fff',
                  color: 'black',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  padding: '0',
                  boxSizing: 'border-box',
                  margin: '0 auto',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                }}
              >
                {/* Watermark: RUNWAY, 45 degrees, opacity 0.3, full page */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '120px',
                      fontWeight: 900,
                      color: '#cccccc',
                      opacity: 0.3,
                      transform: 'rotate(-45deg)',
                      userSelect: 'none',
                      letterSpacing: 10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    RUNWAY
                  </span>
                </div>
                {/* Top Bar: Soft gray, logo, business name */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#ededed', color: '#222', padding: '18px 24px', borderBottom: '2px solid #cccccc' }}>
                  <img src="/assets/logo/adidas-logo.png" alt="Logo" style={{ height: 48, marginRight: 20 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>Runway Shop</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>www.runwayshop.com</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13, color: '#888' }}>
                    <div><b>Data:</b> {new Date(selectedOrder.createdAt).toLocaleDateString('sq-AL')}</div>
                  </div>
                </div>
                {/* Invoice Title */}
                <div style={{ fontSize: 32, fontWeight: 900, color: '#444', margin: '18px 24px 0 24px', letterSpacing: 1 }}>FATURË</div>
                <div style={{ fontSize: 18, color: '#888', margin: '0 24px 18px 24px' }}>Nr. Porosisë: <b>#{selectedOrder._id.slice(-8)}</b></div>
                {/* Customer & Shipping Info: Two columns */}
                <div style={{ display: 'flex', gap: 32, margin: '0 24px 18px 24px' }}>
                  <div style={{ flex: 1, background: '#f7f7f7', border: '1px solid #e0e0e0', borderRadius: 6, padding: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#444' }}>Të dhënat e klientit</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                      <div><b>Emri:</b> {selectedOrder.firstName} {selectedOrder.lastName}</div>
                      <div><b>Email:</b> {selectedOrder.email}</div>
                      <div><b>Telefon:</b> {selectedOrder.phone}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, background: '#f7f7f7', border: '1px solid #e0e0e0', borderRadius: 6, padding: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#444' }}>Adresa e dërgesës</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                      <div><b>Adresa:</b> {selectedOrder.address}</div>
                      <div><b>Qyteti:</b> {selectedOrder.city || '-'}</div>
                      <div><b>Shteti:</b> {selectedOrder.country}</div>
                      <div><b>Kodi Postal:</b> {selectedOrder.postalCode}</div>
                    </div>
                  </div>
                </div>
                {/* Products Table: Modern, strong gray borders */}
                <div style={{ margin: '0 24px 18px 24px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#444', marginBottom: 8 }}>Produktet</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff' }}>
                    <thead>
                      <tr style={{ background: '#ededed', borderBottom: '2px solid #cccccc' }}>
                        <th style={{ border: '1px solid #cccccc', padding: 8, fontWeight: 700, textAlign: 'center' }}>Foto</th>
                        <th style={{ border: '1px solid #cccccc', padding: 8, fontWeight: 700, textAlign: 'center' }}>#</th>
                        <th style={{ border: '1px solid #cccccc', padding: 8, fontWeight: 700, textAlign: 'left' }}>Emri</th>
                        <th style={{ border: '1px solid #cccccc', padding: 8, fontWeight: 700, textAlign: 'center' }}>Sasia</th>
                        <th style={{ border: '1px solid #cccccc', padding: 8, fontWeight: 700, textAlign: 'right' }}>Çmimi</th>
                        <th style={{ border: '1px solid #cccccc', padding: 8, fontWeight: 700, textAlign: 'right' }}>Totali</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f7f7f7' }}>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'center' }}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #e0e0e0', background: '#fafafa' }} />
                            ) : null}
                          </td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #cccccc', padding: 8 }}>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {item.brand && <div style={{ color: '#888', fontSize: 11 }}>Marka: {item.brand}</div>}
                            {item.size && <div style={{ color: '#888', fontSize: 11 }}>Madhësia: {item.size}</div>}
                            {item.category && <div style={{ color: '#888', fontSize: 11 }}>Kategoria: {item.category}</div>}
                          </td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'right' }}>€{item.price.toFixed(2)}</td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'right' }}>€{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Summary Box: Soft gray background, right-aligned */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 24px 18px 24px' }}>
                  <div style={{ minWidth: 260, background: '#ededed', border: '1px solid #cccccc', borderRadius: 6, padding: 16 }}>
                    <table style={{ fontSize: 15, width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: 6, color: '#666' }}>Nëntotali:</td>
                          <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>€{calculateItemsTotal(selectedOrder.items).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: 6, color: '#666' }}>Transporti:</td>
                          <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>{calculateShipping(selectedOrder.country) === 0 ? 'Falas' : `€${calculateShipping(selectedOrder.country).toFixed(2)}`}</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid #cccccc' }}>
                          <td style={{ padding: 6, color: '#444', fontWeight: 700, fontSize: 17 }}>Totali:</td>
                          <td style={{ padding: 6, textAlign: 'right', fontWeight: 700, fontSize: 17 }}>€{selectedOrder.total.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Payment & Notes */}
                <div style={{ margin: '0 24px 18px 24px', fontSize: 13 }}>
                  <div><b>Mënyra e Pagesës:</b> {paymentMethodLabels[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</div>
                  {selectedOrder.notes && (
                    <div style={{ marginTop: 6, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 2, padding: 10, color: '#7a6a00', fontSize: 13, maxWidth: 400 }}>
                      <b>Shënim:</b> {selectedOrder.notes}
                    </div>
                  )}
                </div>
                {/* Footer: Thank you message in Albanian */}
                <div style={{ width: '100%', borderTop: '2px solid #cccccc', padding: '12px 24px 0 24px', fontSize: 15, color: '#444', textAlign: 'center', background: '#fff', letterSpacing: 1, fontWeight: 700 }}>
                  Faleminderit për besimin dhe blerjen tuaj!
                </div>
                <div style={{ width: '100%', fontSize: 12, color: '#888', textAlign: 'center', background: '#fff', letterSpacing: 1, padding: '4px 24px 8px 24px' }}>
                  Faturë e gjeneruar automatikisht nga Runway Shop • www.runwayshop.com
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 