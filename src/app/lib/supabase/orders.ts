import { createSupabaseServerClient } from './server';
import { orderRowToDoc } from './row-map';

export async function findOrders() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => orderRowToDoc(row));
}

export async function findOrderById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .maybeSingle();
  if (error) throw error;
  return data ? orderRowToDoc(data) : null;
}

export async function createOrder(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  address: string;
  city?: string;
  postalCode: string;
  notes?: string;
  paymentMethod?: string;
  items: unknown[];
  total: number;
  status?: string;
}) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .insert({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      country: input.country,
      address: input.address,
      city: input.city ?? null,
      postal_code: input.postalCode,
      notes: input.notes ?? null,
      payment_method: input.paymentMethod ?? 'cash',
      items: input.items,
      total: input.total,
      status: input.status ?? 'pending',
    })
    .select('*')
    .single();
  if (error) throw error;
  return orderRowToDoc(data);
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? orderRowToDoc(data) : null;
}

export async function deleteOrderById(id: string) {
  const supabase = createSupabaseServerClient();
  const order = await findOrderById(id);
  const { error } = await supabase
    .from('orders')
    .delete()
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`);
  if (error) throw error;
  return order;
}

export async function deleteOrdersByIds(ids: string[]) {
  const supabase = createSupabaseServerClient();
  const orders = [];
  for (const id of ids) {
    const order = await findOrderById(id);
    if (order) orders.push(order);
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .or(
      ids.map((id) => `id.eq.${id}`).join(',') +
        ',' +
        ids.map((id) => `legacy_mongo_id.eq.${id}`).join(',')
    );
  if (error) throw error;
  return orders;
}
