import { createSupabaseServerClient } from './server';
import { hasTrackedStock } from '@/app/lib/images';
import {
  applyProductDiscountFields,
  productDocToRow,
  productRowToDoc,
} from './row-map';

export async function findProducts(filters?: {
  gender?: string;
  brand?: string;
  adminView?: boolean;
  categoryIn?: string[];
  onSale?: boolean;
  search?: string;
  stockGt?: number;
}) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });

  if (filters?.gender && ['Meshkuj', 'Femra'].includes(filters.gender)) {
    query = query.eq('gender', filters.gender);
  }
  if (filters?.brand) {
    query = query.ilike('brand', filters.brand);
  }
  if (filters?.stockGt != null) {
    query = query.gt('stock', filters.stockGt);
  }
  if (filters?.categoryIn?.length) {
    query = query.in('category', filters.categoryIn);
  }
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(
      `title.ilike.${term},brand.ilike.${term},category.ilike.${term},description.ilike.${term},barcode.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = data ?? [];
  if (filters?.onSale) {
    rows = rows.filter(
      (p) =>
        (p.discount_percentage != null && Number(p.discount_percentage) > 0) ||
        (p.original_price != null &&
          p.price != null &&
          Number(p.price) < Number(p.original_price))
    );
  }

  return rows.map((row) => productRowToDoc(row));
}

export async function findProductById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .maybeSingle();

  if (error) throw error;
  return data ? productRowToDoc(data) : null;
}

export async function createProduct(input: Record<string, unknown>) {
  const supabase = createSupabaseServerClient();
  const row = productDocToRow(input);
  const { data, error } = await supabase.from('products').insert(row).select('*').single();
  if (error) throw error;
  return productRowToDoc(data);
}

export async function updateProduct(id: string, input: Record<string, unknown>) {
  const supabase = createSupabaseServerClient();
  const row = productDocToRow(input);
  const { data, error } = await supabase
    .from('products')
    .update(row)
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return productRowToDoc(data);
}

export async function deleteProductById(id: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`);
  if (error) throw error;
}

export async function deleteProductsByIds(ids: string[]) {
  const supabase = createSupabaseServerClient();
  const { data: toDelete, error: findError } = await supabase
    .from('products')
    .select('*')
    .or(
      ids.map((id) => `id.eq.${id}`).join(',') +
        ',' +
        ids.map((id) => `legacy_mongo_id.eq.${id}`).join(',')
    );

  if (findError) throw findError;

  const { error } = await supabase
    .from('products')
    .delete()
    .or(
      ids.map((id) => `id.eq.${id}`).join(',') +
        ',' +
        ids.map((id) => `legacy_mongo_id.eq.${id}`).join(',')
    );

  if (error) throw error;
  return (toDelete ?? []).map((row) => productRowToDoc(row));
}

export async function incrementProductStock(id: string, delta: number) {
  const product = await findProductById(id);
  if (!product) return null;
  if (!hasTrackedStock(product.stock)) return product;
  const newStock = Math.max(0, Number(product.stock) + delta);
  return updateProduct(id, { ...product, stock: newStock });
}

export async function updateProductsBulkDiscount(
  discountPercentage: number | null,
  filters?: { brand?: string; category?: string }
) {
  const products = await findProducts({ adminView: true });
  const filtered = products.filter((p) => {
    if (filters?.brand && p.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters?.category && p.category !== filters.category) return false;
    return true;
  });

  const updated = [];
  for (const product of filtered) {
    const basePrice =
      product.originalPrice ?? product.price ?? undefined;
    const pricing = applyProductDiscountFields(
      basePrice,
      discountPercentage
    );
    const result = await updateProduct(product._id, {
      ...product,
      price: pricing.price,
      originalPrice: pricing.original_price,
      discountPercentage: pricing.discount_percentage,
    });
    if (result) updated.push(result);
  }
  return updated;
}

export async function getDistinctBrands(withLogosOnly = false) {
  const products = await findProducts({ adminView: true });
  const map = new Map<string, { brand: string; brandLogo?: string }>();

  for (const p of products) {
    if (!p.brand) continue;
    if (withLogosOnly && !p.brandLogo) continue;
    const key = p.brand.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { brand: p.brand, brandLogo: p.brandLogo });
    }
  }

  return Array.from(map.values());
}
