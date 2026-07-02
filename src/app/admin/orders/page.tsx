'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PdfImage } from '@react-pdf/renderer';
import { HiOutlineDocumentArrowDown, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineXMark, HiOutlineShoppingBag, HiOutlineCreditCard, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle, HiOutlineTrash } from 'react-icons/hi2';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { formatEuroPrice, hasDisplayPrice } from '@/app/lib/images';
import { getCountryFlagUrl } from '@/app/lib/contact';
import { isOrderDelivered, notifyOrdersUpdated } from '@/app/lib/orderStatus';

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

type OrderStatusKey = 'pending' | 'delivered';

const statusConfig: Record<
  OrderStatusKey,
  { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Aktive',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: <HiOutlineClock className="w-4 h-4" />,
  },
  delivered: {
    label: 'Done',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    icon: <HiOutlineCheckCircle className="w-4 h-4" />,
  },
};

const getOrderStatusKey = (status: string): OrderStatusKey =>
  isOrderDelivered(status) ? 'delivered' : 'pending';

const paymentMethodLabels: Record<string, string> = {
  cash: 'Kesh',
  card: 'Kartelë',
};

// Calculate shipping cost based on country
const calculateShipping = (country: string): number => {
  if (['Shqipëri', 'Maqedoni e Veriut'].includes(country)) {
    return 10;
  }
  return 0;
};

// Calculate items total
const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => {
    if (!hasDisplayPrice(item.price)) return sum;
    return sum + item.price * item.quantity;
  }, 0);
};

function displayItemUnitPrice(price?: number): string {
  return formatEuroPrice(price) ?? '—';
}

function displayItemLineTotal(item: OrderItem): string {
  if (!hasDisplayPrice(item.price)) return '—';
  return formatEuroPrice(item.price * item.quantity) ?? '—';
}

function displayOrderMoney(amount: number): string {
  if (!hasDisplayPrice(amount)) return '—';
  return `€${amount.toFixed(2)}`;
}

// Add InvoicePDFDocument component with types
interface InvoicePDFDocumentProps {
  order: Order;
}
const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ order }) => (
  <Document>
    <Page size="A4" style={pdfStyles.body}>
      <View style={pdfStyles.header}>
        <PdfImage src="/assets/logo/kraslight-logo.png" style={pdfStyles.logo} />
        <View style={pdfStyles.headerText}>
          <Text style={pdfStyles.title}>Kraslight</Text>
          <Text style={pdfStyles.subtitle}>www.kraslight.com</Text>
        </View>
        <View style={pdfStyles.headerDate}>
          <Text>Data: {new Date(order.createdAt).toLocaleDateString('sq-AL')}</Text>
        </View>
      </View>
      
      <Text style={pdfStyles.invoiceTitle}>FATURË</Text>
      <Text style={pdfStyles.invoiceNumber}>Nr. Porosisë: #{order._id.slice(-8)}</Text>
      
      <View style={pdfStyles.infoRow}>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoTitle}>Të dhënat e klientit</Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Emri: </Text>
            {order.firstName} {order.lastName}
          </Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Email: </Text>
            {order.email}
          </Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Telefon: </Text>
            {order.phone}
          </Text>
        </View>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoTitle}>Adresa e dërgesës</Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Adresa: </Text>
            {order.address}
          </Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Qyteti: </Text>
            {order.city || '-'}
          </Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Shteti: </Text>
            {order.country}
          </Text>
          <Text style={pdfStyles.infoText}>
            <Text style={pdfStyles.infoLabel}>Kodi Postal: </Text>
            {order.postalCode}
          </Text>
        </View>
      </View>
      
      <Text style={pdfStyles.productsTitle}>Produktet</Text>
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.tableCellHeader}>Foto</Text>
        <Text style={pdfStyles.tableCellHeader}>#</Text>
        <Text style={pdfStyles.tableCellHeader}>Emri</Text>
        <Text style={pdfStyles.tableCellHeader}>Sasia</Text>
        <Text style={pdfStyles.tableCellHeader}>Çmimi</Text>
        <Text style={pdfStyles.tableCellHeader}>Totali</Text>
      </View>
      {order.items.map((item: OrderItem, idx: number) => (
        <View style={pdfStyles.tableRow} key={idx}>
          <View style={pdfStyles.imageCell}>
            {item.image && (
              <PdfImage 
                src={item.image} 
                style={pdfStyles.productImage}
              />
            )}
          </View>
          <Text style={pdfStyles.tableCell}>{idx + 1}</Text>
          <Text style={pdfStyles.tableCell}>{item.name}</Text>
          <Text style={pdfStyles.tableCell}>{item.quantity}</Text>
          <Text style={pdfStyles.tableCell}>{displayItemUnitPrice(item.price)}</Text>
          <Text style={pdfStyles.tableCell}>{displayItemLineTotal(item)}</Text>
        </View>
      ))}
      
      <View style={pdfStyles.summaryBox}>
        <Text style={pdfStyles.summaryText}>Nëntotali: {displayOrderMoney(calculateItemsTotal(order.items))}</Text>
        <Text style={pdfStyles.summaryText}>Transporti: {calculateShipping(order.country) === 0 ? 'Falas' : displayOrderMoney(calculateShipping(order.country))}</Text>
        <Text style={pdfStyles.total}>Totali: {displayOrderMoney(order.total)}</Text>
      </View>
      
      <Text style={pdfStyles.payment}>Mënyra e Pagesës: {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</Text>
      {order.notes && <Text style={pdfStyles.notes}>Shënim: {order.notes}</Text>}
      <Text style={pdfStyles.footer}>Faleminderit për besimin dhe blerjen tuaj!</Text>
      <Text style={pdfStyles.footerSmall}>Faturë e gjeneruar automatikisht nga Kraslight • www.kraslight.com</Text>
    </Page>
  </Document>
);

