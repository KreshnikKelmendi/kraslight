import type { UploadResult } from '@/app/lib/cloudinary';
import { uploadImageDetailed as uploadToCloudinary } from '@/app/lib/cloudinary';
import {
  folderToCloudinaryPath,
  folderToPreset,
  isSupabaseStorageUrl,
  type ImagePreset,
} from '@/app/lib/images';
import { uploadImageToSupabase } from '@/app/lib/supabase/storage';

export type ImageStorageProvider = 'supabase' | 'cloudinary';

export interface DetailedUploadResult extends UploadResult {
  provider: ImageStorageProvider;
}

function hasCloudinaryFallback(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/** Primary: Supabase Storage bucket. Fallback: Cloudinary only if Supabase fails. */
export async function uploadImageDetailed(
  file: File,
  folder: string,
  preset: ImagePreset = 'product'
): Promise<DetailedUploadResult> {
  try {
    const result = await uploadImageToSupabase(file, folder, preset);

    if (!isSupabaseStorageUrl(result.url)) {
      throw new Error('Upload did not return a Supabase Storage URL.');
    }

    console.info(`[upload] Saved to Supabase Storage: ${result.path}`);

    return {
      url: result.url,
      publicId: result.path,
      bytes: result.bytes,
      fileName: result.fileName,
      compression: result.compression,
      provider: 'supabase',
    };
  } catch (supabaseError) {
    if (!hasCloudinaryFallback()) {
      const message =
        supabaseError instanceof Error ? supabaseError.message : 'Supabase Storage upload failed';
      throw new Error(message);
    }

    console.warn(
      '[upload] Supabase Storage failed, using Cloudinary fallback:',
      supabaseError instanceof Error ? supabaseError.message : supabaseError
    );

    const cloudinaryFolder = folderToCloudinaryPath(folder);
    const cloudinaryResult = await uploadToCloudinary(file, cloudinaryFolder, preset);

    return {
      ...cloudinaryResult,
      provider: 'cloudinary',
    };
  }
}

export async function uploadImage(
  file: File,
  folder: string,
  preset?: ImagePreset
): Promise<string> {
  const result = await uploadImageDetailed(file, folder, preset ?? folderToPreset(folder));
  return result.url;
}
