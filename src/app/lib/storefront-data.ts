import { sanitizeImageUrl } from './images';
import { findCollectionsNav } from './supabase/collections';
import { findProducts } from './supabase/products';

export interface StorefrontCollection {
  _id: string;
  name: string;
  description?: string;
  image: string;
}

export interface StorefrontGlobalDiscount {
  isGlobalDiscount: boolean;
  discountPercentage?: number;
}

export interface StorefrontShellData {
  collections: StorefrontCollection[];
  globalDiscount: StorefrontGlobalDiscount;
}

const EMPTY_SHELL_DATA: StorefrontShellData = {
  collections: [],
  globalDiscount: { isGlobalDiscount: false },
};

export async function getGlobalDiscountStatus(): Promise<StorefrontGlobalDiscount> {
  const products = await findProducts({ adminView: true });
  if (!products.length) {
    return { isGlobalDiscount: false };
  }

  const firstDiscount = products[0].discountPercentage;
  if (!firstDiscount || firstDiscount <= 0) {
    return { isGlobalDiscount: false };
  }

  const allSame = products.every((p) => p.discountPercentage === firstDiscount);
  if (allSame) {
    return { isGlobalDiscount: true, discountPercentage: firstDiscount };
  }

  return { isGlobalDiscount: false };
}

export async function getStorefrontShellData(): Promise<StorefrontShellData> {
  try {
    const [collectionsRaw, globalDiscount] = await Promise.all([
      findCollectionsNav(),
      getGlobalDiscountStatus(),
    ]);

    return {
      collections: collectionsRaw.map((c) => ({
        _id: c._id,
        name: c.name,
        description: c.description,
        image: sanitizeImageUrl(c.image) ?? '',
      })),
      globalDiscount,
    };
  } catch (error) {
    console.error('[getStorefrontShellData] Failed:', error);
    return EMPTY_SHELL_DATA;
  }
}
