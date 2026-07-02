import { NextRequest, NextResponse } from 'next/server';
import { deleteSubscriberById } from '@/app/lib/supabase/subscribers';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'ID e abonuesit mungon' }, { status: 400 });
    }

    const deleted = await deleteSubscriberById(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Abonuesi nuk u gjet' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Abonuesi u fshi me sukses',
      email: deleted.email,
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Gabim gjatë fshirjes së abonuesit', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
