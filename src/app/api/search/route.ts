import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

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
            { description: searchRegex }
          ]
        }
      ]
    };

    const products = await Product.find(searchQuery)
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit)
      .lean();

    // Format the response
    const formattedProducts = products.map(product => ({
      _id: product._id.toString(),
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      image: product.image || product.mainImage || (product.images && product.images[0]),
      stock: product.stock,
      brand: product.brand,
      sizes: product.sizes,
      gender: product.gender,
      category: product.category,
      isNewArrival: product.isNewArrival,
      description: product.description
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to search products', details: error },
      { status: 500 }
    );
  }
} 