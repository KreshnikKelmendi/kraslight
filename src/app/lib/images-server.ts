/** Server-only — do not import from client components (uses sharp). */
import type { ImagePreset } from './images';

/** Balanced: smaller files, still sharp on screen (WebP + sensible max dimensions) */
const PRESET_CONFIG: Record<
  ImagePreset,
  { maxWidth: number; maxHeight: number; quality: number }
> = {
  product: { maxWidth: 1600, maxHeight: 1600, quality: 84 },
  slider: { maxWidth: 1600, maxHeight: 900, quality: 82 },
  brand: { maxWidth: 400, maxHeight: 400, quality: 85 },
  collection: { maxWidth: 1400, maxHeight: 1400, quality: 84 },
};

/**
 * Resize and compress before upload (server-only).
 * Uses WebP for photos; PNG only when alpha is required.
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
      .png({ compressionLevel: 9, quality: 90, effort: 8 })
      .toBuffer();
    return { buffer: out, mimeType: 'image/png' };
  }

  const out = await pipeline
    .webp({ quality, effort: 5, smartSubsample: true })
    .toBuffer();
  return { buffer: out, mimeType: 'image/webp' };
}
