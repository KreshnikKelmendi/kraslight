import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

export async function GET() {
  try {
    await connectToDB();

    // Get all products with brand and brandLogo
    const products = await Product.find({ 
      brand: { $exists: true, $ne: '' },
      brandLogo: { $exists: true, $ne: '' }
    }, 'brand brandLogo').lean();

    // Map: brand name -> logo (first found)
    const brandMap = new Map();
    for (const p of products) {
      if (!brandMap.has(p.brand) && p.brandLogo) {
        brandMap.set(p.brand, p.brandLogo);
      }
    }

    // Build result array
    const brands = Array.from(brandMap.entries()).map(([name, logo]) => ({ name, logo }));

    // Sort alphabetically
    brands.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands with logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands with logos' },
      { status: 500 }
    );
  }
} 