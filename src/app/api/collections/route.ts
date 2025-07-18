import { NextResponse } from 'next/server';
import { Collection } from '../../models/Collection';
import { Product } from '../../models/Product';
import { connectToDB } from '../../lib/mongodb';

export async function GET() {
  try {
    await connectToDB();
    const collections = await Collection.find({}).populate('products');
    
    // For each collection, if it has categories, fetch products from those categories
    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        if (collection.categories && collection.categories.length > 0) {
          // Fetch products from the selected categories
          const categoryProducts = await Product.find({
            category: { $in: collection.categories }
          });
          // Update the collection with the fetched products
          collection.products = categoryProducts;
        }
        return collection;
      })
    );
    
    return NextResponse.json(collectionsWithProducts);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectToDB();
  const data = await req.json();
  
  // If categories are provided, fetch products from those categories
  if (data.categories && data.categories.length > 0) {
    const categoryProducts = await Product.find({
      category: { $in: data.categories }
    });
    data.products = categoryProducts.map(p => p._id);
  }
  
  const collection = await Collection.create(data);
  return NextResponse.json(collection);
}

export async function DELETE() {
  await connectToDB();
  await Collection.deleteMany({});
  return NextResponse.json({ message: 'All collections deleted' });
} 