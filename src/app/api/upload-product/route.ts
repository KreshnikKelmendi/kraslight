import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    // Get form data
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

    console.log('=== PRODUCT CREATION REQUEST ===');
    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Stock:', stock);
    console.log('Brand:', brand);
    console.log('Category:', category);
    console.log('Files count:', files?.length);

    // Validate required fields
    if (!title || isNaN(price) || isNaN(stock) || !files.length) {
      console.log('Validation failed:', {
        title: !title,
        price: isNaN(price),
        stock: isNaN(stock),
        files: !files.length
      });
      return NextResponse.json(
        { error: 'Missing or invalid fields. Please check title, price, stock, and images.' }, 
        { status: 400 }
      );
    }

    // Handle file uploads
    const imagePaths = [];
    
    try {
      // For production, you should implement proper file upload to cloud storage
      // For now, we'll create placeholder paths and log file info
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          return NextResponse.json(
            { error: `File ${file.name} is not an image. Please upload only image files.` }, 
            { status: 400 }
          );
        }
        
        // Create a placeholder path - in production, this would be the URL from cloud storage
        const timestamp = Date.now();
        const placeholderPath = `/uploads/products/product-${timestamp}-${i}.${file.name.split('.').pop()}`;
        imagePaths.push(placeholderPath);
        
        console.log(`File ${i + 1}: ${file.name} (${file.size} bytes, ${file.type})`);
      }
    } catch (fileError) {
      console.error('File processing error:', fileError);
      return NextResponse.json(
        { error: 'File processing failed. Please try again.' }, 
        { status: 500 }
      );
    }

    // Handle brand logo upload if present
    let brandLogoPath = '';
    if (brandLogoFile && brandLogoFile.size > 0) {
      try {
        if (!brandLogoFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Brand logo must be an image file.' }, 
            { status: 400 }
          );
        }
        
        const timestamp = Date.now();
        brandLogoPath = `/uploads/brands/brand-${timestamp}.${brandLogoFile.name.split('.').pop()}`;
        console.log(`Brand logo: ${brandLogoFile.name} (${brandLogoFile.size} bytes, ${brandLogoFile.type})`);
      } catch (logoError) {
        console.error('Brand logo processing error:', logoError);
        // Continue without brand logo
      }
    }
    
    // Create product data
    const productData = {
      title: title.trim(),
      price,
      stock,
      brand: brand || 'Të tjera',
      sizes: sizes || '',
      gender: gender || 'Të Gjitha',
      category: category || 'Të tjera',
      subcategory: subcategory || '',
      description: description || '',
      characteristics: characteristics ? JSON.parse(characteristics) : [],
      images: imagePaths,
      mainImage: imagePaths[0],
      image: imagePaths[0], // Legacy field
      isNewArrival,
      ...(brandLogoPath ? { brandLogo: brandLogoPath } : {})
    };

    console.log('Creating product with data:', {
      title: productData.title,
      price: productData.price,
      stock: productData.stock,
      brand: productData.brand,
      category: productData.category,
      imagesCount: productData.images.length,
      hasBrandLogo: !!brandLogoPath
    });

    // Create the product in database
    const newProduct = await Product.create(productData);

    console.log('✅ Product created successfully with ID:', newProduct._id);

    return NextResponse.json({ 
      success: true,
      message: 'Product added successfully', 
      product: {
        _id: newProduct._id,
        title: newProduct.title,
        price: newProduct.price,
        stock: newProduct.stock,
        brand: newProduct.brand,
        category: newProduct.category,
        isNewArrival: newProduct.isNewArrival,
        images: newProduct.images,
        createdAt: newProduct.createdAt
      }
    });
    
  } catch (err) {
    console.error('❌ Error in product creation:', err);
    
    // Provide specific error messages
    let errorMessage = 'Product creation failed';
    let statusCode = 500;
    
    if (err instanceof Error) {
      if (err.message.includes('validation failed')) {
        errorMessage = 'Invalid product data. Please check all required fields.';
        statusCode = 400;
      } else if (err.message.includes('duplicate key')) {
        errorMessage = 'A product with this title already exists. Please use a different title.';
        statusCode = 409;
      } else if (err.message.includes('MongoDB')) {
        errorMessage = 'Database connection error. Please try again.';
        statusCode = 503;
      } else {
        errorMessage = err.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage, 
        details: err instanceof Error ? err.message : 'Unknown error' 
      }, 
      { status: statusCode }
    );
  }
} 