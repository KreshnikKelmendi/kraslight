import { NextResponse } from 'next/server';
import { formatProduct } from '@/app/lib/format-product';
import { deleteProductImageAssets } from '@/app/lib/cloudinary';
import { deleteProductsByIds, findProducts } from '@/app/lib/supabase/products';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const categoryMatch = searchParams.get('categoryMatch');
    const matchTerms = searchParams.get('matchTerms');
    const isNewArrival = searchParams.get('isNewArrival') === 'true';
    const onSale = searchParams.get('onSale') === 'true';
    const adminView = searchParams.get('admin') === 'true';

    const products = await findProducts({
      gender: gender ?? undefined,
      brand: brand ?? undefined,
      category: category ?? undefined,
      subcategory: subcategory ?? undefined,
      categoryMatch: categoryMatch ?? undefined,
      matchTerms: matchTerms
        ? matchTerms.split(',').map((term) => term.trim()).filter(Boolean)
        : undefined,
      isNewArrival: isNewArrival || undefined,
      onSale: onSale || undefined,
      adminView,
    });

    return NextResponse.json(products.map(formatProduct));
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
    const body = await request.json();
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      );
    }

    const products = await deleteProductsByIds(ids);
    let cloudinaryDeleted = 0;

    await Promise.all(
      products.map(async (product) => {
        const cleanup = await deleteProductImageAssets(product);
        cloudinaryDeleted += cleanup.deleted;
      })
    );

    return NextResponse.json({
      message: 'Products deleted successfully',
      deletedCount: products.length,
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
