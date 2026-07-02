import { NextResponse } from 'next/server';
import {
  deleteCollectionById,
  findCollectionById,
  updateCollection,
} from '@/app/lib/supabase/collections';
import { deleteImageAsset } from '@/app/lib/cloudinary';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const collection = await findCollectionById(id);
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json();
    const { id } = await context.params;

    const existing = await findCollectionById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const collection = await updateCollection(id, data);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (data.image && existing.image && data.image !== existing.image) {
      try {
        await deleteImageAsset(existing.image);
      } catch (cleanupError) {
        console.error('Failed to delete old collection image:', cleanupError);
      }
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const collection = await findCollectionById(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    try {
      await deleteImageAsset(collection.image);
    } catch (cleanupError) {
      console.error('Failed to delete collection image:', cleanupError);
    }

    const deleted = await deleteCollectionById(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
