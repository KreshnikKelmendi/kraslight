import { createSupabaseServerClient } from './server';
import { collectionRowToDoc } from './row-map';
import { findProducts } from './products';

/** Lightweight list for nav / homepage showcase (no product joins). */
export async function findCollectionsNav() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const doc = collectionRowToDoc(row);
    return {
      _id: doc._id,
      name: doc.name,
      description: doc.description,
      image: doc.image,
    };
  });
}

export async function findCollectionsWithProducts() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;

  const collections = (data ?? []).map((row) => collectionRowToDoc(row));

  return Promise.all(
    collections.map(async (collection) => {
      if (collection.categories?.length) {
        const categoryProducts = await findProductsForCategories(collection.categories);
        return { ...collection, products: categoryProducts };
      }
      return collection;
    })
  );
}

export async function findProductsForCategories(categories: string[]) {
  const onSale = categories.includes('Produktet ne Zbritje');
  const realCategories = categories.filter((c) => c !== 'Produktet ne Zbritje');

  const results = [];
  if (onSale) {
    results.push(...(await findProducts({ adminView: true, onSale: true })));
  }
  if (realCategories.length) {
    results.push(...(await findProducts({ adminView: true, categoryIn: realCategories })));
  }

  const seen = new Set<string>();
  return results.filter((p) => {
    if (seen.has(p._id)) return false;
    seen.add(p._id);
    return true;
  });
}

export async function findCollectionById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const collection = collectionRowToDoc(data);
  if (collection.categories?.length) {
    const categoryProducts = await findProductsForCategories(collection.categories);
    return { ...collection, products: categoryProducts };
  }
  return collection;
}

export async function createCollection(input: {
  name: string;
  description?: string;
  image: string;
  categories?: string[];
  products?: string[];
}) {
  const supabase = createSupabaseServerClient();
  let productIds = input.products ?? [];

  if (input.categories?.length) {
    const categoryProducts = await findProductsForCategories(input.categories);
    productIds = categoryProducts.map((p) => p._id);
  }

  const { data: lastOrdered } = await supabase
    .from('collections')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (lastOrdered?.sort_order != null ? Number(lastOrdered.sort_order) : 0) + 1;

  const { data, error } = await supabase
    .from('collections')
    .insert({
      name: input.name,
      description: input.description ?? null,
      image: input.image,
      categories: input.categories ?? [],
      product_ids: productIds,
      sort_order: nextSortOrder,
    })
    .select('*')
    .single();
  if (error) throw error;
  return collectionRowToDoc(data);
}

export async function updateCollection(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    image: string;
    categories: string[];
    products: string[];
  }>
) {
  const supabase = createSupabaseServerClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name != null) patch.name = input.name;
  if (input.description != null) patch.description = input.description;
  if (input.image != null) patch.image = input.image;
  if (input.categories != null) {
    patch.categories = input.categories;
    const categoryProducts = await findProductsForCategories(input.categories);
    patch.product_ids = categoryProducts.map((p) => p._id);
  }
  if (input.products != null) patch.product_ids = input.products;

  const { data, error } = await supabase
    .from('collections')
    .update(patch)
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? collectionRowToDoc(data) : null;
}

export async function deleteCollectionById(id: string) {
  const collection = await findCollectionById(id);
  if (!collection) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('collections')
    .delete()
    .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    .select('*');

  if (error) throw error;
  if (!data?.length) {
    throw new Error('Collection delete failed — no rows removed from database');
  }

  return collection;
}

export async function deleteAllCollections() {
  const supabase = createSupabaseServerClient();
  const { data: existing, error: findError } = await supabase.from('collections').select('*');
  if (findError) throw findError;

  if (!existing?.length) {
    return [];
  }

  const { data: deletedRows, error } = await supabase
    .from('collections')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id');

  if (error) throw error;
  if (!deletedRows?.length) {
    throw new Error('Collections delete failed — no rows removed from database');
  }

  return (existing ?? []).map((row) => collectionRowToDoc(row));
}

export async function updateCollectionsOrder(orderedIds: string[]) {
  const supabase = createSupabaseServerClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('collections')
        .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},legacy_mongo_id.eq.${id}`)
    )
  );
}
