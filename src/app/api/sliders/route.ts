import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Slider, ISlide } from '@/app/models/Slider';

interface ApiError extends Error {
  statusCode?: number;
}

// Helper function to validate a slide
function isValidSlide(slide: unknown): slide is ISlide {
  if (!slide || typeof slide !== 'object') return false;
  const s = slide as Record<string, unknown>;
  return (
    typeof s.image === 'string' &&
    s.image.trim() !== ''
  );
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    await connectToDB();
    console.log('Connected to database');

    const activeSlider = await Slider.findOne({ isActive: true });
    console.log('Active slider found:', activeSlider ? 'yes' : 'no');

    if (!activeSlider) {
      return NextResponse.json({ 
        _id: null,
        slides: [] 
      });
    }

    // Validate and filter slides
    const validSlides = (activeSlider.slides as unknown[])
      .filter(isValidSlide)
      .map((slide: ISlide) => ({
        image: slide.image.trim(),
        title: typeof slide.title === 'string' ? slide.title.trim() : '',
        description: typeof slide.description === 'string' ? slide.description.trim() : '',
        link: typeof slide.link === 'string' ? slide.link.trim() : ''
      }));

    return NextResponse.json({
      _id: activeSlider._id,
      slides: validSlides
    });
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error('Error in GET /api/sliders:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch slider',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received slider data:', body);

    if (!body.slides || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { error: 'Invalid request: slides array is required' },
        { status: 400 }
      );
    }

    // Validate and filter slides
    const validSlides = (body.slides as unknown[])
      .filter(isValidSlide)
      .map((slide: ISlide) => ({
        image: slide.image.trim(),
        title: typeof slide.title === 'string' ? slide.title.trim() : '',
        description: typeof slide.description === 'string' ? slide.description.trim() : '',
        link: typeof slide.link === 'string' ? slide.link.trim() : ''
      }));

    if (validSlides.length === 0) {
      return NextResponse.json(
        { error: 'No valid slides provided' },
        { status: 400 }
      );
    }

    // Deactivate all existing sliders
    await Slider.updateMany({}, { isActive: false });

    // Create new slider
    const slider = await Slider.create({
      slides: validSlides,
      isActive: true
    });

    return NextResponse.json({
      _id: slider._id,
      slides: validSlides
    });
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error('Error in POST /api/sliders:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Failed to create slider',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 