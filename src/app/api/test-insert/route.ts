import { NextRequest, NextResponse } from 'next/server';

import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    // Get and log all form data
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const brand = formData.get('brand') as string;
    const sizes = (formData.get('sizes') as string) || ''; // Handle empty sizes
    const gender = (formData.get('gender') as string) || 'Të Gjitha'; // Default gender
    const category = formData.get('category') as string;
    const subcategory = (formData.get('subcategory') as string) || '';
    const description = formData.get('description') as string;
    const isNewArrival = formData.get('isNewArrival') === 'true'; // Convert string to boolean
    const characteristics = formData.get('characteristics') as string;
    const files = formData.getAll('images') as File[];
    const brandLogoFile = formData.get('brandLogo') as File | null;

    console.log('=== DEBUG: Form Data Received ===');
    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Stock:', stock);
    console.log('Brand:', brand);
    console.log('Sizes:', sizes);
    console.log('Gender:', gender);
    console.log('Category:', category);
    console.log('Description:', description);
    console.log('Is New Arrival:', isNewArrival);
    console.log('Characteristics:', characteristics);
    console.log('Files:', files?.map(f => f.name));

    if (!title || isNaN(price) || isNaN(stock) || !files.length) {
      console.log('=== DEBUG: Validation Failed ===');
      console.log('Missing or invalid fields:', {
        title: !title,
        price: isNaN(price),
        stock: isNaN(stock),
        files: !files.length
      });
      return NextResponse.json(
        { error: 'Missing or invalid fields' }, 
        { status: 400 }
      );
    }

    // Upload all images
    const imagePaths = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'products', fileName);

      // Ensure the uploads/products directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      await writeFile(filePath, buffer);
      imagePaths.push(`/uploads/products/${fileName}`);
    }

    // Handle brand logo upload if present
    let brandLogoPath = '';
    if (brandLogoFile && brandLogoFile.size > 0) {
      const bytes = await brandLogoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${uuidv4()}-${brandLogoFile.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'brands', fileName);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'brands');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      await writeFile(filePath, buffer);
      brandLogoPath = `/uploads/brands/${fileName}`;
    }
    
    // Create product with logging
    console.log('=== DEBUG: Creating Product ===');
    const productData = {
      title,
      price,
      stock,
      brand: brand || 'Të tjera',
      sizes: sizes || '', // Always include sizes, use empty string if not provided
      gender: gender || 'Të Gjitha',
      category: category || 'Të tjera',
      subcategory, // Save subcategory
      description: description || '',
      characteristics: characteristics ? JSON.parse(characteristics) : [],
      images: imagePaths,
      mainImage: imagePaths[0], // Set first image as main image
      image: imagePaths[0], // Keep legacy field for backward compatibility
      isNewArrival,
      ...(brandLogoPath ? { brandLogo: brandLogoPath } : {})
    };

    console.log('Product data:', productData);

    const newProduct = await Product.create(productData);

    console.log('=== DEBUG: Product Created ===');
    console.log('New product:', JSON.stringify(newProduct, null, 2));

    return NextResponse.json({ 
      message: 'Product added successfully', 
      product: {
        ...newProduct.toObject(),
        createdAt: newProduct.createdAt
      }
    });
  } catch (err) {
    console.error('=== DEBUG: Error in Product Creation ===');
    console.error('Error details:', err);
    return NextResponse.json(
      { error: 'Upload failed', details: err }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    
    // Update existing products to have isNewArrival field if it doesn't exist
    const updateResult = await Product.updateMany(
      { isNewArrival: { $exists: false } },
      { $set: { isNewArrival: false } }
    );
    
    // Get all products
    const products = await Product.find({});
    
    // Get counts
    const totalProducts = await Product.countDocuments();
    const zeroStockProducts = await Product.countDocuments({ stock: { $lte: 0 } });
    const newArrivalsCount = await Product.countDocuments({ isNewArrival: true });
    
    return NextResponse.json({
      message: 'Database query completed successfully.',
      stats: {
        totalProducts,
        zeroStockProducts,
        newArrivalsCount,
        updatedProducts: updateResult.modifiedCount
      },
      products: products.map(p => ({
        id: p._id,
        title: p.title,
        stock: p.stock,
        isNewArrival: p.isNewArrival
      }))
    });
    
  } catch (error) {
    console.error('Error querying database:', error);
    return NextResponse.json(
      { error: 'Failed to query database', details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
