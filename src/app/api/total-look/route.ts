import { NextResponse, NextRequest } from 'next/server';
import { TotalLook } from '../../models/TotalLook';
import { Product } from '../../models/Product';
import { connectToDB } from '../../lib/mongodb';

export async function GET() {
  await connectToDB();
  const looks = await TotalLook.find({}).populate('products');
  return NextResponse.json(looks);
}

export async function POST(req: NextRequest) {
  await connectToDB();
  const body = await req.json();
  const look = await TotalLook.create(body);
  return NextResponse.json(look, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await connectToDB();
  const { id } = await req.json();
  await TotalLook.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
} 