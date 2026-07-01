import { findCollectionsWithProducts } from './supabase/collections';
import { findProducts } from './supabase/products';
import { findActiveSlider } from './supabase/sliders';
import { formatProduct, type FormattedProduct } from './format-product';
import { sanitizeImageUrl } from './images';

export interface HomeSlide {
  image: string;
  title: string;
  description: string;
  link: string;
}

export interface HomeCollection {
  _id: string;
  name: string;
  image: string;
  description?: string;
}

export interface HomePageData {
  slider: { _id: string | null; slides: HomeSlide[] };
  collections: HomeCollection[];
  otherProducts: FormattedProduct[];
}

const STANDARD_CATEGORIES = [
  'Ndriçim i brendshëm',
  'Ndriçim i jashtëm',
  'Materiale Elektrike',
  'Ndriçim kopshti',
];

const EMPTY_HOME_DATA: HomePageData = {
  slider: { _id: null, slides: [] },
  collections: [],
  otherProducts: [],
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const [activeSlider, collectionsRaw, productsRaw] = await Promise.all([
      findActiveSlider(),
      findCollectionsWithProducts(),
      findProducts(),
    ]);

    const slides: HomeSlide[] = (activeSlider?.slides ?? [])
      .map((slide: Record<string, unknown>) => {
        const image = sanitizeImageUrl(
          typeof slide.image === 'string' ? slide.image.trim() : ''
        );
        if (!image) return null;
        return {
          image,
          title: typeof slide.title === 'string' ? slide.title.trim() : '',
          description:
            typeof slide.description === 'string' ? slide.description.trim() : '',
          link: typeof slide.link === 'string' ? slide.link.trim() : '',
        };
      })
      .filter((s): s is HomeSlide => s !== null);

    const collections: HomeCollection[] = collectionsRaw.map((c) => ({
      _id: c._id,
      name: c.name,
      description: c.description,
      image: sanitizeImageUrl(c.image as string) ?? '',
    }));

    const products = productsRaw.map(formatProduct);
    const otherProducts = products.filter(
      (p) =>
        p.category &&
        !STANDARD_CATEGORIES.includes(p.category) &&
        p.category.trim() !== ''
    );

    return {
      slider: {
        _id: activeSlider?._id ?? null,
        slides,
      },
      collections,
      otherProducts,
    };
  } catch (error) {
    console.error('[getHomePageData] Failed:', error);
    return EMPTY_HOME_DATA;
  }
}
