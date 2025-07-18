// Order and OrderItem shared interfaces
export interface OrderItem {
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

export interface Order {
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