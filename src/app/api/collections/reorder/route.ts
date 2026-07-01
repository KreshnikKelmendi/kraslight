import { NextResponse } from 'next/server';
import { updateCollectionsOrder } from '@/app/lib/supabase/collections';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderedIds = body.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 });
    }

    await updateCollectionsOrder(orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering collections:', error);
    return NextResponse.json(
      { error: 'Failed to reorder collections', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
