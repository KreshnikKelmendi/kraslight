import { NextResponse, NextRequest } from 'next/server';
import { TotalLook } from '../../../models/TotalLook';
import { connectToDB } from '../../../lib/mongodb';

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDB();
    const body = await req.json();
    
    const updatedLook = await TotalLook.findByIdAndUpdate(
      context.params.id,
      body,
      { new: true, runValidators: true }
    ).populate('products');

    if (!updatedLook) {
      return NextResponse.json(
        { error: 'ShopLook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLook);
  } catch (error) {
    console.error('Error updating TotalLook:', error);
    return NextResponse.json(
      { error: 'Failed to update ShopLook' },
      { status: 500 }
    );
  }
} 