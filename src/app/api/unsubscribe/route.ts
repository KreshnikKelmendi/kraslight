import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Subscriber } from '@/app/models/Subscriber';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email i vlefshëm është i detyrueshëm' },
        { status: 400 }
      );
    }

    // Find and deactivate subscriber
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Ky email nuk është i regjistruar' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: 'Ky email është tashmë i çabonuar' },
        { status: 409 }
      );
    }

    // Deactivate the subscriber
    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json(
      { message: 'Çabonimi u krye me sukses!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in unsubscribe API:', error);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email i vlefshëm është i detyrueshëm' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find and deactivate subscriber
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Ky email nuk është i regjistruar' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: 'Ky email është tashmë i çabonuar' },
        { status: 409 }
      );
    }

    // Deactivate the subscriber
    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json(
      { message: 'Çabonimi u krye me sukses!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in unsubscribe API:', error);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit' },
      { status: 500 }
    );
  }
} 