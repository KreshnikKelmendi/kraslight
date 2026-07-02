import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/app/lib/supabase/server';

export const dynamic = 'force-dynamic';

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Supabase is not configured')) {
      return 'Database configuration missing';
    }
    return error.message;
  }
  return 'Health check failed';
}

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('[GET /api/health] Supabase error:', error.message);
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          message: error.message,
          timestamp,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp,
    });
  } catch (error) {
    console.error('[GET /api/health]', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: safeErrorMessage(error),
        timestamp,
      },
      { status: 503 }
    );
  }
}
