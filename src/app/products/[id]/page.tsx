'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import axios from 'axios';
import { FaTruck, FaShieldAlt, FaUndo, FaInstagram, FaFacebookF } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../lib/cartSlice';
import { RootState } from '../../../lib/store';
import Image from 'next/image';
import { IMAGE_PLACEHOLDER, optimizeImageUrl, hasDisplayPrice, formatEuroPrice, hasTrackedStock } from '@/app/lib/images';
import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/app/lib/contact';

const DEFAULT_IMAGE = IMAGE_PLACEHOLDER;

interface Product {
  _id: string;
  title: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  images?: string[];
  mainImage?: string;
  stock?: number;
  brand: string;
  sizes: string;
  gender: string;
  category: string;
  description?: string;
  barcode?: string;
  isNewArrival?: boolean;
  characteristics?: Array<{ key: string; value: string }>;
}

function formatTitle(title: string) {
  return title
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'info'>('success');
  const [addedProductPreview, setAddedProductPreview] = useState<{
    title: string;
    image: string;
    size?: string;
    price?: number;
    quantity: number;
  } | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setProduct(null);

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        const productData = res.data;

        const availableImages = [
          ...(productData.images || []),
          ...(productData.image ? [productData.image] : []),
        ].filter(
          (img): img is string =>
            Boolean(img) &&
            (img.startsWith('/') || img.startsWith('http://') || img.startsWith('https://'))
        );

        const uniqueImages = [...new Set(availableImages.length > 0 ? availableImages : [DEFAULT_IMAGE])];

        setProduct({
          ...productData,
          images: uniqueImages,
          mainImage: productData.mainImage || uniqueImages[0] || DEFAULT_IMAGE,
        });
        setMobileIndex(0);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = IMAGE_PLACEHOLDER;
  }, []);

  if (loading) {
    return <PageLoadingSpinner className="min-h-screen" label="Duke ngarkuar produktin" />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 lg:px-10 2xl:px-24 py-16 text-center">
        <p className="font-bwseidoround text-gray-600">Produkti nuk u gjet</p>
      </div>
    );
  }

  const hasSizes = product.sizes && product.sizes.trim() !== '';
  const sizes = hasSizes
    ? product.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const discountPrice =
    product.price && product.originalPrice
      ? product.originalPrice * (1 - (product.discountPercentage || 0) / 100)
      : product.price;

  const productImages = (product.images?.length
    ? product.images
    : [product.mainImage || product.image || DEFAULT_IMAGE].filter(Boolean)) as string[];

  const canAddToCart = !hasSizes || !!selectedSize;

  const handleAddToCart = () => {
    if (!canAddToCart || isAddingToCart) return;

    const existingItem = cart.find((item) => item.id === product._id);
    const nextTotal = (existingItem?.quantity ?? 0) + quantity;

    if (hasTrackedStock(product.stock) && nextTotal > product.stock!) {
      setAddedProductPreview(null);
      setAlertType('info');
      setAlert(`Vetëm ${product.stock} copë në stok.`);
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    const imageForCart = optimizeImageUrl(
      productImages[mobileIndex] || product.mainImage || productImages[0],
      { width: 600, quality: 'auto:good' }
    );

    setIsAddingToCart(true);

    window.setTimeout(() => {
      dispatch(
        addToCart({
          id: product._id,
          name: product.title,
          ...(hasDisplayPrice(discountPrice || product.price)
            ? { price: (discountPrice || product.price)! }
            : {}),
          originalPrice: product.originalPrice,
          discountPercentage: product.discountPercentage,
          image: imageForCart,
          quantity,
          brand: product.brand,
          ...(selectedSize && { size: selectedSize }),
          category: product.category,
          gender: product.gender,
          stock: product.stock,
          description: product.description,
        })
      );

      setAddedProductPreview({
        title: formatTitle(product.title),
        image: imageForCart,
        quantity: nextTotal,
        ...(selectedSize && { size: selectedSize }),
        ...(hasDisplayPrice(discountPrice || product.price)
          ? { price: (discountPrice || product.price)! }
          : {}),
      });
      setAlertType('success');
      setAlert(
        quantity > 1
          ? `${quantity} copë të "${formatTitle(product.title)}" u shtuan në shportë.`
          : `"${formatTitle(product.title)}" u shtua në shportë.`
      );
      setIsAddingToCart(false);

      window.setTimeout(() => {
        setAlert(null);
        setAddedProductPreview(null);
        window.dispatchEvent(
          new CustomEvent('open-cart', {
            detail: { highlightId: product._id },
          })
        );
      }, 2000);
    }, 450);
  };

  const detailsText = product.description?.trim();
  const hasDetails =
    !!detailsText || (product.characteristics && product.characteristics.length > 0);

  return (
    <div className="min-h-screen w-full bg-white">
      {alert && (
        <div className="fixed bottom-6 left-4 z-[10050] pointer-events-none sm:left-8 lg:left-10 2xl:left-24">
          <div
            role="status"
            className={`pointer-events-auto w-full max-w-md animate-fade-in-up rounded-xl border shadow-2xl transition-all sm:max-w-sm ${
              alertType === 'success'
                ? 'border-neutral-200 bg-white'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-start gap-4 p-5">
              {addedProductPreview?.image && alertType === 'success' && (
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
                  <Image
                    src={addedProductPreview.image}
                    alt={addedProductPreview.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    alertType === 'success' ? 'text-[#0a9945]' : 'text-amber-700'
                  }`}
                >
                  {alertType === 'success' ? 'Shtuar në shportë' : 'Informacion'}
                </p>
                <p className="mt-2 text-base font-semibold leading-snug text-neutral-900 sm:text-lg">
                  {alert}
                </p>
                {addedProductPreview?.size && alertType === 'success' && (
                  <p className="mt-1 text-xs uppercase tracking-wider text-neutral-400">
                    {addedProductPreview.size}
                  </p>
                )}
                {alertType === 'success' && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Sasia: {addedProductPreview?.quantity ?? quantity}
                  </p>
                )}
                {addedProductPreview?.price != null && alertType === 'success' && (
                  <p className="mt-2 text-sm font-medium text-neutral-900">
                    {formatEuroPrice(addedProductPreview.price)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full min-w-0 px-4 sm:px-6 lg:px-10 2xl:px-24 py-6 lg:py-10">
        <div className="w-full min-w-0 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          {/* Desktop: scrollable image grid */}
          <div className="hidden min-w-0 lg:block">
            <div className="grid min-w-0 grid-cols-2 gap-1">
              {productImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
                  <Image
                    src={optimizeImageUrl(image, { width: 800, quality: 'auto:good' })}
                    alt={`${product.title} - ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    sizes="(min-width: 1024px) 29vw, 50vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right column: stretches to image column height so sticky works */}
          <div className="min-w-0 lg:relative">
          {/* Mobile: image carousel */}
          <div className="min-w-0 lg:hidden mb-8">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-50">
              <Image
                src={optimizeImageUrl(productImages[mobileIndex], { width: 800, quality: 'auto:good' })}
                alt={product.title}
                fill
                className="object-cover"
                onError={handleImageError}
                priority
                sizes="100vw"
                unoptimized
              />
              {product.discountPercentage ? (
                <span className="absolute left-3 top-3 bg-red-600 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                  -{product.discountPercentage}%
                </span>
              ) : null}
            </div>
            {productImages.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Imazhi ${index + 1}`}
                    onClick={() => setMobileIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      mobileIndex === index ? 'w-6 bg-neutral-900' : 'w-1.5 bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            )}
            {productImages.length > 1 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setMobileIndex(index)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden border ${
                      mobileIndex === index ? 'border-neutral-900' : 'border-neutral-200'
                    }`}
                  >
                    <Image
                      src={optimizeImageUrl(image, { width: 120, quality: 'auto:good' })}
                      alt=""
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sticky product info */}
          <div className="lg:sticky lg:top-28 lg:z-10">
            <div className="min-w-0 space-y-5 lg:space-y-6 lg:px-2">
              <div className="space-y-2">
                <p className="font-bwseidoround text-[11px] uppercase tracking-[0.2em] text-neutral-500 break-words">
                  {product.category || product.brand}
                </p>
                <h1 className="font-bwseidoround text-3xl font-light leading-tight tracking-tight text-neutral-900 break-words sm:text-4xl">
                  {formatTitle(product.title)}
                </h1>
                {product.barcode && (
                  <p className="font-bwseidoround text-xs uppercase tracking-widest text-neutral-400">
                    SKU: #{product.barcode}
                  </p>
                )}
              </div>

              {hasDisplayPrice(product.price) && (
                <div className="flex flex-wrap items-baseline gap-3">
                  {product.originalPrice &&
                  hasDisplayPrice(product.originalPrice) &&
                  product.discountPercentage ? (
                    <>
                      <span className="font-bwseidoround text-xl text-neutral-900">
                        €{discountPrice?.toFixed(2)}
                      </span>
                      <span className="font-bwseidoround text-sm text-neutral-400 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bwseidoround text-xl text-neutral-900">
                      €{product.price!.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              {hasSizes && sizes.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <p className="font-bwseidoround text-[11px] uppercase tracking-[0.15em] text-neutral-900">
                      Madhësia *
                    </p>
                    {!selectedSize && (
                      <p className="mt-1 font-bwseidoround text-xs text-neutral-400">
                        Zgjidhni madhësinë para se të shtoni në shportë.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] border px-4 py-2.5 font-bwseidoround text-xs uppercase tracking-wider transition-colors ${
                          selectedSize === size
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-300 text-neutral-800 hover:border-neutral-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="font-bwseidoround text-[11px] uppercase tracking-[0.15em] text-neutral-900">
                  Sasia
                </span>
                <div className="flex items-center border border-neutral-300">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 font-bwseidoround text-neutral-600 hover:bg-neutral-50"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] px-2 py-2 text-center font-bwseidoround text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const maxQty = hasTrackedStock(product.stock) ? product.stock! : undefined;
                      setQuantity((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1));
                    }}
                    className="px-3 py-2 font-bwseidoround text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    disabled={hasTrackedStock(product.stock) && quantity >= (product.stock ?? 0)}
                  >
                    +
                  </button>
                </div>
              </div>

              {hasDetails && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span className="font-bwseidoround text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                      Detajet
                    </span>
                    <div className="h-px flex-1 bg-neutral-200" />
                  </div>
                  {detailsText && (
                    <p className="font-bwseidoround text-sm leading-relaxed text-neutral-600 whitespace-pre-wrap">
                      {detailsText}
                    </p>
                  )}
                  {product.characteristics && product.characteristics.length > 0 && (
                    <dl className="space-y-2">
                      {product.characteristics.map((char, index) => (
                        <div key={index} className="flex justify-between gap-4 text-sm">
                          <dt className="font-bwseidoround text-neutral-500">{char.key}</dt>
                          <dd className="font-bwseidoround text-right text-neutral-900">{char.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  disabled={!canAddToCart || isAddingToCart}
                  onClick={handleAddToCart}
                  className={`w-full border py-3.5 font-bwseidoround text-sm transition-colors duration-300 ${
                    isAddingToCart
                      ? 'cursor-wait border-neutral-900 bg-white text-neutral-900'
                      : canAddToCart
                        ? 'cursor-pointer border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white'
                        : 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isAddingToCart ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"
                        aria-hidden
                      />
                      Duke u shtuar...
                    </span>
                  ) : (
                    'Shto në shportë'
                  )}
                </button>
                {hasSizes && !selectedSize && (
                  <p className="mt-2 text-center font-bwseidoround text-xs text-neutral-400">
                    Zgjidhni madhësinë para se të shtoni në shportë
                  </p>
                )}
              </div>

              <div className="space-y-4 border-t border-neutral-200 pt-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-neutral-600">
                    <FaTruck className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="font-bwseidoround text-xs sm:text-sm">Transport i sigurtë</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600">
                    <FaShieldAlt className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="font-bwseidoround text-xs sm:text-sm">Garancion</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600">
                    <FaUndo className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="font-bwseidoround text-xs sm:text-sm">Kthim i lehtë</span>
                  </li>
                </ul>

                <div className="space-y-2 border-t border-neutral-200 pt-4">
                  <p className="font-bwseidoround text-[11px] uppercase tracking-[0.15em] text-neutral-900">
                    Mënyra e pagesës
                  </p>
                  <p className="font-bwseidoround text-sm text-neutral-800">Para në dorë</p>
                  <p className="font-bwseidoround text-xs text-neutral-500">Paguaj kur merr porosinë</p>
                </div>

                <div className="space-y-3 border-t border-neutral-200 pt-4">
                  <p className="font-bwseidoround text-xs leading-relaxed text-neutral-600">
                    Porosia mund të kthehet brenda 24 orëve.
                  </p>
                  <p className="font-bwseidoround text-xs leading-relaxed text-neutral-600">
                    Për çdo pyetje apo sqarime shtesë, na kontaktoni në WhatsApp / Viber:{' '}
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
                    >
                      {PHONE_DISPLAY}
                    </a>
                    , ose në{' '}
                    <a
                      href="https://www.instagram.com/kraslight.ks/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
                    >
                      Instagram
                    </a>{' '}
                    dhe{' '}
                    <a
                      href="https://www.facebook.com/kraslight"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
                    >
                      Facebook
                    </a>
                    .
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <a
                      href="https://www.instagram.com/kraslight.ks/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      <FaInstagram className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.facebook.com/kraslight"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      <FaFacebookF className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="font-bwseidoround text-xs text-neutral-600">Porositë tona realizohen me postë.</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
