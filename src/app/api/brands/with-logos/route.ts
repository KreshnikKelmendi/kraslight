import { NextResponse } from 'next/server';
import { getDistinctBrands } from '@/app/lib/supabase/products';

export async function GET() {
  try {
    const brands = (await getDistinctBrands(true))
      .map(({ brand, brandLogo }) => ({ name: brand, logo: brandLogo }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands with logos:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
