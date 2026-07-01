import type { Order } from '@/app/types/order';

export interface ProductDoc {
  _id: string;
  id?: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  images: string[];
  mainImage?: string;
  description?: string;
  stock?: number | null;
  brand: string;
  brandLogo?: string;
  sizes: string;
  subcategory: string;
  barcode: string;
  gender: string;
  category: string;
  isNewArrival: boolean;
  characteristics: { key: string; value: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export function publicId(row: { id: string; legacy_mongo_id?: string | null }): string {
  return row.legacy_mongo_id ?? row.id;
}

export function productRowToDoc(row: Record<string, unknown>): ProductDoc {
  return {
    _id: publicId(row as { id: string; legacy_mongo_id?: string | null }),
    id: String(row.id),
    title: String(row.title),
    price: row.price != null ? Number(row.price) : undefined,
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    discountPercentage:
      row.discount_percentage != null ? Number(row.discount_percentage) : undefined,
    image: row.image ? String(row.image) : undefined,
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    mainImage: row.main_image ? String(row.main_image) : undefined,
    description: row.description ? String(row.description) : undefined,
    stock: row.stock != null ? Number(row.stock) : null,
    brand: String(row.brand),
    brandLogo: row.brand_logo ? String(row.brand_logo) : undefined,
    sizes: String(row.sizes ?? ''),
    subcategory: String(row.subcategory ?? ''),
    barcode: String(row.barcode ?? ''),
    gender: String(row.gender ?? 'Të Gjitha'),
    category: String(row.category ?? 'Të tjera'),
    isNewArrival: Boolean(row.is_new_arrival),
    characteristics: Array.isArray(row.characteristics)
      ? (row.characteristics as { key: string; value: string }[])
      : [],
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function productDocToRow(doc: Record<string, unknown>) {
  const stockRaw = doc.stock;
  const stock =
    stockRaw != null && stockRaw !== '' && !Number.isNaN(Number(stockRaw))
      ? Number(stockRaw)
      : undefined;

  const row: Record<string, unknown> = {
    title: doc.title,
    price: doc.price ?? null,
    original_price: doc.originalPrice ?? null,
    discount_percentage: doc.discountPercentage ?? null,
    image: doc.image ?? null,
    images: doc.images ?? [],
    main_image: doc.mainImage ?? null,
    description: doc.description ?? null,
    brand: doc.brand,
    brand_logo: doc.brandLogo ?? null,
    sizes: doc.sizes ?? '',
    subcategory: doc.subcategory ?? '',
    barcode: doc.barcode ?? '',
    gender: doc.gender ?? 'Të Gjitha',
    category: doc.category ?? 'Të tjera',
    is_new_arrival: Boolean(doc.isNewArrival),
    characteristics: doc.characteristics ?? [],
    updated_at: new Date().toISOString(),
  };

  if (stock !== undefined) {
    row.stock = stock;
  }

  return row;
}

export function applyProductDiscountFields(
  originalPrice: number | undefined,
  discountPercentage: number | null | undefined
) {
  if (
    originalPrice !== undefined &&
    discountPercentage != null &&
    discountPercentage > 0
  ) {
    return {
      price: originalPrice * (1 - discountPercentage / 100),
      original_price: originalPrice,
      discount_percentage: discountPercentage,
    };
  }

  return {
    price: originalPrice ?? null,
    original_price: null,
    discount_percentage: null,
  };
}

export function orderRowToDoc(row: Record<string, unknown>): Order {
  return {
    _id: publicId(row as { id: string; legacy_mongo_id?: string | null }),
    email: String(row.email),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    phone: String(row.phone),
    country: String(row.country),
    address: String(row.address),
    city: row.city ? String(row.city) : undefined,
    postalCode: String(row.postal_code),
    notes: row.notes ? String(row.notes) : undefined,
    paymentMethod: String(row.payment_method ?? 'cash'),
    items: Array.isArray(row.items) ? (row.items as Order['items']) : [],
    total: row.total != null ? Number(row.total) : 0,
    status: String(row.status ?? 'pending'),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export interface CollectionDoc {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  image: string;
  categories: string[];
  products: string[];
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export function collectionRowToDoc(row: Record<string, unknown>): CollectionDoc {
  return {
    _id: publicId(row as { id: string; legacy_mongo_id?: string | null }),
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    image: String(row.image),
    categories: Array.isArray(row.categories) ? row.categories.map(String) : [],
    products: Array.isArray(row.product_ids) ? row.product_ids.map(String) : [],
    sortOrder: row.sort_order != null ? Number(row.sort_order) : 0,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export interface SliderDoc {
  _id: string;
  id?: string;
  slides: Record<string, unknown>[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function sliderRowToDoc(row: Record<string, unknown>): SliderDoc {
  return {
    _id: publicId(row as { id: string; legacy_mongo_id?: string | null }),
    id: String(row.id),
    slides: Array.isArray(row.slides) ? (row.slides as Record<string, unknown>[]) : [],
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export interface SubscriberDoc {
  _id: string;
  id?: string;
  email: string;
  isActive: boolean;
  subscribedAt?: string;
  lastEmailSent?: string;
  emailCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export function subscriberRowToDoc(row: Record<string, unknown>): SubscriberDoc {
  return {
    _id: publicId(row as { id: string; legacy_mongo_id?: string | null }),
    id: String(row.id),
    email: String(row.email),
    isActive: Boolean(row.is_active),
    subscribedAt: row.subscribed_at ? String(row.subscribed_at) : undefined,
    lastEmailSent: row.last_email_sent ? String(row.last_email_sent) : undefined,
    emailCount: row.email_count != null ? Number(row.email_count) : 0,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/** Match by Supabase uuid or legacy Mongo ObjectId string */
export function idFilter(column: string, id: string) {
  return `${column}.eq.${id},${column.replace('.id', '.legacy_mongo_id')}.eq.${id}`;
}
