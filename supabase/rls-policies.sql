-- Run in Supabase SQL Editor AFTER schema.sql (and storage-and-policies.sql)
-- Fixes Advisor "RLS Disabled in Public" on all 5 tables.
--
-- Your Next.js API uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) — site keeps working.
-- anon / authenticated clients (publishable key) cannot read or write tables directly.

-- ── 1. Enable RLS ───────────────────────────────────────────────────────────
alter table products enable row level security;
alter table collections enable row level security;
alter table orders enable row level security;
alter table sliders enable row level security;
alter table subscribers enable row level security;

-- ── 2. Remove broad table grants for public roles ───────────────────────────
revoke all on table products from anon, authenticated;
revoke all on table collections from anon, authenticated;
revoke all on table orders from anon, authenticated;
revoke all on table sliders from anon, authenticated;
revoke all on table subscribers from anon, authenticated;

-- service_role keeps full access and bypasses RLS automatically.

-- ── 3. Optional: public read-only for storefront data ────────────────────────
-- Uncomment ONLY if you query Supabase directly from the browser with the
-- publishable key. This app uses Next.js API routes, so leave commented.

-- create policy "products_public_read"
-- on products for select to anon, authenticated using (true);
--
-- create policy "collections_public_read"
-- on collections for select to anon, authenticated using (true);
--
-- create policy "sliders_public_read"
-- on sliders for select to anon, authenticated using (true);

-- orders + subscribers: no policies = blocked for anon/authenticated (correct).
