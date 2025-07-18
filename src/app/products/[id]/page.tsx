'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import axios from 'axios';
// import Image from 'next/image';
import { FaShoppingCart, FaSpinner, FaTruck, FaShieldAlt, FaUndo, FaInstagram } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../lib/cartSlice';
import { RootState } from '../../../lib/store';
import Link from 'next/link';
import Image from 'next/image';

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  images?: string[];
  mainImage?: string;
  stock: number;
  brand: string;
  sizes: string;
  gender: string;
  category: string;
  description?: string;
  isNewArrival?: boolean;
  characteristics?: Array<{key: string, value: string}>;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>(DEFAULT_IMAGE);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'info'>('success');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        const productData = res.data;
        console.log('Product data:', productData); // Debug log
        
        // Handle both old and new image formats
        const availableImages = [
          ...(productData.images || []),
          ...(productData.image ? [productData.image] : [])
        ].filter((img): img is string => Boolean(img) && img.startsWith('/'));

        // Set the product with transformed image data
        const transformedProduct = {
          ...productData,
          images: availableImages.length > 0 ? availableImages : [DEFAULT_IMAGE],
          mainImage: productData.mainImage || availableImages[0] || DEFAULT_IMAGE
        };
        
        setProduct(transformedProduct);
        
        // Set the initial selected image
        const initialImage = transformedProduct.mainImage || availableImages[0] || DEFAULT_IMAGE;
        setSelectedImage(initialImage);
      } catch {
        console.error('Error fetching product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="font-bwseidoround text-sm text-gray-500">Duke ngarkuar produktin...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 text-gray-700 p-6 font-bwseidoround">
          Produkti nuk u gjet
        </div>
      </div>
    );
  }

  // Debug logs
  console.log('Product images:', product.images);
  console.log('Selected image:', selectedImage);

  // Handle sizes - check if product has sizes
  const hasSizes = product.sizes && product.sizes.trim() !== '';
  const sizes = hasSizes ? product.sizes.split(',').map(size => size.trim()).filter(size => size !== '') : [];
  
  const discountPrice = product.originalPrice 
    ? product.originalPrice * (1 - (product.discountPercentage || 0) / 100)
    : product.price;

  // Ensure we have images array and selectedImage is always a string
  const productImages = (product.images || [product.image].filter(Boolean) || [DEFAULT_IMAGE]) as string[];
  const currentImage = selectedImage || product.mainImage || productImages[0] || DEFAULT_IMAGE;

  // Filter out the main image from thumbnails to avoid duplicate display
  const thumbnailImages = productImages.filter(img => img !== currentImage);

  // Fallback handler for broken images
  const handleImageError = (e: any) => {
    e.target.src = '/images/placeholder.jpg';
  };

  // Check if add to cart button should be enabled
  const canAddToCart = product.stock > 0 && (!hasSizes || selectedSize);

  return (
    <div className="min-h-screen bg-white">
      {/* Notification - Positioned at bottom left */}
      {alert && (
        <div className={`fixed bottom-6 left-6 bg-white border px-6 py-3 z-50 animate-slide-in font-bwseidoround max-w-sm ${
          alertType === 'success' 
            ? 'border-green-200 text-green-800' 
            : 'border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 ${
              alertType === 'success' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <span className="text-sm font-medium">{alert}</span>
          </div>
        </div>
      )}

      <div className="mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square w-full max-w-xs sm:max-w-full mx-auto overflow-hidden bg-gray-50">
              <img
                src={currentImage}
                alt={product.title}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                onError={handleImageError}
              />
              {/* Discount Badge */}
              {product.discountPercentage && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 font-bwseidoround font-bold text-xs">
                  -{product.discountPercentage}%
                </div>
              )}
              {/* New Arrivals Badge */}
              {product.isNewArrival && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 font-bwseidoround font-bold text-xs">
                  NEW
                </div>
              )}
            </div>
            {/* Thumbnail Images - horizontal scroll on mobile */}
            {thumbnailImages.length > 0 && (
              <div className="flex gap-2 sm:grid sm:grid-cols-5 sm:gap-3 overflow-x-auto pb-1 hide-scrollbar">
                {thumbnailImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`relative aspect-square w-14 h-14 sm:w-auto sm:h-auto overflow-hidden transition-all duration-300 ${
                      selectedImage === image 
                        ? 'ring-2 ring-gray-900' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Technical Specifications Table - Hidden on mobile, shown below on mobile */}
            {product.characteristics && product.characteristics.length > 0 && (
              <div className="bg-gray-50 p-2 sm:p-4 hidden lg:block">
                <h2 className="font-bwseidoround text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Specifikimet Teknike</h2>
                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <tbody>
                      {product.characteristics.map((char, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}> 
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-bwseidoround font-medium text-xs border-r border-gray-100">{char.key}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 font-bwseidoround font-semibold text-xs">{char.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3 sm:space-y-6">
            {/* Brand & Title */}
            <div className="space-y-2 sm:space-y-4">
              <div className="inline-block">
                <span className="font-bwseidoround font-bold text-xs uppercase tracking-wide bg-gradient-to-r from-[#0a9945] to-gray-800 bg-clip-text text-transparent">
                  {product.brand}
                </span>
              </div>
              <h1 className="font-bwseidoround text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>
            </div>
            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-3 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {product.originalPrice ? (
                    <>
                      <span className="font-bwseidoround text-xl sm:text-3xl font-bold text-gray-900">
                        €{discountPrice.toFixed(2)}
                      </span>
                      <span className="font-bwseidoround text-sm sm:text-lg text-gray-400 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                      <div className="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold">
                        -{product.discountPercentage}%
                      </div>
                    </>
                  ) : (
                    <span className="font-bwseidoround text-xl sm:text-3xl font-bold text-gray-900">
                      €{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {/* Stock Status */}
                {product.stock > 0 && (
                  <div className="flex items-center space-x-2 text-green-600 font-bwseidoround bg-green-50 px-2 sm:px-3 py-1 sm:py-2 mt-1 sm:mt-0">
                    <div className="w-2 h-2 bg-green-500"></div>
                    <span className="font-semibold text-xs sm:text-sm">{product.stock} në stok</span>
                  </div>
                )}
              </div>
            </div>
            {/* Description */}
            {product.description && (
              <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6 border border-gray-100">
                <h2 className="font-bwseidoround text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center">
                  <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-[#0a9945] to-gray-800 mr-2 sm:mr-3"></div>
                  Përshkrimi
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <p className="font-bwseidoround text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm lg:text-base">
                    {showFullDescription 
                      ? product.description 
                      : product.description.length > 250 
                        ? `${product.description.slice(0, 250)}...` 
                        : product.description
                    }
                  </p>
                  {product.description.length > 250 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-[#0a9945] hover:text-gray-800 font-bwseidoround font-semibold text-xs sm:text-sm transition-colors duration-300"
                    >
                      {showFullDescription ? 'Më pak' : 'Më shumë'}
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Size Selection */}
            {hasSizes && sizes.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6 border border-gray-100">
                <h3 className="font-bwseidoround text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center">
                  <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-[#0a9945] to-gray-800 mr-2 sm:mr-3"></div>
                  Zgjidhni Madhësinë
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`font-bwseidoround relative px-2 sm:px-4 py-2 sm:py-3 border-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white border-transparent shadow-lg transform scale-105'
                          : 'border-gray-200 text-gray-700 hover:border-[#0a9945] hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity & Add to Cart */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6 border border-gray-100">
              <div className="space-y-2 sm:space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bwseidoround text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-[#0a9945] to-gray-800 mr-2 sm:mr-3"></div>
                    Sasia
                  </h3>
                  <div className="flex items-center bg-white border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bwseidoround font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 sm:px-6 py-2 sm:py-3 text-gray-900 font-bwseidoround font-semibold min-w-[36px] sm:min-w-[60px] text-center text-base sm:text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bwseidoround font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Add to Cart Button */}
                <button
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 font-bwseidoround cursor-pointer text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg ${
                    canAddToCart
                      ? 'bg-gradient-to-r from-[#0a9945] to-gray-800 text-white hover:from-[#0a8a3d] hover:to-gray-700 hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-pointer'
                  }`}
                  disabled={!canAddToCart}
                  onClick={() => {
                    if (!canAddToCart) return;
                    
                    // Check if product is already in cart
                    const existingItem = cart.find(item => item.id === product._id);
                    
                    if (existingItem) {
                      // Product already exists in cart, show info message and don't add again
                      setAlertType('info');
                      setAlert('Ky produkt është shtuar më herët në shportë dhe ju mund ta rritni sasinë duke shkuar tek shporta');
                      setTimeout(() => {
                        setAlert(null);
                        setAlertType('success');
                      }, 4000);
                      return; // Don't add the product again
                    }
                    
                    // Only add if product is not already in cart
                    dispatch(addToCart({
                      id: product._id,
                      name: product.title,
                      price: discountPrice,
                      originalPrice: product.originalPrice,
                      discountPercentage: product.discountPercentage,
                      image: currentImage,
                      quantity,
                      brand: product.brand,
                      size: selectedSize || 'N/A',
                      category: product.category,
                      gender: product.gender,
                      stock: product.stock,
                      description: product.description,
                    }));
                    
                    // Show success message without opening cart
                    setAlertType('success');
                    const sizeText = selectedSize ? ` (${selectedSize})` : '';
                    setAlert(`Produkti '${product.title}'${sizeText} (sasia: ${quantity}) u shtua me sukses në shportë!`);
                    
                    setTimeout(() => {
                      setAlert(null);
                      setAlertType('success');
                    }, 4000);
                  }}
                >
                  <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>
                    {product.stock === 0
                      ? 'Nga stoku'
                      : !hasSizes
                      ? 'Shto në shportë'
                      : !selectedSize
                      ? 'Zgjidhni madhësinë'
                      : 'Shto në shportë'}
                  </span>
                </button>
              </div>
            </div>
            {/* Technical Specifications Table - Mobile version as stacked rows */}
            {product.characteristics && product.characteristics.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6 border border-gray-100 lg:hidden">
                <h2 className="font-bwseidoround text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center">
                  <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-[#0a9945] to-gray-800 mr-2 sm:mr-3"></div>
                  Specifikimet Teknike
                </h2>
                <dl className="divide-y divide-gray-200">
                  {product.characteristics.map((char, index) => (
                    <div key={index} className="flex justify-between py-2 text-xs sm:text-sm">
                      <dt className="font-bwseidoround text-gray-700 font-medium">{char.key}</dt>
                      <dd className="font-bwseidoround text-gray-900 font-semibold">{char.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-6">
              <div className="bg-gradient-to-br from-gray-50 to-white p-2 sm:p-4 border border-gray-100 flex items-center space-x-2 sm:space-x-3 text-gray-600">
                <div className="p-1 sm:p-2 bg-gradient-to-r from-[#0a9945] to-gray-800">
                  <FaTruck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-bwseidoround text-xs sm:text-sm font-medium">Transport i sigurtë</span>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white p-2 sm:p-4 border border-gray-100 flex items-center space-x-2 sm:space-x-3 text-gray-600">
                <div className="p-1 sm:p-2 bg-gradient-to-r from-[#0a9945] to-gray-800">
                  <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-bwseidoround text-xs sm:text-sm font-medium">Garancion</span>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white p-2 sm:p-4 border border-gray-100 flex items-center space-x-2 sm:space-x-3 text-gray-600">
                <div className="p-1 sm:p-2 bg-gradient-to-r from-[#0a9945] to-gray-800">
                  <FaUndo className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-bwseidoround text-xs sm:text-sm font-medium">Kthim i lehtë</span>
              </div>
            </div>
            {/* Payment Method */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6 border border-gray-100">
                              <h3 className="font-bwseidoround text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center">
                  <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-[#0a9945] to-gray-800 mr-2 sm:mr-3"></div>
                  Mënyra e Pagesës
                </h3>
              <div className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-4 bg-white border border-gray-200 shadow-sm">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-[#0a9945] to-gray-800 flex items-center justify-center">
                  <span className="font-bwseidoround text-white font-bold text-base sm:text-lg">€</span>
                </div>
                <div>
                  <p className="font-bwseidoround text-xs sm:text-base font-semibold text-gray-900">Para në dorë</p>
                  <p className="font-bwseidoround text-xs sm:text-sm text-gray-600">Paguaj kur merr porosinë</p>
                </div>
              </div>
            </div>
            {/* Additional Info */}
            <div className="bg-gray-50 p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <p className="font-bwseidoround text-xs text-gray-700 leading-relaxed">
                    Porosia mund të kthehet brenda 24 orëve
                  </p>
                  <p className="font-bwseidoround text-xs text-red-600 font-medium">
                    *Artikujt me çmime speciale nuk mund të kthehen!
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="font-bwseidoround text-xs text-gray-700">
                    Na kontaktoni në Whatsapp / Viber, në numrin tonë 
                    <span className="font-semibold text-gray-900"> 049 666 678 </span>
                    dhe në rrjetet tona sociale!
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <p className="font-bwseidoround text-xs text-gray-700">
                    Porositë tona realizohen me postën
                  </p>
                  <Image 
                    src="/assets/logo/logposta-removebg-preview.png" 
                    alt="Adidas" 
                    width={64}
                    height={32}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Instagram Social Media Section */}
        <div className="mt-8 sm:mt-16 pt-8 sm:pt-16 border-t border-gray-200">
          <div className="text-center space-y-3 sm:space-y-6">
            <div className="space-y-1 sm:space-y-3">
              <h2 className="font-bwseidoround text-lg sm:text-2xl font-bold text-gray-900">
                Na ndiqni në Instagram
              </h2>
              <p className="font-bwseidoround text-xs sm:text-base text-gray-600 max-w-xs sm:max-w-md mx-auto">
                Për më shumë gjithashtu mund të na shkruani në rrjetin social Instagram
              </p>
            </div>
            <div className="flex justify-center">
              <Link
                href="https://www.instagram.com/runwayboutique_ks/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-8 py-2 sm:py-4 font-bwseidoround font-semibold transition-all duration-300 hover:from-purple-600 hover:to-pink-600 text-base sm:text-lg"
              >
                <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>@runwayboutique_ks</span>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-[2px] max-w-[220px] sm:max-w-[370px] mx-auto bg-[#fafafa] overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="relative aspect-square group">
                  <Image 
                    src={`/assets/logo/insta-${item}.png`}
                    alt={`Instagram post ${item}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <FaInstagram className="text-white text-xl sm:text-3xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 