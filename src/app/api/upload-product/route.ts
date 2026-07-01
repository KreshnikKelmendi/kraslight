import { NextRequest, NextResponse } from 'next/server';
import { createProduct } from '@/app/lib/supabase/products';
import { uploadImageDetailed } from '@/app/lib/upload-image';
import type { CompressionStats } from '@/app/lib/images';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get form data
    const title = formData.get('title') as string;
    const priceStr = formData.get('price') as string;
    const price = priceStr?.trim() ? parseFloat(priceStr) : undefined;
    const stockStr = (formData.get('stock') as string)?.trim();
    const stock = stockStr ? parseInt(stockStr, 10) : null;
    const brand = formData.get('brand') as string;
    const sizes = (formData.get('sizes') as string) || '';
    const gender = (formData.get('gender') as string) || 'Të Gjitha';
    const category = formData.get('category') as string;
    const subcategory = (formData.get('subcategory') as string) || '';
    const barcode = (formData.get('barcode') as string) || '';
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
    if (!title || !files.length) {
      console.log('Validation failed:', {
        title: !title,
        files: !files.length
      });
      return NextResponse.json(
        { error: 'Missing or invalid fields. Please check title and images.' }, 
        { status: 400 }
      );
    }

    const imageUrls: string[] = [];
    const compression: CompressionStats[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          return NextResponse.json(
            { error: `File ${file.name} is not an image. Please upload only image files.` },
            { status: 400 }
          );
        }

        const uploaded = await uploadImageDetailed(file, 'products', 'product');
        imageUrls.push(uploaded.url);
        compression.push(uploaded.compression);

        console.log(
          `✅ File ${i + 1}: ${file.name} → ${uploaded.provider} (${uploaded.url})`
        );
      }
    } catch (fileError) {
      console.error('Image upload error:', fileError);
      return NextResponse.json(
        {
          error:
            fileError instanceof Error
              ? fileError.message
              : 'Image upload failed. Please try again.',
        },
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
        
        const logoUpload = await uploadImageDetailed(brandLogoFile, 'brands', 'brand');
        brandLogoUrl = logoUpload.url;
        compression.push(logoUpload.compression);

        console.log(`✅ Brand logo: ${brandLogoFile.name} → ${logoUpload.provider}`);
      } catch (logoError) {
        console.error('Brand logo upload error:', logoError);
        // Continue without brand logo
      }
    }
    
    // Create product data
    const productData = {
      title: title.trim(),
      ...(price != null && !Number.isNaN(price) ? { price } : {}),
      stock: stock != null && !Number.isNaN(stock) ? stock : undefined,
      brand: brand || 'Të tjera',
      sizes: sizes || '',
      gender: gender || 'Të Gjitha',
      category: category || 'Të tjera',
      subcategory: subcategory || '',
      barcode: barcode || '',
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
    const newProduct = await createProduct(productData);

    console.log('✅ Product created successfully with ID:', newProduct._id);

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      compression,
      product: {
        _id: newProduct._id,
        title: newProduct.title,
        price: newProduct.price,
        stock: newProduct.stock,
        brand: newProduct.brand,
        category: newProduct.category,
        isNewArrival: newProduct.isNewArrival,
        images: newProduct.images,
        createdAt: newProduct.createdAt,
      },
    });
    
  } catch (err) {
    console.error('❌ Error in product creation:', err);

    const pgError = err as { code?: string; message?: string };
    const rawMessage =
      err instanceof Error ? err.message : pgError.message ?? 'Unknown error';

    let errorMessage = 'Product creation failed';
    let statusCode = 500;

    if (
      pgError.code === '23502' &&
      rawMessage.includes('stock')
    ) {
      errorMessage =
        'Stoku bosh kërkon një përditësim të databazës. Ekzekutoni supabase/migrations/allow-null-stock.sql në Supabase SQL Editor, pastaj provoni përsëri.';
      statusCode = 400;
    } else if (rawMessage.includes('null value in column "stock"')) {
      errorMessage =
        'Stoku bosh kërkon një përditësim të databazës. Ekzekutoni supabase/migrations/allow-null-stock.sql në Supabase SQL Editor, pastaj provoni përsëri.';
      statusCode = 400;
    } else if (rawMessage.includes('validation failed')) {
      errorMessage = 'Invalid product data. Please check all required fields.';
      statusCode = 400;
    } else if (rawMessage.includes('duplicate key')) {
      errorMessage = 'A product with this title already exists. Please use a different title.';
      statusCode = 409;
    } else if (rawMessage.includes('MongoDB')) {
      errorMessage = 'Database connection error. Please try again.';
      statusCode = 503;
    } else if (rawMessage.includes('Cloudinary')) {
      errorMessage = 'Image upload service error. Please try again.';
      statusCode = 503;
    } else {
      errorMessage = rawMessage;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: rawMessage,
      },
      { status: statusCode }
    );
  }
} 