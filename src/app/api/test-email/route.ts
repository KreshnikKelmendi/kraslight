import { NextResponse } from 'next/server';
import { sendOrderConfirmationToCustomer } from '../../lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Sample order with a real image path
    const order = {
      _id: 'testorder12345678',
      email,
      firstName: 'Test',
      lastName: 'User',
      phone: '123456789',
      country: 'Kosovë',
      address: 'Test Address',
      city: 'Prishtina',
      postalCode: '10000',
      notes: 'Test order for email image preview',
      paymentMethod: 'cash',
      items: [
        {
          id: 'product1',
          name: 'Sample Product',
          price: 49.99,
          quantity: 2,
          image: '/uploads/products/9b2e217f-8cbc-48e2-abb5-fd2842d3cc1d-lampada-da-terra-con-base-a-3-piedi-in-legno-e-paralume-in-tela-evette.jpg',
          brand: 'TestBrand',
          size: 'M',
          category: 'Lighting',
        },
      ],
      total: 99.98,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await sendOrderConfirmationToCustomer(order);
    return NextResponse.json({ success: true, message: 'Test email sent!' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 