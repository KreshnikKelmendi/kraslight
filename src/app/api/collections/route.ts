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
    let categoryProducts: unknown[] = [];
    // Handle virtual 'On Sale' category
    if (data.categories.includes('Produktet ne Zbritje')) {
      const onSaleProducts = await Product.find({
        $or: [
          { discountPercentage: { $gt: 0 } },
          { $expr: { $lt: ["$price", "$originalPrice"] } }
        ]
      });
      categoryProducts = categoryProducts.concat(onSaleProducts);
    }
    // Handle real categories (excluding the virtual one)
    const realCategories = data.categories.filter((cat: unknown) => cat !== 'Produktet ne Zbritje');
    if (realCategories.length > 0) {
      const realCategoryProducts = await Product.find({
        category: { $in: realCategories }
      });
      categoryProducts = categoryProducts.concat(realCategoryProducts);
    }
    // Remove duplicates by _id
    const uniqueProducts = Array.from(
      new Map(
        (categoryProducts as unknown[])
          .filter((p): p is { _id: { toString: () => string } } => typeof p === 'object' && p !== null && '_id' in p && typeof (p as any)._id?.toString === 'function')
          .map(p => [(p as { _id: { toString: () => string } })._id.toString(), p])
      ).values()
    );
    data.products = uniqueProducts.map((p) => (p as { _id: string })._id);
  }
  
  const collection = await Collection.create(data);
  return NextResponse.json(collection);
}

export async function DELETE() {
  await connectToDB();
  await Collection.deleteMany({});
  return NextResponse.json({ message: 'All collections deleted' });
} 