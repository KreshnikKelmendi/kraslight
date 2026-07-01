import { NextRequest, NextResponse } from 'next/server';
import { applyProductDiscountFields } from '@/app/lib/supabase/row-map';
import { findProductById, findProducts, updateProduct } from '@/app/lib/supabase/products';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { productIds, discountPercentage, bulkDiscountType, bulkDiscountTarget } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    if (discountPercentage === undefined || discountPercentage < 0 || discountPercentage > 99) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 99' },
        { status: 400 }
      );
    }

    let productsToUpdate = productIds;

    if (bulkDiscountType === 'brand' && bulkDiscountTarget) {
      const brandProducts = (await findProducts({ adminView: true })).filter(
        (p) =>
          productIds.includes(p._id) &&
          p.brand?.toLowerCase() === bulkDiscountTarget.toLowerCase()
      );
      productsToUpdate = brandProducts.map((p) => p._id);
    } else if (bulkDiscountType === 'category' && bulkDiscountTarget) {
      const categoryProducts = (await findProducts({ adminView: true })).filter(
        (p) => productIds.includes(p._id) && p.category === bulkDiscountTarget
      );
      productsToUpdate = categoryProducts.map((p) => p._id);
    }

    if (productsToUpdate.length === 0) {
      return NextResponse.json(
        { error: 'No products match the specified criteria' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    for (const productId of productsToUpdate) {
      const product = await findProductById(productId);
      if (!product) continue;

      const basePrice = product.originalPrice ?? product.price;
      const pricing =
        discountPercentage === 0
          ? applyProductDiscountFields(basePrice, null)
          : applyProductDiscountFields(basePrice, discountPercentage);

      await updateProduct(productId, {
        ...product,
        price: pricing.price,
        originalPrice: pricing.original_price,
        discountPercentage: pricing.discount_percentage,
      });
      updatedCount++;
    }

    const action =
      discountPercentage === 0
        ? 'removed discount from'
        : `applied ${discountPercentage}% discount to`;

    return NextResponse.json({
      message: `Successfully ${action} ${updatedCount} products`,
      updatedCount,
      discountPercentage,
      bulkDiscountType,
      bulkDiscountTarget,
    });
  } catch (error) {
    console.error('Error applying bulk discount:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply bulk discount',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const products = await findProducts({ adminView: true });
    if (!products.length) {
      return NextResponse.json({ isGlobalDiscount: false });
    }

    const firstDiscount = products[0].discountPercentage;
    if (!firstDiscount || firstDiscount <= 0) {
      return NextResponse.json({ isGlobalDiscount: false });
    }

    const allSame = products.every((p) => p.discountPercentage === firstDiscount);
    if (allSame) {
      return NextResponse.json({ isGlobalDiscount: true, discountPercentage: firstDiscount });
    }

    return NextResponse.json({ isGlobalDiscount: false });
  } catch (error) {
    console.error('Error checking global discount:', error);
    return NextResponse.json(
      {
        error: 'Failed to check global discount',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
