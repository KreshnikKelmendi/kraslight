import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusUpdateEmail } from '../../../lib/email';
import {
  deleteOrderById,
  findOrderById,
  updateOrderStatus,
} from '@/app/lib/supabase/orders';
import { incrementProductStock } from '@/app/lib/supabase/products';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const { id } = await context.params;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!['pending', 'delivered'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be pending or delivered' },
        { status: 400 }
      );
    }

    const existingOrder = await findOrderById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = existingOrder.status;
    const updatedOrder = await updateOrderStatus(id, status);
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    if (oldStatus !== status) {
      try {
        await sendOrderStatusUpdateEmail(updatedOrder, oldStatus, status);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await findOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await deleteOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    for (const item of order.items as { id: string; quantity: number }[]) {
      await incrementProductStock(item.id, item.quantity);
    }

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
