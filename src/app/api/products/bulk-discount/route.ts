import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

export async function PUT(req: NextRequest) {
  try {
    console.log('=== BULK DISCOUNT API START ===');
    
    // Test database connection
    try {
      await connectToDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log('Received request body:', body);
    
    const { productIds, discountPercentage, bulkDiscountType, bulkDiscountTarget } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      console.log('Invalid productIds:', productIds);
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    if (discountPercentage === undefined || discountPercentage < 0 || discountPercentage > 99) {
      console.log('Invalid discount percentage:', discountPercentage);
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 99' },
        { status: 400 }
      );
    }

    console.log(`Processing ${productIds.length} products with ${discountPercentage}% discount`);
    console.log(`Bulk discount type: ${bulkDiscountType}, target: ${bulkDiscountTarget}`);

    // Determine which products to update based on bulk discount type
    let productsToUpdate = productIds;

    if (bulkDiscountType === 'brand' && bulkDiscountTarget) {
      // Filter products by brand
      const brandProducts = await Product.find({ 
        _id: { $in: productIds },
        brand: bulkDiscountTarget 
      }).select('_id');
      productsToUpdate = brandProducts.map(p => p._id.toString());
      console.log(`Filtered to ${productsToUpdate.length} products from brand: ${bulkDiscountTarget}`);
    } else if (bulkDiscountType === 'category' && bulkDiscountTarget) {
      // Filter products by category
      const categoryProducts = await Product.find({ 
        _id: { $in: productIds },
        category: bulkDiscountTarget 
      }).select('_id');
      productsToUpdate = categoryProducts.map(p => p._id.toString());
      console.log(`Filtered to ${productsToUpdate.length} products from category: ${bulkDiscountTarget}`);
    }

    if (productsToUpdate.length === 0) {
      console.log('No products match the specified criteria');
      return NextResponse.json(
        { error: 'No products match the specified criteria' },
        { status: 400 }
      );
    }

    // Update all products with the discount
    const updatePromises = productsToUpdate.map(async (productId: string) => {
      try {
        const product = await Product.findById(productId);
        if (!product) {
          console.log(`Product not found: ${productId}`);
          return null;
        }

        console.log(`Updating product: ${product.title}, current price: ${product.price}`);

        if (discountPercentage === 0) {
          // Remove discount
          product.discountPercentage = undefined;
          if (product.originalPrice) {
            product.price = product.originalPrice;
            product.originalPrice = undefined;
          }
          console.log(`Removing discount from product: ${product.title}`);
        } else {
          // Apply discount
          // Store original price if not already stored
          if (!product.originalPrice) {
            product.originalPrice = product.price;
          }

          // Apply discount
          product.discountPercentage = discountPercentage;
          // Let the pre-save middleware handle the price calculation
          // product.price = product.originalPrice * (1 - discountPercentage / 100);

          console.log(`Setting discount: ${product.discountPercentage}%, original price: ${product.originalPrice}`);
        }

        const savedProduct = await product.save();
        console.log(`Product saved successfully: ${savedProduct.title}`);
        return savedProduct;
      } catch (productError) {
        console.error(`Error updating product ${productId}:`, productError);
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter(result => result !== null).length;

    const action = discountPercentage === 0 ? 'removed discount from' : `applied ${discountPercentage}% discount to`;
    console.log(`Successfully ${action} ${updatedCount} products`);
    console.log('=== BULK DISCOUNT API END ===');

    return NextResponse.json({
      message: `Successfully ${action} ${updatedCount} products`,
      updatedCount,
      discountPercentage,
      bulkDiscountType,
      bulkDiscountTarget
    });

  } catch (error) {
    console.error('Error applying bulk discount:', error);
    return NextResponse.json(
      { error: 'Failed to apply bulk discount', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    const productCount = await Product.countDocuments();
    return NextResponse.json({
      message: 'Bulk discount API is working',
      productCount
    });
  } catch (error) {
    console.error('GET test failed:', error);
    return NextResponse.json(
      { error: 'API test failed' },
      { status: 500 }
    );
  }
} 