const pdfStyles = StyleSheet.create({
  body: { 
    padding: 20, 
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#2c3e50'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottom: '2 solid #28a745', 
    marginBottom: 15,
    paddingBottom: 12,
    paddingTop: 8
  },
  logo: { 
    width: 60, 
    height: 60, 
    borderRadius: 8,
    border: '2 solid #28a745',
    padding: 6,
    backgroundColor: '#ffffff',
    shadow: '0 2px 8px rgba(40, 167, 69, 0.2)',
    objectFit: 'contain'
  },
  headerText: { 
    flex: 1,
    textAlign: 'left'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  subtitle: { 
    fontSize: 11, 
    color: '#7f8c8d',
    fontWeight: 'normal',
    letterSpacing: 0.3
  },
  headerDate: { 
    textAlign: 'right', 
    fontSize: 10, 
    color: '#7f8c8d',
    fontWeight: 'normal'
  },
  invoiceTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 15,
    marginBottom: 6,
    color: '#2c3e50',
    textAlign: 'center'
  },
  invoiceNumber: { 
    fontSize: 12, 
    color: '#7f8c8d', 
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'normal'
  },
  infoRow: { 
    flexDirection: 'row', 
    gap: 15, 
    marginBottom: 15 
  },
  infoBox: { 
    flex: 1, 
    border: '1 solid #e0e0e0', 
    padding: 10, 
    borderRadius: 6,
    backgroundColor: '#f8f9fa'
  },
  infoTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 6,
    color: '#2c3e50'
  },
  infoText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#2c3e50',
    lineHeight: 1.3
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#7f8c8d'
  },
  productsTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginTop: 15, 
    marginBottom: 8,
    color: '#2c3e50'
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#28a745', 
    padding: 6, 
    marginBottom: 3,
    borderRadius: 4
  },
  tableCellHeader: { 
    flex: 1, 
    fontSize: 10, 
    fontWeight: 'bold', 
    textAlign: 'center',
    color: '#ffffff'
  },
  tableRow: { 
    flexDirection: 'row', 
    padding: 5, 
    borderBottom: '1 solid #e0e0e0',
    backgroundColor: '#ffffff'
  },
  tableCell: { 
    flex: 1, 
    fontSize: 9, 
    textAlign: 'center',
    color: '#2c3e50'
  },
  imageCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2
  },
  productImage: {
    width: 25,
    height: 25,
    borderRadius: 3,
    objectFit: 'cover'
  },
  summaryBox: { 
    border: '2 solid #28a745', 
    padding: 10, 
    marginTop: 15, 
    borderRadius: 6,
    backgroundColor: '#d4edda'
  },
  summaryText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#2c3e50'
  },
  total: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginTop: 6,
    color: '#2c3e50'
  },
  payment: { 
    fontSize: 11, 
    marginTop: 8,
    color: '#2c3e50',
    fontWeight: 'normal'
  },
  notes: { 
    fontSize: 10, 
    color: '#155724', 
    marginTop: 8, 
    fontStyle: 'italic',
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 4,
    border: '1 solid #c3e6cb'
  },
  footer: { 
    fontSize: 11, 
    textAlign: 'center', 
    marginTop: 12, 
    color: '#2c3e50',
    fontWeight: 'bold'
  },
  footerSmall: { 
    fontSize: 8, 
    textAlign: 'center', 
    marginTop: 6, 
    color: '#7f8c8d',
    fontWeight: 'normal'
  },
});

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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteConfirmPosition, setDeleteConfirmPosition] = useState({ x: 0, y: 0 });
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 12;

  // Calculate paginated orders
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  // Close delete popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDeleteConfirm]);

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

      notifyOrdersUpdated();
      console.log(`Order status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Gabim gjatë përditësimit të statusit');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Function to delete a single order
  const deleteOrder = async (orderId: string) => {
    setDeletingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      // Remove the order from the list
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
      setShowDeleteConfirm(false);
      setOrderToDelete(null);

      notifyOrdersUpdated();
      console.log('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Gabim gjatë fshirjes së porosisë');
    } finally {
      setDeletingOrder(null);
    }
  };

  // Function to bulk delete orders
  const bulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    
    setDeletingBulk(true);
    try {
      const response = await fetch('/api/orders/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete orders');
      }

      const result = await response.json();
      
      // Remove the deleted orders from the list
      setOrders(prevOrders => prevOrders.filter(order => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
      setShowBulkDeleteConfirm(false);

      notifyOrdersUpdated();
      console.log(`${result.deletedCount} orders deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      alert('Gabim gjatë fshirjes së porosive');
    } finally {
      setDeletingBulk(false);
    }
  };

  // Function to handle order selection
  const handleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Function to select all orders on current page
  const selectAllOrders = () => {
    const currentPageOrderIds = paginatedOrders.map(order => order._id);
    setSelectedOrders(prev => {
      const allSelected = currentPageOrderIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !currentPageOrderIds.includes(id));
      } else {
        const newSelected = [...prev];
        currentPageOrderIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      }
    });
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
        setFilteredOrders(data);
        notifyOrdersUpdated();
      } catch {
        setError('Nuk mund të ngarkohen porositë');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

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
    if (statusFilter === 'pending') {
      filtered = filtered.filter((order) => !isOrderDelivered(order.status));
    } else if (statusFilter === 'delivered') {
      filtered = filtered.filter((order) => isOrderDelivered(order.status));
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
                <p className="text-lg font-medium text-slate-600 uppercase tracking-wide mb-2">Aktive</p>
                <p className="text-4xl font-light text-slate-700">
                  {filteredOrders.filter((o) => !isOrderDelivered(o.status)).length}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                  <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 uppercase tracking-wide mb-2">U dorëzua</p>
                <p className="text-4xl font-light text-emerald-600">
                  {filteredOrders.filter((o) => isOrderDelivered(o.status)).length}
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
                <option value="pending">Aktive</option>
                <option value="delivered">U dorëzua (Done)</option>
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

        {/* Bulk Actions Section */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div
            className="bg-white shadow-sm border border-slate-200 p-6 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={paginatedOrders.length > 0 && paginatedOrders.every(order => selectedOrders.includes(order._id))}
                    onChange={(e) => {
                      e.stopPropagation();
                      selectAllOrders();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-slate-600 bg-slate-100 border-slate-300 rounded focus:ring-slate-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Zgjidh të gjitha ({paginatedOrders.length})
                  </span>
                </label>
                {selectedOrders.length > 0 && (
                  <span className="text-sm text-slate-600">
                    {selectedOrders.length} porosi e zgjedhur
                  </span>
                )}
              </div>
              
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBulkDeleteConfirm(true);
                    }}
                    disabled={deletingBulk}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deletingBulk ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <HiOutlineTrash className="w-4 h-4" />
                    )}
                    Fshi të Zgjedhurat ({selectedOrders.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedOrders.map((order) => {
                const delivered = isOrderDelivered(order.status);
                const status = statusConfig[getOrderStatusKey(order.status)];

                return (
                  <div
                    key={order._id}
                    className={`relative flex flex-col min-h-[180px] overflow-hidden transition-all duration-300 group ${
                      delivered
                        ? 'bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-400 shadow-md shadow-emerald-100/50'
                        : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg shadow-sm'
                    }`}
                  >
                    <div
                      className="absolute top-3 right-3 z-30 flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleOrderSelection(order._id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-slate-600 bg-white border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDeleteConfirmPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.bottom + 10,
                          });
                          setOrderToDelete(order);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors bg-white/90"
                        title="Fshi porosinë"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>

                    {delivered && (
                      <div className="absolute top-3 left-3 z-30">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          Done
                        </span>
                      </div>
                    )}
                    
                    {!delivered && (
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
                        <NextImage
                          src="/assets/logo/kraslight-logo.png"
                          alt="Kraslight Logo"
                          width={140}
                          height={140}
                          style={{
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
                    )}

                    <div
                      className={`relative z-10 flex flex-col gap-3 p-3 pt-10 text-[15px] text-slate-800 cursor-pointer ${
                        delivered ? 'text-emerald-950' : ''
                      }`}
                      onClick={() => openOrderDetails(order)}
                    >
                      <div className="flex flex-col gap-1">
                        <div
                          className={`font-extrabold text-lg tracking-tight truncate ${
                            delivered ? 'text-emerald-900' : 'text-slate-900'
                          }`}
                        >
                          {order.firstName} {order.lastName}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color} ${status.borderColor}`}
                          >
                            {status.icon}
                            {delivered ? 'U dorëzua' : status.label}
                          </span>
                          {!delivered && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order._id, 'delivered');
                              }}
                              disabled={updatingStatus === order._id}
                              title="U dorëzua"
                              aria-label="U dorëzua"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 border border-emerald-300 bg-white rounded-full px-2.5 py-1 hover:bg-emerald-50 hover:border-emerald-400 disabled:opacity-50 transition-colors shadow-sm"
                            >
                              {updatingStatus === order._id ? (
                                <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                              )}
                              U dorëzua
                            </button>
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
                        <span className='font-bold text-black'>Totali: <span className="font-bold text-slate-900 bg-gray-200 p-1">{displayOrderMoney(order.total)}</span></span>
                      </div>
                      {/* Product Images Preview */}
                      <div className="flex flex-col gap-2 mt-1">
                        {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-50 px-2 py-1">
                            <NextImage
                              src={item.image || '/placeholder.jpg'}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded border border-slate-200 bg-white"
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-xs truncate max-w-[120px]">{item.name}</span>
                              <div className="flex flex-wrap items-center gap-1">
                                {item.brand && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">{item.brand}</span>}
                                {item.size && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">{item.size}</span>}
                                <span className="text-slate-500 text-[10px]">x{item.quantity}</span>
                                {displayItemUnitPrice(item.price) !== '—' && (
                                  <span className="text-neutral-800 font-medium text-xs ml-2">
                                    {displayItemUnitPrice(item.price)}
                                  </span>
                                )}
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
                            <NextImage src={getCountryFlagUrl(order.country, '16x12')} alt={`Flag of ${order.country}`} width={16} height={12} className="inline-block w-4 h-3 rounded-sm border border-slate-200" />
                            {order.country}
                          </span>
                          {calculateShipping(order.country) === 0 ? <span className="ml-1">Falas</span> : <span className="ml-1">€{calculateShipping(order.country).toFixed(2)}</span>}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-slate-700 mt-1">
                        <span className="font-bold underline underline-offset-2 text-blue-600">Adresa e dërgimit të porosisë</span>
                        <span className="">{order.address}</span>
                        <span className="font-bold flex items-center gap-1">{order.city},
                          <NextImage src={getCountryFlagUrl(order.country, '16x12')} alt={`Flag of ${order.country}`} width={16} height={12} className="inline-block w-4 h-3 rounded-sm border border-slate-200" />
                          {order.country}
                        </span>
                      </div>
                      {/* Notes */}
                      {order.notes && (
                        <div
                          className={`mt-1 p-2 rounded border text-xs ${
                            delivered
                              ? 'bg-emerald-100/80 border-emerald-200 text-emerald-900'
                              : 'bg-blue-50 border-blue-100 text-blue-900'
                          }`}
                        >
                          <span className="font-medium">Shënim:</span>{' '}
                          {order.notes.length > 40 ? `${order.notes.slice(0, 40)}...` : order.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && orderToDelete && (
          <div 
            className="fixed z-50"
            style={{
              left: `${deleteConfirmPosition.x}px`,
              top: `${deleteConfirmPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HiOutlineTrash className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Fshi Porosinë
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  A jeni të sigurt që dëshironi të fshini porosinë e <strong>{orderToDelete.firstName} {orderToDelete.lastName}</strong>?
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setOrderToDelete(null);
                    }}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                  >
                    Anulo
                  </button>
                  <button
                    onClick={() => deleteOrder(orderToDelete._id)}
                    disabled={deletingOrder === orderToDelete._id}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {deletingOrder === orderToDelete._id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        Duke fshirë...
                      </>
                    ) : (
                      <>
                        <HiOutlineTrash className="w-3 h-3" />
                        Fshi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Arrow pointing up */}
            <div 
              className="absolute w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"
              style={{
                left: '50%',
                top: '-4px',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineTrash className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Fshi Porositë e Zgjedhura
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  A jeni të sigurt që dëshironi të fshini <strong>{selectedOrders.length} porosi</strong>?
                  <br />
                  <span className="text-xs text-red-600">
                    Ky veprim nuk mund të kthehet mbrapsht.
                  </span>
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowBulkDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Anulo
                  </button>
                  <button
                    onClick={bulkDeleteOrders}
                    disabled={deletingBulk}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                  >
                    {deletingBulk ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Duke fshirë...
                      </>
                    ) : (
                      <>
                        <HiOutlineTrash className="w-4 h-4" />
                        Fshi {selectedOrders.length} Porosi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-[#0a9945] border-[#0a9945] text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:z-20 focus:outline-none`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-1">
                      Detajet e Porosisë #{selectedOrder._id.slice(-8)}
                    </h2>
                    <p className="text-gray-600 text-sm">
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
                    className="text-gray-400 hover:text-gray-600 text-xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* PDF Download Button */}
              {selectedOrder && (
                <div className="flex justify-end px-6 pt-4">
                  <PDFDownloadLink
                    document={<InvoicePDFDocument order={selectedOrder} />}
                    fileName={`invoice-${selectedOrder._id.slice(-8)}.pdf`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                  >
                    {({ loading }: { loading: boolean }) =>
                      loading ? 'Duke gjeneruar PDF...' : <><HiOutlineDocumentArrowDown className="w-4 h-4" /> Shkarko Faturën PDF</>
                    }
                  </PDFDownloadLink>
                </div>
              )}

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
                    KRASLIGHT
                  </span>
                </div>
                {/* Top Bar: Soft gray, logo, business name */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#ededed', color: '#222', padding: '18px 24px', borderBottom: '2px solid #cccccc' }}>
                  <NextImage src="/assets/logo/kraslight-logo.png" alt="Kraslight Logo" width={48} height={48} className="mr-5" />
                  <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>Kraslight</div>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>www.kraslight.com</div>
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
                      {selectedOrder.items.map((item: OrderItem, idx: number) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f7f7f7' }}>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'center' }}>
                            {item.image ? (
                              <div style={{ backgroundColor: '#fafafa', borderRadius: 6, border: '1px solid #e0e0e0', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NextImage src={item.image} alt={item.name} width={48} height={48} style={{ borderRadius: 6 }} />
                              </div>
                            ) : null}
                          </td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #cccccc', padding: 8 }}>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {item.brand && <div style={{ color: '#888', fontSize: 11 }}>Brendi: {item.brand}</div>}
                            {item.size && <div style={{ color: '#888', fontSize: 11 }}>Madhësia: {item.size}</div>}
                            {item.category && <div style={{ color: '#888', fontSize: 11 }}>Kategoria: {item.category}</div>}
                          </td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'right' }}>{displayItemUnitPrice(item.price)}</td>
                          <td style={{ border: '1px solid #cccccc', padding: 8, textAlign: 'right' }}>{displayItemLineTotal(item)}</td>
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
                          <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>{displayOrderMoney(calculateItemsTotal(selectedOrder.items))}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: 6, color: '#666' }}>Transporti:</td>
                          <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>{calculateShipping(selectedOrder.country) === 0 ? 'Falas' : displayOrderMoney(calculateShipping(selectedOrder.country))}</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid #cccccc' }}>
                          <td style={{ padding: 6, color: '#444', fontWeight: 700, fontSize: 17 }}>Totali:</td>
                          <td style={{ padding: 6, textAlign: 'right', fontWeight: 700, fontSize: 17 }}>{displayOrderMoney(selectedOrder.total)}</td>
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
                  Faturë e gjeneruar automatikisht nga Kraslight • www.kraslight.com
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 