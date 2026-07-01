import { NextResponse } from 'next/server';
import { getDistinctBrands } from '@/app/lib/supabase/products';

export async function GET() {
  try {
    const brands = (await getDistinctBrands(false))
      .map(({ brand, brandLogo }) => ({ name: brand, logo: brandLogo ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
