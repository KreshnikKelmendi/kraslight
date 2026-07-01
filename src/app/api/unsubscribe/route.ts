import { NextRequest, NextResponse } from 'next/server';
import { findSubscriberByEmail, unsubscribeEmail } from '@/app/lib/supabase/subscribers';

async function handleUnsubscribe(email: string) {
  const subscriber = await findSubscriberByEmail(email.toLowerCase().trim());

  if (!subscriber) {
    return NextResponse.json({ error: 'Ky email nuk është i regjistruar' }, { status: 404 });
  }

  if (!subscriber.isActive) {
    return NextResponse.json({ error: 'Ky email është tashmë i çabonuar' }, { status: 409 });
  }

  await unsubscribeEmail(email);
  return NextResponse.json({ message: 'Çabonimi u krye me sukses!' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email i vlefshëm është i detyrueshëm' },
        { status: 400 }
      );
    }
    return handleUnsubscribe(email);
  } catch (error) {
    console.error('Error in unsubscribe API:', error);
    return NextResponse.json({ error: 'Gabim i brendshëm i serverit' }, { status: 500 });
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
    return handleUnsubscribe(email);
  } catch (error) {
    console.error('Error in unsubscribe API:', error);
    return NextResponse.json({ error: 'Gabim i brendshëm i serverit' }, { status: 500 });
  }
}
