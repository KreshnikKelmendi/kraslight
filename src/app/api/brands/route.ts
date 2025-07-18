import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

export async function GET() {
  try {
    await connectToDB();

    // Get all products with brand and brandLogo
    const products = await Product.find({ brand: { $exists: true, $ne: '' } }, 'brand brandLogo').lean();

    // Map: brand name -> logo (first found)
    const brandMap = new Map();
    for (const p of products) {
      if (!brandMap.has(p.brand)) {
        brandMap.set(p.brand, p.brandLogo || null);
      }
    }

    // Build result array
    const brands = Array.from(brandMap.entries()).map(([name, logo]) => ({ name, logo }));

    // Optionally, sort alphabetically
    brands.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
} 