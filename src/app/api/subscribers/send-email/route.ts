import { NextRequest, NextResponse } from 'next/server';
import { sendEmailToSubscribers } from '@/app/lib/email';
import { findActiveSubscribers, markSubscribersEmailed } from '@/app/lib/supabase/subscribers';

export async function POST(request: NextRequest) {
  try {
    const { subject, message, htmlContent } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subjekti dhe mesazhi janë të detyrueshëm' },
        { status: 400 }
      );
    }

    const subscribers = await findActiveSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'Nuk ka abonues aktivë' }, { status: 404 });
    }

    const results = [];
    const emailedIds: string[] = [];

    for (const subscriber of subscribers) {
      try {
        await sendEmailToSubscribers(subscriber.email, subject, message, htmlContent);
        emailedIds.push(subscriber._id);
        results.push({ email: subscriber.email, status: 'success' });
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error);
        results.push({
          email: subscriber.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (emailedIds.length) {
      await markSubscribersEmailed(emailedIds);
    }

    const successful = results.filter((r) => r.status === 'success').length;
    const failed = results.length - successful;

    return NextResponse.json({
      message: 'Email u dërgua me sukses!',
      stats: { total: subscribers.length, successful, failed },
      results,
    });
  } catch (error) {
    console.error('Error sending emails to subscribers:', error);
    return NextResponse.json({ error: 'Gabim i brendshëm i serverit' }, { status: 500 });
  }
}
