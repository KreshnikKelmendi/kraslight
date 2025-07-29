import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongodb';
import { Order } from '../../../models/Order';
import { Product } from '../../../models/Product';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs array is required' },
        { status: 400 }
      );
    }

    // Find all orders to get their items for stock restoration
    const orders = await Order.find({ _id: { $in: orderIds } });
    
    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found' },
        { status: 404 }
      );
    }

    // Restore stock for all ordered products
    for (const order of orders) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.id,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }

    // Delete all orders
    const deleteResult = await Order.deleteMany({ _id: { $in: orderIds } });

    return NextResponse.json(
      { 
        message: `${deleteResult.deletedCount} orders deleted successfully`,
        deletedCount: deleteResult.deletedCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error bulk deleting orders:', error);
    return NextResponse.json(
      { error: 'Failed to delete orders', details: (error as Error)?.message },
      { status: 500 }
    );
  }
} 