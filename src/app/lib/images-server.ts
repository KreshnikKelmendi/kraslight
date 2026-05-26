/** Server-only — do not import from client components (uses sharp). */
import type { ImagePreset } from './images';

/** High visual quality; resize only when larger than max dimensions */
const PRESET_CONFIG: Record<
  ImagePreset,
  { maxWidth: number; maxHeight: number; quality: number }
> = {
  product: { maxWidth: 2000, maxHeight: 2000, quality: 92 },
  slider: { maxWidth: 1920, maxHeight: 1080, quality: 90 },
  brand: { maxWidth: 512, maxHeight: 512, quality: 90 },
  collection: { maxWidth: 1600, maxHeight: 1600, quality: 91 },
};

/**
 * Resize and compress before Cloudinary upload (server-only).
 */
export async function compressImageBuffer(
  buffer: Buffer,
  preset: ImagePreset
): Promise<{ buffer: Buffer; mimeType: string }> {
  const sharp = (await import('sharp')).default;
  const { maxWidth, maxHeight, quality } = PRESET_CONFIG[preset];

  const pipeline = sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

  const meta = await sharp(buffer).metadata();
  const hasAlpha = meta.hasAlpha === true;

  if (hasAlpha) {
    const out = await pipeline
      .png({ compressionLevel: 6, quality: 95, effort: 7 })
      .toBuffer();
    return { buffer: out, mimeType: 'image/png' };
  }

  const out = await pipeline
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer();
  return { buffer: out, mimeType: 'image/jpeg' };
}
