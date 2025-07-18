import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';
import { uploadImage } from '@/app/lib/cloudinary';

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

    // Handle file uploads to Cloudinary
    const imageUrls = [];
    
    try {
      // Upload all image files to Cloudinary
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          return NextResponse.json(
            { error: `File ${file.name} is not an image. Please upload only image files.` }, 
            { status: 400 }
          );
        }
        
        // Upload to Cloudinary
        const imageUrl = await uploadImage(file, 'kraslight/products');
        imageUrls.push(imageUrl);
        
        console.log(`✅ File ${i + 1} uploaded to Cloudinary: ${file.name} -> ${imageUrl}`);
      }
    } catch (fileError) {
      console.error('Cloudinary upload error:', fileError);
      return NextResponse.json(
        { error: 'Image upload failed. Please try again.' }, 
        { status: 500 }
      );
    }

    // Handle brand logo upload if present
    let brandLogoUrl = '';
    if (brandLogoFile && brandLogoFile.size > 0) {
      try {
        if (!brandLogoFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Brand logo must be an image file.' }, 
            { status: 400 }
          );
        }
        
        // Upload brand logo to Cloudinary
        brandLogoUrl = await uploadImage(brandLogoFile, 'kraslight/brands');
        
        console.log(`✅ Brand logo uploaded to Cloudinary: ${brandLogoFile.name} -> ${brandLogoUrl}`);
      } catch (logoError) {
        console.error('Brand logo upload error:', logoError);
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
      images: imageUrls,
      mainImage: imageUrls[0],
      image: imageUrls[0], // Legacy field
      isNewArrival,
      ...(brandLogoUrl ? { brandLogo: brandLogoUrl } : {})
    };

    console.log('Creating product with data:', {
      title: productData.title,
      price: productData.price,
      stock: productData.stock,
      brand: productData.brand,
      category: productData.category,
      imagesCount: productData.images.length,
      hasBrandLogo: !!brandLogoUrl
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
      } else if (err.message.includes('Cloudinary')) {
        errorMessage = 'Image upload service error. Please try again.';
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