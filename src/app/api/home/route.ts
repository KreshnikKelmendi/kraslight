import { NextResponse } from 'next/server';
import { getHomePageData } from '@/app/lib/home-data';

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getHomePageData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/home:', error);
    return NextResponse.json(
      { error: 'Failed to load homepage data' },
      { status: 500 }
    );
  }
}
