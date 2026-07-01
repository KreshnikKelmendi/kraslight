import { NextResponse } from 'next/server';
import { ISlide } from '@/app/models/Slider';
import { sanitizeImageUrl } from '@/app/lib/images';
import { createActiveSlider, findActiveSlider } from '@/app/lib/supabase/sliders';

interface ApiError extends Error {
  statusCode?: number;
}

function isValidSlide(slide: unknown): slide is ISlide {
  if (!slide || typeof slide !== 'object') return false;
  const s = slide as Record<string, unknown>;
  return typeof s.image === 'string' && s.image.trim() !== '';
}

export async function GET() {
  try {
    const activeSlider = await findActiveSlider();

    if (!activeSlider) {
      return NextResponse.json({
        _id: null,
        slides: [],
      });
    }

    const validSlides = (activeSlider.slides as unknown[])
      .filter(isValidSlide)
      .map((slide: ISlide) => ({
        image: sanitizeImageUrl(slide.image.trim()) ?? '',
        title: typeof slide.title === 'string' ? slide.title.trim() : '',
        description: typeof slide.description === 'string' ? slide.description.trim() : '',
        link: typeof slide.link === 'string' ? slide.link.trim() : '',
      }))
      .filter((slide) => slide.image.length > 0);

    return NextResponse.json({
      _id: activeSlider._id,
      slides: validSlides,
    });
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error('Error in GET /api/sliders:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch slider',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.slides || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { error: 'Invalid request: slides array is required' },
        { status: 400 }
      );
    }

    const validSlides = (body.slides as unknown[])
      .filter(isValidSlide)
      .map((slide: ISlide) => ({
        image: slide.image.trim(),
        title: typeof slide.title === 'string' ? slide.title.trim() : '',
        description: typeof slide.description === 'string' ? slide.description.trim() : '',
        link: typeof slide.link === 'string' ? slide.link.trim() : '',
      }));

    if (validSlides.length === 0) {
      return NextResponse.json({ error: 'No valid slides provided' }, { status: 400 });
    }

    const slider = await createActiveSlider(validSlides);

    return NextResponse.json({
      _id: slider._id,
      slides: validSlides,
    });
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error('Error in POST /api/sliders:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Failed to create slider',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
