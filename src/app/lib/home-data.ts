import { connectToDB } from './mongodb';
import { Product } from '../models/Product';
import { Collection } from '../models/Collection';
import { Slider, type ISlide } from '../models/Slider';
import type { Types } from 'mongoose';

type ActiveSliderLean = {
  _id: Types.ObjectId;
  slides: ISlide[];
};

type CollectionLean = {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  image: string;
};
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
  newArrivals: FormattedProduct[];
  otherProducts: FormattedProduct[];
}

const STANDARD_CATEGORIES = [
  'Ndriçim i brendshëm',
  'Ndriçim i jashtëm',
  'Materiale Elektrike',
  'Ndriçim kopshti',
];

export async function getHomePageData(): Promise<HomePageData> {
  await connectToDB();

  const [activeSlider, collectionsRaw, productsRaw] = await Promise.all([
    Slider.findOne({ isActive: true }).lean<ActiveSliderLean>(),
    Collection.find({}).select('_id name description image').lean<CollectionLean>(),
    Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const slides: HomeSlide[] = (activeSlider?.slides ?? [])
    .map((slide) => {
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
    _id: c._id.toString(),
    name: c.name,
    description: c.description,
    image: sanitizeImageUrl(c.image as string) ?? '',
  }));

  const products = productsRaw.map(formatProduct);
  const newArrivals = products.filter((p) => p.isNewArrival);
  const otherProducts = products.filter(
    (p) =>
      p.category &&
      !STANDARD_CATEGORIES.includes(p.category) &&
      p.category.trim() !== ''
  );

  return {
    slider: {
      _id: activeSlider?._id?.toString() ?? null,
      slides,
    },
    collections,
    newArrivals,
    otherProducts,
  };
}
