import { NextResponse } from 'next/server';
import { formatProduct } from '@/app/lib/format-product';
import { findProducts } from '@/app/lib/supabase/products';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const products = (await findProducts({ search: query.trim() }))
      .slice(0, limit)
      .map(formatProduct)
      .filter(
        (product) =>
          product.title &&
          product.brand &&
          (product.price === undefined ||
            (typeof product.price === 'number' && !isNaN(product.price)))
      );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to search products', details: error },
      { status: 500 }
    );
  }
}
