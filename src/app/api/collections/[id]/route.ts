import { NextResponse } from 'next/server';
import { Collection } from '../../../models/Collection';
import { Product } from '../../../models/Product';
import { connectToDB } from '../../../lib/mongodb';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectToDB();
  const collection = await Collection.findById(id).populate('products');
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  // If collection has categories, fetch products from those categories
  if (collection.categories && collection.categories.length > 0) {
    let categoryProducts: unknown[] = [];
    // Handle virtual 'On Sale' category
    if (collection.categories.includes('Produktet ne Zbritje')) {
      const onSaleProducts = await Product.find({
        $or: [
          { discountPercentage: { $gt: 0 } },
          { $expr: { $lt: ["$price", "$originalPrice"] } }
        ]
      });
      categoryProducts = categoryProducts.concat(onSaleProducts);
    }
    // Handle real categories (excluding the virtual one)
    const realCategories = collection.categories.filter((cat: unknown) => cat !== 'Produktet ne Zbritje');
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
    collection.products = uniqueProducts;
  }
  
  return NextResponse.json(collection);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  await connectToDB();
  const data = await req.json();
  const { id } = await context.params;

  // If categories are provided, fetch products from those categories
  if (data.categories && data.categories.length > 0) {
    const categoryProducts = await Product.find({
      category: { $in: data.categories }
    });
    data.products = categoryProducts.map(p => p._id);
  }

  const collection = await Collection.findByIdAndUpdate(id, data, { new: true });
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(collection);
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  await connectToDB();
  const { id } = await context.params;
  await Collection.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Collection deleted' });
} 