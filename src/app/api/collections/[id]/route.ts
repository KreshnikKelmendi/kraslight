import { NextResponse } from 'next/server';
import { Collection } from '../../../models/Collection';
import { Product } from '../../../models/Product';
import { connectToDB } from '../../../lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDB();
  const collection = await Collection.findById(params.id).populate('products');
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDB();
  const data = await req.json();
  
  // If categories are provided, fetch products from those categories
  if (data.categories && data.categories.length > 0) {
    const categoryProducts = await Product.find({
      category: { $in: data.categories }
    });
    data.products = categoryProducts.map(p => p._id);
  }
  
  const collection = await Collection.findByIdAndUpdate(params.id, data, { new: true });
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(collection);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDB();
  await Collection.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Collection deleted' });
} 