import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';
import {
  deleteProductCloudinaryAssets,
  uploadImageDetailed,
} from '@/app/lib/cloudinary';
import {
  sanitizeImageList,
  sanitizeImageUrl,
  type CompressionStats,
} from '@/app/lib/images';

// DELETE /api/orders/[id]
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectToDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const cloudinaryCleanup = await deleteProductCloudinaryAssets(product);
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Product deleted successfully',
      cloudinary: cloudinaryCleanup,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await context.params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = sanitizeImageList(product.images);
    const mainImage =
      sanitizeImageUrl(product.mainImage) ?? images[0] ?? sanitizeImageUrl(product.image);
    const image = mainImage ?? images[0];

    return NextResponse.json({
      ...product.toObject(),
      images,
      mainImage,
      image,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/orders/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await context.params;
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const priceStr = formData.get('price') as string;
    const originalPrice = priceStr ? parseFloat(priceStr) : undefined;
    const discountPercentageRaw = formData.get('discountPercentage') as string;
    const discountPercentage =
      discountPercentageRaw?.trim() !== '' ? parseFloat(discountPercentageRaw) : null;
    const stock = parseInt(formData.get('stock') as string);
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

    if (!title || isNaN(stock) || !brand) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const finalPrice = originalPrice !== undefined
      ? (discountPercentage && discountPercentage > 0
          ? originalPrice * (1 - discountPercentage / 100)
          : originalPrice)
      : undefined;

    product.title = title;
    product.price = finalPrice;
    product.originalPrice = (discountPercentage && discountPercentage > 0 && originalPrice !== undefined) ? originalPrice : undefined;
    product.discountPercentage = discountPercentage;
    product.stock = stock;
    product.brand = brand;
    product.sizes = sizes || '';
    product.gender = (gender as 'Meshkuj' | 'Femra' | 'Të Gjitha') || 'Të Gjitha';
    product.category = category || 'Të tjera';
    product.barcode = barcode || '';
    product.description = description || '';
    product.isNewArrival = isNewArrival;

    // Handle characteristics
    if (characteristics) {
      try {
        const characteristicsArray = JSON.parse(characteristics) as { key: string; value: string }[];
        const filtered = characteristicsArray.filter((char) => char.key?.trim() && char.value?.trim());

        product.characteristics.splice(0, product.characteristics.length);
        filtered.forEach((char) => {
          product.characteristics.push({ key: char.key, value: char.value });
        });
        product.markModified('characteristics');
      } catch (error) {
        console.error('Error parsing characteristics:', error);
        product.characteristics.splice(0, product.characteristics.length);
        product.markModified('characteristics');
      }
    } else {
      product.characteristics.splice(0, product.characteristics.length);
      product.markModified('characteristics');
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
      const uploaded = await uploadImageDetailed(
        file,
        'kraslight/products',
        'product'
      );
      imagePaths.push(uploaded.url);
      compression.push(uploaded.compression);
    }

    if (imagePaths.length > 0) {
      product.images = imagePaths;
      product.mainImage = imagePaths[mainImageIndex] || imagePaths[0];
      product.image = imagePaths[0]; // for backward compatibility
    }

    await product.save();

    return NextResponse.json({ product, compression });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
