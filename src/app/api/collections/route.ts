import { NextResponse } from 'next/server';
import { sanitizeImageUrl } from '@/app/lib/images';
import { deleteImageAsset } from '@/app/lib/cloudinary';
import {
  createCollection,
  deleteAllCollections,
  findCollectionsWithProducts,
} from '@/app/lib/supabase/collections';

export async function GET() {
  try {
    const collectionsWithProducts = await findCollectionsWithProducts();
    const collections = collectionsWithProducts.map((collection) => ({
      ...collection,
      image: sanitizeImageUrl(collection.image as string) ?? '',
    }));

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collections',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const collection = await createCollection(data);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const deletedCollections = await deleteAllCollections();

    await Promise.all(
      deletedCollections.map(async (collection) => {
        try {
          await deleteImageAsset(collection.image);
        } catch (cleanupError) {
          console.error('Failed to delete collection image:', collection._id, cleanupError);
        }
      })
    );

    return NextResponse.json({
      message: 'All collections deleted',
      count: deletedCollections.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete collections', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
