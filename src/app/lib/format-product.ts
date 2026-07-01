import { sanitizeImageList, sanitizeImageUrl } from './images';

export interface FormattedProduct {
  _id: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  mainImage?: string;
  images: string[];
  stock?: number | null;
  brand: string;
  sizes: string;
  gender: string;
  category: string;
  subcategory: string;
  barcode: string;
  description: string;
  isNewArrival: boolean;
  characteristics: { key: string; value: string }[];
  createdAt?: string;
}

function formatCharacteristics(
  characteristics: unknown
): { key: string; value: string }[] {
  if (!Array.isArray(characteristics)) return [];

  return characteristics
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const key = typeof row.key === 'string' ? row.key.trim() : '';
      const value = typeof row.value === 'string' ? row.value.trim() : '';
      if (!key || !value) return null;
      return { key, value };
    })
    .filter((item): item is { key: string; value: string } => item !== null);
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatProduct(product: any): FormattedProduct {
  const images = sanitizeImageList(product.images);
  const mainImage =
    sanitizeImageUrl(product.mainImage) ??
    images[0] ??
    sanitizeImageUrl(product.image);
  const image = mainImage ?? images[0];

  return {
    _id: typeof product._id === 'string' ? product._id : product._id.toString(),
    title: product.title,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercentage: product.discountPercentage,
    image,
    mainImage,
    images,
    stock: product.stock ?? null,
    brand: product.brand || 'No Brand',
    sizes: product.sizes || '',
    gender: product.gender || 'Meshkuj',
    category: product.category || 'Të tjera',
    subcategory: product.subcategory || '',
    barcode: product.barcode || '',
    description: product.description || '',
    isNewArrival: product.isNewArrival || false,
    characteristics: formatCharacteristics(product.characteristics),
    createdAt: toIsoString(product.createdAt),
  };
}
