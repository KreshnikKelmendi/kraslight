import { NextRequest, NextResponse } from 'next/server';
import {
  findActiveSubscribers,
  findSubscriberByEmail,
  subscribeEmail,
} from '@/app/lib/supabase/subscribers';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email i vlefshëm është i detyrueshëm' },
        { status: 400 }
      );
    }

    const normalized = email.toLowerCase().trim();
    const existing = await findSubscriberByEmail(normalized);

    if (existing?.isActive) {
      return NextResponse.json({ error: 'Ky email është tashmë i abonuar' }, { status: 409 });
    }

    if (existing && !existing.isActive) {
      await subscribeEmail(normalized);
      return NextResponse.json({ message: 'Abonimi u riaktivizua me sukses!' }, { status: 200 });
    }

    await subscribeEmail(normalized);
    return NextResponse.json({ message: 'Abonimi u krye me sukses!' }, { status: 201 });
  } catch (error) {
    console.error('Error in subscribe API:', error);
    return NextResponse.json({ error: 'Gabim i brendshëm i serverit' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await findActiveSubscribers();
    return NextResponse.json(
      subscribers.map((s) => ({
        email: s.email,
        subscribedAt: s.subscribedAt,
        emailCount: s.emailCount,
        lastEmailSent: s.lastEmailSent,
      }))
    );
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Gabim i brendshëm i serverit' }, { status: 500 });
  }
}
