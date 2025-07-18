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
    const categoryProducts = await Product.find({
      category: { $in: collection.categories }
    });
    collection.products = categoryProducts;
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