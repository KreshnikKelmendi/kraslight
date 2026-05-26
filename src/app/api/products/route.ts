import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';
import { formatProduct } from '@/app/lib/format-product';
import { deleteProductCloudinaryAssets } from '@/app/lib/cloudinary';

export async function GET(request: Request) {
  try {
    await connectToDB();
    
    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const brand = searchParams.get('brand');
    const adminView = searchParams.get('admin') === 'true';
    
    // Build query object
    const query: Record<string, unknown> = {};
    if (gender && ['Meshkuj', 'Femra'].includes(gender)) {
      query.gender = gender;
    }
    if (brand) {
      // Case-insensitive brand search
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }
    
    // For frontend, only show products with stock > 0
    // For admin view, show all products
    if (!adminView) {
      query.stock = { $gt: 0 };
    }
    
    // Get products with optional filters and sort by newest first
    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // -1 for descending order (newest first)
      .lean();
    
    // Format products
    const formattedProducts = products.map((product) => formatProduct(product));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error },
      { status: 500 }
    );
  }
} 

export async function DELETE(request: Request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      );
    }
    const products = await Product.find({ _id: { $in: ids } });
    let cloudinaryDeleted = 0;

    await Promise.all(
      products.map(async (product) => {
        const cleanup = await deleteProductCloudinaryAssets(product);
        cloudinaryDeleted += cleanup.deleted;
      })
    );

    const result = await Product.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: 'Products deleted successfully',
      deletedCount: result.deletedCount,
      cloudinaryImagesDeleted: cloudinaryDeleted,
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete products', details: error },
      { status: 500 }
    );
  }
} 