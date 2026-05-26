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

/** Only Cloudinary URLs and static /images/* assets (placeholder, logos) */
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
