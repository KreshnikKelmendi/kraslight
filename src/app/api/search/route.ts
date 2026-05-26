import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';
import { sanitizeImageList, sanitizeImageUrl } from '@/app/lib/images';

export async function GET(request: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Create a case-insensitive regex pattern for the search query
    const searchRegex = new RegExp(query, 'i');
    
    // Search across multiple fields
    const searchQuery = {
      $and: [
        { stock: { $gt: 0 } }, // Only show products in stock
        {
          $or: [
            { title: searchRegex },
            { brand: searchRegex },
            { category: searchRegex },
            { description: searchRegex },
            { barcode: searchRegex }
          ]
        }
      ]
    };

    const products = await Product.find(searchQuery)
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit)
      .lean();

    // Format the response
    const formattedProducts = products
      .filter(product => {
        // Filter out products with invalid or missing essential data
        return product.title && 
               product.brand && 
               (product.price === undefined || (typeof product.price === 'number' && !isNaN(product.price)));
      })
      .map(product => {
        const images = sanitizeImageList(product.images as string[]);
        const image =
          sanitizeImageUrl(product.mainImage as string) ??
          images[0] ??
          sanitizeImageUrl(product.image as string);

        return {
        _id: product._id.toString(),
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        image,
        stock: product.stock,
        brand: product.brand,
        sizes: product.sizes,
        gender: product.gender,
        category: product.category,
        barcode: product.barcode,
        isNewArrival: product.isNewArrival,
        description: product.description,
      };
      });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to search products', details: error },
      { status: 500 }
    );
  }
} 