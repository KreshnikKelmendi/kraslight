import { NextResponse } from 'next/server';
import { connectToDB } from '../../lib/mongodb';
import { Order } from '../../models/Order';
import { Product } from '../../models/Product';
import { sendOrderNotification, sendOrderConfirmationToCustomer } from '../../lib/email';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'country', 'address', 'postalCode', 'items'];
    for (const field of requiredFields) {
      if (!body[field] || (field === 'items' && (!Array.isArray(body.items) || body.items.length === 0))) {
        return NextResponse.json({ error: `Fusha '${field}' është e detyrueshme.` }, { status: 400 });
      }
    }

    // Validate stock availability before creating order
    for (const item of body.items) {
      const product = await Product.findById(item.id);
      if (!product) {
        return NextResponse.json({ error: `Produkti me ID '${item.id}' nuk u gjet.` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Stoku i pamjaftueshëm për produktin '${product.title}'. Në stok: ${product.stock}, Kërkuar: ${item.quantity}` 
        }, { status: 400 });
      }
    }

    // Calculate shipping
    let shipping = 0;
    if (['Shqipëri', 'Maqedoni e Veriut', 'Mali i Zi'].includes(body.country)) {
      shipping = 10;
    }
    // Calculate total with shipping
    const itemsTotal = body.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const total = itemsTotal + shipping;
    
    const order = await Order.create({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      country: body.country,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      notes: body.notes,
      paymentMethod: body.paymentMethod || 'cash',
      items: body.items,
      total,
      status: 'pending',
    });
    
    // Decrement stock for each ordered product
    for (const item of body.items) {
      await Product.findByIdAndUpdate(
        item.id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }
    
    console.log('Order created successfully:', order._id);
    
    // Send admin notification email (do not block order creation if email fails)
    try {
      console.log('=== SENDING ADMIN NOTIFICATION EMAIL ===');
      console.log('Attempting to send admin notification email...');
      await sendOrderNotification(order);
      console.log('✅ Admin notification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send admin notification email:', emailError);
      console.error('Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
    }

    // Small delay to separate the emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send customer confirmation email (do not block order creation if email fails)
    try {
      console.log('=== SENDING CUSTOMER CONFIRMATION EMAIL ===');
      console.log('Attempting to send customer confirmation email to:', order.email);
      await sendOrderConfirmationToCustomer(order);
      console.log('✅ Customer confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send customer confirmation email:', emailError);
      console.error('Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order', details: (error as Error)?.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders', details: (error as Error)?.message }, { status: 500 });
  }
} 