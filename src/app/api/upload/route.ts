import { NextResponse } from 'next/server';
import { uploadImageDetailed } from '@/app/lib/cloudinary';
import {
  folderToCloudinaryPath,
  folderToPreset,
  MAX_IMAGE_UPLOAD_BYTES,
} from '@/app/lib/images';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `Image too large. Maximum size is ${Math.round(MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    const preset = folderToPreset(folder);
    const cloudinaryFolder = folderToCloudinaryPath(folder);
    const upload = await uploadImageDetailed(
      file,
      cloudinaryFolder,
      preset
    );

    return NextResponse.json({
      path: upload.url,
      url: upload.url,
      publicId: upload.publicId,
      bytes: upload.bytes,
      compression: upload.compression,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
