import { v2 as cloudinary } from 'cloudinary';
import type { CompressionStats, ImagePreset } from './images';
import { compressionStatsFromSizes, MAX_IMAGE_UPLOAD_BYTES } from './images';
import { compressImageBuffer } from './images-server';

import { deleteImageFromSupabase, deleteProductStorageAssets } from '@/app/lib/supabase/storage';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  fileName: string;
  compression: CompressionStats;
}

function assertCloudinaryConfigured() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary is not configured. Check .env.local.');
  }
}

/**
 * Compress locally, then upload to Cloudinary with auto format/quality on delivery.
 */
export async function uploadImage(
  file: File,
  folder: string = 'kraslight',
  preset: ImagePreset = 'product'
): Promise<string> {
  const result = await uploadImageDetailed(file, folder, preset);
  return result.url;
}

export async function uploadImageDetailed(
  file: File,
  folder: string = 'kraslight',
  preset: ImagePreset = 'product'
): Promise<UploadResult> {
  assertCloudinaryConfigured();

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `Image is too large (max ${Math.round(MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024)}MB)`
    );
  }

  const originalBytes = file.size;
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const { buffer, mimeType } = await compressImageBuffer(rawBuffer, preset);
  const compressedBytes = buffer.length;
  const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: 'image',
    quality: 85,
    fetch_format: 'auto',
    flags: 'progressive',
  });

  const storedBytes = result.bytes ?? compressedBytes;

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: storedBytes,
    fileName: file.name,
    compression: compressionStatsFromSizes(
      file.name,
      originalBytes,
      compressedBytes
    ),
  };
}

/** Extract Cloudinary public_id from a secure_url */
export function publicIdFromUrl(url: string): string | null {
  if (!url?.includes('res.cloudinary.com')) return null;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  const parts = url
    .slice(idx + marker.length)
    .split('?')[0]
    .split('/')
    .filter(Boolean);

  const isMetaSegment = (seg: string) =>
    /^v\d+$/.test(seg) ||
    seg.includes(',') ||
    /^[a-z]{1,3}_.+$/i.test(seg);

  while (parts.length && isMetaSegment(parts[0])) {
    parts.shift();
  }

  if (!parts.length) return null;

  parts[parts.length - 1] = parts[parts.length - 1].replace(/\.[a-z0-9]+$/i, '');
  return parts.join('/') || null;
}

export async function deleteImage(publicIdOrUrl: string): Promise<void> {
  try {
    const publicId = publicIdOrUrl.includes('res.cloudinary.com')
      ? publicIdFromUrl(publicIdOrUrl)
      : publicIdOrUrl;
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
}

function collectCloudinaryPublicIds(
  ...candidates: (string | null | undefined)[]
): string[] {
  const ids = new Set<string>();

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.includes('res.cloudinary.com')) {
      continue;
    }
    const publicId = publicIdFromUrl(candidate);
    if (publicId) ids.add(publicId);
  }

  return [...ids];
}

/** Remove product image assets from Cloudinary (not brandLogo — may be shared) */
export async function deleteProductCloudinaryAssets(product: {
  image?: string | null;
  mainImage?: string | null;
  images?: string[] | null;
}): Promise<{ deleted: number; skipped: number }> {
  const publicIds = collectCloudinaryPublicIds(
    product.image,
    product.mainImage,
    ...(product.images ?? [])
  );

  if (!publicIds.length) {
    return { deleted: 0, skipped: 0 };
  }

  let deleted = 0;
  await Promise.all(
    publicIds.map(async (publicId) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
        });
        if (result.result === 'ok' || result.result === 'not found') {
          deleted += 1;
        }
      } catch (error) {
        console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
      }
    })
  );

  return { deleted, skipped: publicIds.length - deleted };
}

/** Remove product images from Supabase Storage and/or Cloudinary */
export async function deleteProductImageAssets(product: {
  image?: string | null;
  mainImage?: string | null;
  images?: string[] | null;
}): Promise<{ deleted: number; skipped: number }> {
  const [supabaseResult, cloudinaryResult] = await Promise.all([
    deleteProductStorageAssets(product),
    deleteProductCloudinaryAssets(product),
  ]);

  return {
    deleted: supabaseResult.deleted + cloudinaryResult.deleted,
    skipped: supabaseResult.skipped + cloudinaryResult.skipped,
  };
}

/** Delete a single uploaded image from Supabase Storage and/or Cloudinary. */
export async function deleteImageAsset(url?: string | null): Promise<void> {
  if (!url?.trim()) return;
  await deleteImageFromSupabase(url);
  await deleteImage(url);
}
