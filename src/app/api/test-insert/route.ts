import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    // Get and log all form data
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const brand = formData.get('brand') as string;
    const sizes = (formData.get('sizes') as string) || '';
    const gender = (formData.get('gender') as string) || 'Të Gjitha';
    const category = formData.get('category') as string;
    const subcategory = (formData.get('subcategory') as string) || '';
    const description = formData.get('description') as string;
    const isNewArrival = formData.get('isNewArrival') === 'true';
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
    console.log('Files count:', files?.length);

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

    // Handle file uploads - for production, we'll use a placeholder approach
    // In a real production app, you'd upload to a cloud storage service like AWS S3, Cloudinary, etc.
    const imagePaths = [];
    
    try {
      // For now, we'll create placeholder paths
      // In production, you should implement proper file upload to cloud storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a placeholder path - in production, this would be the URL from cloud storage
        const placeholderPath = `/uploads/products/placeholder-${Date.now()}-${i}.jpg`;
        imagePaths.push(placeholderPath);
        
        console.log(`File ${i + 1}: ${file.name} (${file.size} bytes)`);
      }
    } catch (fileError) {
      console.error('File upload error:', fileError);
      return NextResponse.json(
        { error: 'File upload failed. Please try again or contact support.' }, 
        { status: 500 }
      );
    }

    // Handle brand logo upload if present
    let brandLogoPath = '';
    if (brandLogoFile && brandLogoFile.size > 0) {
      try {
        // Create placeholder path for brand logo
        brandLogoPath = `/uploads/brands/placeholder-logo-${Date.now()}.png`;
        console.log(`Brand logo: ${brandLogoFile.name} (${brandLogoFile.size} bytes)`);
      } catch (logoError) {
        console.error('Brand logo upload error:', logoError);
        // Continue without brand logo
      }
    }
    
    // Create product with logging
    console.log('=== DEBUG: Creating Product ===');
    const productData = {
      title,
      price,
      stock,
      brand: brand || 'Të tjera',
      sizes: sizes || '',
      gender: gender || 'Të Gjitha',
      category: category || 'Të tjera',
      subcategory,
      description: description || '',
      characteristics: characteristics ? JSON.parse(characteristics) : [],
      images: imagePaths,
      mainImage: imagePaths[0],
      image: imagePaths[0],
      isNewArrival,
      ...(brandLogoPath ? { brandLogo: brandLogoPath } : {})
    };

    console.log('Product data:', productData);

    const newProduct = await Product.create(productData);

    console.log('=== DEBUG: Product Created ===');
    console.log('New product ID:', newProduct._id);

    return NextResponse.json({ 
      message: 'Product added successfully', 
      product: {
        _id: newProduct._id,
        title: newProduct.title,
        price: newProduct.price,
        stock: newProduct.stock,
        brand: newProduct.brand,
        category: newProduct.category,
        isNewArrival: newProduct.isNewArrival,
        createdAt: newProduct.createdAt
      }
    });
  } catch (err) {
    console.error('=== DEBUG: Error in Product Creation ===');
    console.error('Error details:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    if (err instanceof Error) {
      if (err.message.includes('validation failed')) {
        errorMessage = 'Invalid product data. Please check all fields.';
      } else if (err.message.includes('duplicate key')) {
        errorMessage = 'A product with this title already exists.';
      } else {
        errorMessage = err.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: err instanceof Error ? err.message : 'Unknown error' }, 
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
