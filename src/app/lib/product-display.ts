/** Show product title as entered in admin (keeps hyphens, casing, and spacing). */
export function formatProductDisplayTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

/** URL-safe slug from product title (Albanian-friendly). */
export function slugifyProductTitle(title: string): string {
  return formatProductDisplayTitle(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ëË]/g, 'e')
    .replace(/[çÇ]/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Storefront path for a product page, e.g. `/products/llambadar-modern`. */
export function getProductPath(product: { _id: string; title: string }): string {
  const slug = slugifyProductTitle(product.title);
  return `/products/${slug || product._id}`;
}

export function looksLikeProductId(value: string): boolean {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ||
    /^[0-9a-f]{24}$/i.test(value)
  );
}

/** URL-safe slug from collection name (same rules as product titles). */
export function slugifyCollectionName(name: string): string {
  return slugifyProductTitle(name);
}

/** Storefront path for a collection page, e.g. `/collections/ndriqim`. */
export function getCollectionPath(collection: { _id: string; name: string }): string {
  const slug = slugifyCollectionName(collection.name);
  return `/collections/${slug || collection._id}`;
}

export function looksLikeCollectionId(value: string): boolean {
  return looksLikeProductId(value);
}
