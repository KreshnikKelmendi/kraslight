import { createSupabaseServerClient } from './server';
import { subscriberRowToDoc } from './row-map';

export async function findActiveSubscribers() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => subscriberRowToDoc(row));
}

export async function findSubscriberByEmail(email: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data ? subscriberRowToDoc(data) : null;
}

export async function subscribeEmail(email: string) {
  const supabase = createSupabaseServerClient();
  const normalized = email.toLowerCase().trim();
  const existing = await findSubscriberByEmail(normalized);

  if (existing) {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('email', normalized)
      .select('*')
      .single();
    if (error) throw error;
    return subscriberRowToDoc(data);
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({ email: normalized, is_active: true })
    .select('*')
    .single();
  if (error) throw error;
  return subscriberRowToDoc(data);
}

export async function unsubscribeEmail(email: string) {
  const supabase = createSupabaseServerClient();
  const normalized = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from('subscribers')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('email', normalized)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? subscriberRowToDoc(data) : null;
}

export async function markSubscribersEmailed(ids: string[]) {
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();

  for (const id of ids) {
    const { data: row } = await supabase
      .from('subscribers')
      .select('email_count')
      .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
      .maybeSingle();

    await supabase
      .from('subscribers')
      .update({
        last_email_sent: now,
        email_count: (row?.email_count ?? 0) + 1,
        updated_at: now,
      })
      .or(`id.eq.${id},legacy_mongo_id.eq.${id}`);
  }
}

export async function findSubscriberById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .maybeSingle();
  if (error) throw error;
  return data ? subscriberRowToDoc(data) : null;
}

export async function deleteSubscriberById(id: string) {
  const supabase = createSupabaseServerClient();
  const subscriber = await findSubscriberById(id);
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`);
  if (error) throw error;
  return subscriber;
}
