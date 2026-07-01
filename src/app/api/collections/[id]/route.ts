import { NextResponse } from 'next/server';
import {
  deleteCollectionById,
  findCollectionById,
  updateCollection,
} from '@/app/lib/supabase/collections';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const collection = await findCollectionById(id);
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(collection);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const data = await req.json();
  const { id } = await context.params;
  const collection = await updateCollection(id, data);
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(collection);
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await deleteCollectionById(id);
  return NextResponse.json({ message: 'Collection deleted' });
}
