import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueId = uuidv4();
    const extension = file.name.split('.').pop();
    const filename = `${uniqueId}.${extension}`;

    // Ensure the uploads directory exists - use absolute path
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`Created upload directory: ${uploadDir}`);
    }

    const filepath = join(uploadDir, filename);

    // Write the file
    await writeFile(filepath, buffer);
    console.log(`File saved to: ${filepath}`);

    // Verify file was written
    if (!existsSync(filepath)) {
      throw new Error(`File was not written to ${filepath}`);
    }

    // Return the public URL path
    const publicPath = `/uploads/${folder}/${filename}`;
    console.log(`Returning public path: ${publicPath}`);
    
    return NextResponse.json({
      path: publicPath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 