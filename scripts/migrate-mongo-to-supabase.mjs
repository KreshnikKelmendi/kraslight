/**
 * One-time migration: copy all MongoDB data into Supabase.
 *
 * Prerequisites:
 * 1. Run supabase/schema.sql in Supabase SQL Editor
 * 2. Set MONGODB_URI, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local
 *
 * Usage: node scripts/migrate-mongo-to-supabase.mjs
 */
import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const mongoUri = process.env.MONGODB_URI;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!mongoUri || !supabaseUrl || !supabaseKey) {
  console.error('Missing MONGODB_URI or Supabase env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function migrateCollection(name, transform, table) {
  const col = mongoose.connection.collection(name);
  const docs = await col.find({}).toArray();
  console.log(`Migrating ${docs.length} ${table}...`);

  if (!docs.length) return 0;

  const rows = docs.map(transform);
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'legacy_mongo_id' });
  if (error) throw new Error(`${table}: ${error.message}`);
  return docs.length;
}

async function main() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
  console.log('Connected to MongoDB');

  const counts = {
    products: await migrateCollection(
      'products',
      (p) => ({
        legacy_mongo_id: p._id.toString(),
        title: p.title,
        price: p.price ?? null,
        original_price: p.originalPrice ?? null,
        discount_percentage: p.discountPercentage ?? null,
        image: p.image ?? null,
        images: p.images ?? [],
        main_image: p.mainImage ?? null,
        description: p.description ?? null,
        stock: p.stock ?? 0,
        brand: p.brand,
        brand_logo: p.brandLogo ?? null,
        sizes: p.sizes ?? '',
        subcategory: p.subcategory ?? '',
        barcode: p.barcode ?? '',
        gender: p.gender ?? 'Të Gjitha',
        category: p.category ?? 'Të tjera',
        is_new_arrival: Boolean(p.isNewArrival),
        characteristics: p.characteristics ?? [],
        created_at: p.createdAt ?? new Date(),
        updated_at: p.updatedAt ?? new Date(),
      }),
      'products'
    ),
    collections: await migrateCollection(
      'collections',
      (c) => ({
        legacy_mongo_id: c._id.toString(),
        name: c.name,
        description: c.description ?? null,
        image: c.image,
        categories: c.categories ?? [],
        product_ids: (c.products ?? []).map((id) => id.toString()),
        created_at: c.createdAt ?? new Date(),
        updated_at: c.updatedAt ?? new Date(),
      }),
      'collections'
    ),
    orders: await migrateCollection(
      'orders',
      (o) => ({
        legacy_mongo_id: o._id.toString(),
        email: o.email,
        first_name: o.firstName,
        last_name: o.lastName,
        phone: o.phone,
        country: o.country,
        address: o.address,
        city: o.city ?? null,
        postal_code: o.postalCode,
        notes: o.notes ?? null,
        payment_method: o.paymentMethod ?? 'cash',
        items: o.items ?? [],
        total: o.total,
        status: o.status ?? 'pending',
        created_at: o.createdAt ?? new Date(),
        updated_at: o.updatedAt ?? new Date(),
      }),
      'orders'
    ),
    sliders: await migrateCollection(
      'sliders',
      (s) => ({
        legacy_mongo_id: s._id.toString(),
        slides: s.slides ?? [],
        is_active: Boolean(s.isActive),
        created_at: s.createdAt ?? new Date(),
        updated_at: s.updatedAt ?? new Date(),
      }),
      'sliders'
    ),
    subscribers: await migrateCollection(
      'subscribers',
      (s) => ({
        legacy_mongo_id: s._id.toString(),
        email: s.email,
        is_active: Boolean(s.isActive),
        subscribed_at: s.subscribedAt ?? s.createdAt ?? new Date(),
        last_email_sent: s.lastEmailSent ?? null,
        email_count: s.emailCount ?? 0,
        created_at: s.createdAt ?? new Date(),
        updated_at: s.updatedAt ?? new Date(),
      }),
      'subscribers'
    ),
  };

  console.log('Migration complete:', counts);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
