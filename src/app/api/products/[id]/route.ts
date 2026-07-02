import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProductById,
  findProductById,
  updateProduct,
} from '@/app/lib/supabase/products';
import { deleteProductImageAssets } from '@/app/lib/cloudinary';
import { uploadImageDetailed } from '@/app/lib/upload-image';
import {
  sanitizeImageList,
  sanitizeImageUrl,
  type CompressionStats,
} from '@/app/lib/images';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await findProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const cloudinaryCleanup = await deleteProductImageAssets(product);
    const deleted = await deleteProductById(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
      cloudinary: cloudinaryCleanup,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await findProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = sanitizeImageList(product.images);
    const mainImage =
      sanitizeImageUrl(product.mainImage) ?? images[0] ?? sanitizeImageUrl(product.image);
    const image = mainImage ?? images[0];

    return NextResponse.json({
      ...product,
      images,
      mainImage,
      image,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const priceStr = formData.get('price') as string;
    const originalPrice = priceStr ? parseFloat(priceStr) : undefined;
    const discountPercentageRaw = formData.get('discountPercentage') as string;
    const discountPercentage =
      discountPercentageRaw?.trim() !== '' ? parseFloat(discountPercentageRaw) : null;
    const stockStr = (formData.get('stock') as string)?.trim();
    const stock = stockStr !== '' ? parseInt(stockStr, 10) : null;
    const brand = formData.get('brand') as string;
    const sizes = formData.get('sizes') as string;
    const gender = formData.get('gender') as string;
    const category = formData.get('category') as string;
    const barcode = formData.get('barcode') as string;
    const description = formData.get('description') as string;
    const isNewArrival = formData.get('isNewArrival') === 'true';
    const characteristics = formData.get('characteristics') as string;
    const mainImageIndex = parseInt(formData.get('mainImageIndex') as string) || 0;
    const existingImages = formData.getAll('existingImages') as string[];
    const newImageFiles = formData.getAll('images') as File[];

    if (!title || !brand) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const existing = await findProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const finalPrice =
      originalPrice !== undefined
        ? discountPercentage && discountPercentage > 0
          ? originalPrice * (1 - discountPercentage / 100)
          : originalPrice
        : undefined;

    let characteristicsArray: { key: string; value: string }[] = [];
    if (characteristics) {
      try {
        characteristicsArray = (JSON.parse(characteristics) as { key: string; value: string }[])
          .filter((char) => char.key?.trim() && char.value?.trim());
      } catch {
        characteristicsArray = [];
      }
    }

    const imagePaths = [...existingImages];
    const compression: CompressionStats[] = [];

    for (const file of newImageFiles) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image.` },
          { status: 400 }
        );
      }
      const uploaded = await uploadImageDetailed(file, 'products', 'product');
      imagePaths.push(uploaded.url);
      compression.push(uploaded.compression);
    }

    const updatePayload: Record<string, unknown> = {
      title,
      price: finalPrice,
      originalPrice:
        discountPercentage && discountPercentage > 0 && originalPrice !== undefined
          ? originalPrice
          : undefined,
      discountPercentage,
      stock: stock != null && !Number.isNaN(stock) ? stock : undefined,
      brand,
      sizes: sizes || '',
      gender: gender || 'Të Gjitha',
      category: category || 'Të tjera',
      barcode: barcode || '',
      description: description || '',
      isNewArrival,
      characteristics: characteristicsArray,
    };

    if (imagePaths.length > 0) {
      updatePayload.images = imagePaths;
      updatePayload.mainImage = imagePaths[mainImageIndex] || imagePaths[0];
      updatePayload.image = imagePaths[0];
    } else {
      updatePayload.images = existing.images;
      updatePayload.mainImage = existing.mainImage;
      updatePayload.image = existing.image;
    }

    const product = await updateProduct(id, updatePayload);
    return NextResponse.json({ product, compression });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
