import { NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';

export async function GET() {
  try {
    console.log('=== TESTING CLOUDINARY CONFIGURATION ===');
    
    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log('Environment variables check:', {
      CLOUDINARY_CLOUD_NAME: cloudName ? 'SET' : 'NOT SET',
      CLOUDINARY_API_KEY: apiKey ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: apiSecret ? 'SET' : 'NOT SET',
      cloudNameLength: cloudName?.length || 0,
      apiKeyLength: apiKey?.length || 0,
      apiSecretLength: apiSecret?.length || 0
    });
    
    // Check if environment variables are set
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary environment variables are missing');
      return NextResponse.json({ 
        success: false, 
        error: 'Cloudinary environment variables are not configured',
        config: {
          CLOUDINARY_CLOUD_NAME: cloudName ? 'SET' : 'NOT SET',
          CLOUDINARY_API_KEY: apiKey ? 'SET' : 'NOT SET',
          CLOUDINARY_API_SECRET: apiSecret ? 'SET' : 'NOT SET'
        }
      }, { status: 500 });
    }
    
    // Test Cloudinary connection
    console.log('Testing Cloudinary connection...');
    
    // Try to get account info to test connection
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary connection successful:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cloudinary configuration is working correctly',
      config: {
        CLOUDINARY_CLOUD_NAME: 'SET',
        CLOUDINARY_API_KEY: 'SET',
        CLOUDINARY_API_SECRET: 'SET'
      },
      ping: result
    });
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Cloudinary configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      config: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
      }
    }, { status: 500 });
  }
} 