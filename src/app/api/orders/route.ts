import { NextResponse } from 'next/server';
import { sendOrderConfirmationToCustomer, sendOrderNotification } from '../../lib/email';
import { hasDisplayPrice, hasTrackedStock, sumPricedCartItems } from '@/app/lib/images';
import { createOrder, findOrders } from '@/app/lib/supabase/orders';
import { findProductById, incrementProductStock } from '@/app/lib/supabase/products';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requiredFields = [
      'email',
      'firstName',
      'lastName',
      'phone',
      'country',
      'address',
      'postalCode',
      'items',
    ];
    for (const field of requiredFields) {
      if (
        !body[field] ||
        (field === 'items' && (!Array.isArray(body.items) || body.items.length === 0))
      ) {
        return NextResponse.json(
          { error: `Fusha '${field}' është e detyrueshme.` },
          { status: 400 }
        );
      }
    }

    const itemsWithBarcodes = [];
    for (const item of body.items) {
      const product = await findProductById(item.id);
      if (!product) {
        return NextResponse.json(
          { error: `Produkti me ID '${item.id}' nuk u gjet.` },
          { status: 400 }
        );
      }
      if (hasTrackedStock(product.stock) && product.stock! < item.quantity) {
        return NextResponse.json(
          {
            error: `Stoku i pamjaftueshëm për produktin '${product.title}'. Në stok: ${product.stock}, Kërkuar: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      itemsWithBarcodes.push({
        ...item,
        barcode: product.barcode || '',
        price: hasDisplayPrice(item.price)
          ? item.price
          : hasDisplayPrice(product.price)
            ? product.price
            : undefined,
      });
    }

    let shipping = 0;
    if (['Shqipëri', 'Maqedoni e Veriut', 'Mali i Zi'].includes(body.country)) {
      shipping = 10;
    }

    const itemsTotal = sumPricedCartItems(itemsWithBarcodes);
    const total = Number((itemsTotal + shipping).toFixed(2));

    const order = await createOrder({
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
      items: itemsWithBarcodes,
      total,
      status: 'pending',
    });

    for (const item of body.items) {
      try {
        await incrementProductStock(item.id, -item.quantity);
      } catch (stockError) {
        console.error('Failed to update stock for item:', item.id, stockError);
      }
    }

    try {
      await sendOrderNotification(order);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await sendOrderConfirmationToCustomer(order);
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Porosia dështoi';
    return NextResponse.json(
      { error: 'Porosia dështoi', details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await findOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
