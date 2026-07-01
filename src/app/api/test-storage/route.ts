import { NextResponse } from 'next/server';
import { ensureStorageBucket, STORAGE_BUCKET } from '@/app/lib/supabase/storage';
import { createSupabaseStorageClient } from '@/app/lib/supabase/server';

export async function GET() {
  try {
    const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

    if (!hasUrl || !hasServiceKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
        },
        { status: 500 }
      );
    }

    await ensureStorageBucket();

    const supabase = createSupabaseStorageClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const bucket = buckets?.find((b) => b.id === STORAGE_BUCKET || b.name === STORAGE_BUCKET);

    return NextResponse.json({
      ok: true,
      bucket: STORAGE_BUCKET,
      public: bucket?.public ?? true,
      message: 'Supabase Storage is ready. New uploads will use the kraslight bucket.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Storage check failed',
        hint: 'Run supabase/storage-and-policies.sql in Supabase SQL Editor, then restart the dev server.',
      },
      { status: 500 }
    );
  }
}
