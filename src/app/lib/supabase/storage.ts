import { randomUUID } from 'crypto';
import { compressImageBuffer } from '@/app/lib/images-server';
import {
  compressionStatsFromSizes,
  folderToStoragePath,
  MAX_IMAGE_UPLOAD_BYTES,
  type CompressionStats,
  type ImagePreset,
} from '@/app/lib/images';
import { createSupabaseStorageClient } from './server';

export const STORAGE_BUCKET = 'kraslight';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export interface StorageUploadResult {
  url: string;
  path: string;
  bytes: number;
  fileName: string;
  compression: CompressionStats;
}

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/v1/object/public/');
}

export function storagePathFromUrl(url: string): string | null {
  if (!isSupabaseStorageUrl(url)) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length).split('?')[0] || null;
}

let bucketReady = false;

export async function ensureStorageBucket(): Promise<void> {
  if (bucketReady) return;

  const supabase = createSupabaseStorageClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Cannot access Supabase Storage: ${listError.message}`);
  }

  const exists = buckets?.some((b) => b.id === STORAGE_BUCKET || b.name === STORAGE_BUCKET);
  if (exists) {
    bucketReady = true;
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      bucketReady = true;
      return;
    }
    throw new Error(
      `Supabase bucket "${STORAGE_BUCKET}" not found. Run supabase/storage-and-policies.sql in the Supabase SQL Editor. (${createError.message})`
    );
  }

  bucketReady = true;
}

export async function uploadImageToSupabase(
  file: File,
  folder: string,
  preset: ImagePreset = 'product'
): Promise<StorageUploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `Image is too large (max ${Math.round(MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024)}MB)`
    );
  }

  await ensureStorageBucket();

  const supabase = createSupabaseStorageClient();
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const { buffer, mimeType } = await compressImageBuffer(rawBuffer, preset);
  const ext =
    mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const storagePath = `${folderToStoragePath(folder)}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: false,
    cacheControl: '31536000',
  });

  if (error) {
    throw new Error(
      `Supabase Storage upload failed: ${error.message}. Ensure supabase/storage-and-policies.sql has been run.`
    );
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error('Supabase Storage upload succeeded but public URL is missing.');
  }

  return {
    url: data.publicUrl,
    path: storagePath,
    bytes: buffer.length,
    fileName: file.name,
    compression: compressionStatsFromSizes(file.name, file.size, buffer.length),
  };
}

export async function deleteImageFromSupabase(urlOrPath: string): Promise<boolean> {
  const supabase = createSupabaseStorageClient();
  const path =
    storagePathFromUrl(urlOrPath) ??
    (urlOrPath.startsWith('products/') ||
    urlOrPath.startsWith('slider/') ||
    urlOrPath.startsWith('brands/') ||
    urlOrPath.startsWith('collections/')
      ? urlOrPath
      : null);

  if (!path) return false;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.error('Supabase Storage delete error:', error.message);
    return false;
  }
  return true;
}

export async function deleteProductStorageAssets(product: {
  image?: string | null;
  mainImage?: string | null;
  images?: string[] | null;
}): Promise<{ deleted: number; skipped: number }> {
  const urls = new Set<string>();
  for (const candidate of [product.image, product.mainImage, ...(product.images ?? [])]) {
    if (typeof candidate === 'string' && isSupabaseStorageUrl(candidate)) {
      urls.add(candidate);
    }
  }

  if (!urls.size) return { deleted: 0, skipped: 0 };

  let deleted = 0;
  await Promise.all(
    [...urls].map(async (url) => {
      if (await deleteImageFromSupabase(url)) deleted++;
    })
  );

  return { deleted, skipped: urls.size - deleted };
}
