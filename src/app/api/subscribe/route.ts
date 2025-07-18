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

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'Ky email është tashmë i abonuar' },
          { status: 409 }
        );
      } else {
        // Reactivate the subscriber
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        
        return NextResponse.json(
          { message: 'Abonimi u riaktivizua me sukses!' },
          { status: 200 }
        );
      }
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      isActive: true,
      subscribedAt: new Date()
    });

    await subscriber.save();

    return NextResponse.json(
      { message: 'Abonimi u krye me sukses!' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in subscribe API:', error);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();
    
    const subscribers = await Subscriber.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .select('email subscribedAt emailCount lastEmailSent');

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit' },
      { status: 500 }
    );
  }
} 