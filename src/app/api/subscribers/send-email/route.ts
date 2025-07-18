import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/mongodb';
import { Subscriber } from '@/app/models/Subscriber';
import { sendEmailToSubscribers } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const { subject, message, htmlContent } = await request.json();

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subjekti dhe mesazhi janë të detyrueshëm' },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribers = await Subscriber.find({ isActive: true });
    
    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'Nuk ka abonues aktivë' },
        { status: 404 }
      );
    }

    // Send email to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        await sendEmailToSubscribers(subscriber.email, subject, message, htmlContent);
        
        // Update subscriber stats
        subscriber.lastEmailSent = new Date();
        subscriber.emailCount += 1;
        await subscriber.save();
        
        return { email: subscriber.email, status: 'success' };
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error);
        return { 
          email: subscriber.email, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.status === 'success'
    ).length;
    
    const failed = results.length - successful;

    return NextResponse.json({
      message: `Email u dërgua me sukses!`,
      stats: {
        total: subscribers.length,
        successful,
        failed
      },
      results: results.map(result => 
        result.status === 'fulfilled' ? result.value : { status: 'failed', error: 'Unknown error' }
      )
    });

  } catch (error) {
    console.error('Error sending emails to subscribers:', error);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit' },
      { status: 500 }
    );
  }
} 