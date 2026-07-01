import { NextResponse } from 'next/server';
import { findOrders } from '@/app/lib/supabase/orders';
import { isOrderPending } from '@/app/lib/orderStatus';

export async function GET() {
  try {
    const orders = await findOrders();
    const count = orders.filter((order) => isOrderPending(order.status)).length;
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to count pending orders', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
