import { NextRequest, NextResponse } from 'next/server';
import { deleteOrdersByIds } from '@/app/lib/supabase/orders';
import { incrementProductStock } from '@/app/lib/supabase/products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Order IDs array is required' }, { status: 400 });
    }

    const orders = await deleteOrdersByIds(orderIds);
    if (orders.length === 0) {
      return NextResponse.json({ error: 'No orders found' }, { status: 404 });
    }

    for (const order of orders) {
      for (const item of order.items as { id: string; quantity: number }[]) {
        await incrementProductStock(item.id, item.quantity);
      }
    }

    return NextResponse.json(
      {
        message: `${orders.length} orders deleted successfully`,
        deletedCount: orders.length,
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
