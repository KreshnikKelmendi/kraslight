import { findCollectionsNav } from './supabase/collections';
import { findActiveSlider } from './supabase/sliders';
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
}

const EMPTY_HOME_DATA: HomePageData = {
  slider: { _id: null, slides: [] },
  collections: [],
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const [activeSlider, collectionsRaw] = await Promise.all([
      findActiveSlider(),
      findCollectionsNav(),
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

    return {
      slider: {
        _id: activeSlider?._id ?? null,
        slides,
      },
      collections,
    };
  } catch (error) {
    console.error('[getHomePageData] Failed:', error);
    return EMPTY_HOME_DATA;
  }
}
