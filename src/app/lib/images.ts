export function hasDisplayPrice(price?: number | null): boolean {
  return typeof price === 'number' && !Number.isNaN(price) && price > 0;
}

export function formatEuroPrice(price?: number | null): string | null {
  if (!hasDisplayPrice(price)) return null;
  return `€${price!.toFixed(2)}`;
}

/** Stock was explicitly set to a positive amount in admin */
export function hasTrackedStock(stock?: number | null): boolean {
  return typeof stock === 'number' && !Number.isNaN(stock) && stock > 0;
}

export function formatStockBadge(stock?: number | null): { text: string; className: string } {
  if (!hasTrackedStock(stock)) {
    return { text: 'nuk është dhënë', className: 'text-red-600 bg-red-50' };
  }
  if (stock! <= 5) {
    return { text: String(stock), className: 'text-amber-700 bg-amber-50' };
  }
  return { text: String(stock), className: 'text-neutral-700 bg-neutral-100' };
}

export function cartItemLineTotal(item: { price?: number; quantity: number }): number {
  if (!hasDisplayPrice(item.price)) return 0;
  return item.price! * item.quantity;
}

export function sumPricedCartItems(items: { price?: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + cartItemLineTotal(item), 0);
}

export function displayMoney(amount: number): string | null {
  if (!hasDisplayPrice(amount)) return null;
  return `€${amount.toFixed(2)}`;
}

/** Max upload size before compression (10 MB) */
export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Fallback when image is missing or stored on removed local /uploads paths */
export const IMAGE_PLACEHOLDER = '/images/placeholder.svg';

/** Old disk paths — no longer served after Cloudinary migration */
export function isLegacyUploadPath(url: string): boolean {
  const t = url.trim().toLowerCase();
  return t.startsWith('/uploads/');
}

export function isLocalhostImageUrl(url: string): boolean {
  const t = url.trim().toLowerCase();
  return t.includes('localhost') || t.includes('127.0.0.1');
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/v1/object/public/');
}

/** Cloudinary, Supabase Storage, and static /images/* assets */
export function sanitizeImageUrl(
  url: string | undefined | null
): string | undefined {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed || isLegacyUploadPath(trimmed) || isLocalhostImageUrl(trimmed)) {
    return undefined;
  }
  if (trimmed.startsWith('/images/')) return trimmed;
  if (isCloudinaryUrl(trimmed)) return trimmed;
  if (isSupabaseStorageUrl(trimmed)) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return undefined;
  }
  if (trimmed.startsWith('/')) return undefined;
  return undefined;
}

export function sanitizeImageList(
  urls: string[] | undefined | null
): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .map(sanitizeImageUrl)
    .filter((url): url is string => Boolean(url));
}

export type ImagePreset = 'product' | 'slider' | 'brand' | 'collection';

export interface CompressionStats {
  fileName: string;
  originalBytes: number;
  compressedBytes: number;
  savedPercent: number;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function compressionStatsFromSizes(
  fileName: string,
  originalBytes: number,
  compressedBytes: number
): CompressionStats {
  const savedPercent =
    originalBytes > 0
      ? Math.max(0, Math.round((1 - compressedBytes / originalBytes) * 100))
      : 0;
  return { fileName, originalBytes, compressedBytes, savedPercent };
}

export function folderToPreset(folder: string): ImagePreset {
  switch (folder) {
    case 'slider':
      return 'slider';
    case 'brands':
      return 'brand';
    case 'collections':
      return 'collection';
    default:
      return 'product';
  }
}

export function folderToCloudinaryPath(folder: string): string {
  const map: Record<string, string> = {
    products: 'kraslight/products',
    slider: 'kraslight/slider',
    brands: 'kraslight/brands',
    collections: 'kraslight/collections',
  };
  return map[folder] ?? `kraslight/${folder}`;
}

export function folderToStoragePath(folder: string): string {
  const map: Record<string, string> = {
    products: 'products',
    slider: 'slider',
    brands: 'brands',
    collections: 'collections',
  };
  return map[folder] ?? folder;
}

/** Pick first usable image path or URL (skips broken legacy /uploads paths) */
export function getValidImage(...candidates: (string | undefined)[]): string {
  const found = candidates
    .map(sanitizeImageUrl)
    .find(
      (img) =>
        img &&
        (img.startsWith('/') ||
          img.startsWith('http://') ||
          img.startsWith('https://'))
    );
  return found ?? IMAGE_PLACEHOLDER;
}

/**
 * Apply Cloudinary delivery transforms (f_auto, q_auto, optional width).
 * Safe to call on local /uploads paths — returns them unchanged.
 */
export function optimizeImageUrl(
  url: string,
  options: { width?: number; quality?: 'auto' | 'auto:good' | 'auto:eco' } = {}
): string {
  const clean = sanitizeImageUrl(url);
  if (!clean) return IMAGE_PLACEHOLDER;
  if (!clean.includes('res.cloudinary.com')) {
    return clean;
  }

  if (clean.includes('f_auto') || clean.includes('q_auto')) {
    return clean;
  }

  const { width, quality = 'auto' } = options;
  const transforms: string[] = ['f_auto', `q_${quality}`];
  if (width) {
    transforms.push(`w_${width}`, 'c_limit');
  }

  const transformSegment = `${transforms.join(',')}/`;
  const marker = '/upload/';
  const idx = clean.indexOf(marker);
  if (idx === -1) return clean;

  return (
    clean.slice(0, idx + marker.length) +
    transformSegment +
    clean.slice(idx + marker.length)
  );
}
