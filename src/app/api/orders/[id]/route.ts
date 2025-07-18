import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongodb';
import { Order } from '../../../models/Order';
import { sendOrderStatusUpdateEmail } from '../../../lib/email';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const body = await request.json();
    const { status } = body;
    const { id } = await context.params;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Find the order first to get the old status
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = existingOrder.status;

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Send status update email to customer if status changed
    if (oldStatus !== status) {
      try {
        console.log(`Order status changed from ${oldStatus} to ${status}`);
        console.log('Sending status update email to customer:', updatedOrder.email);
        console.log('Email configuration check:', {
          EMAIL_USER: process.env.EMAIL_USER,
          customerEmail: updatedOrder.email,
          orderId: updatedOrder._id
        });
        console.log('Full order details for status update:', {
          _id: updatedOrder._id,
          email: updatedOrder.email,
          firstName: updatedOrder.firstName,
          lastName: updatedOrder.lastName,
          oldStatus,
          newStatus: status
        });
        
        await sendOrderStatusUpdateEmail(updatedOrder, oldStatus, status);
        console.log('Status update email sent successfully');
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the request if email fails
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
    await connectToDB();
    const { id } = await context.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
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