'use client';

import { useState, useEffect, FormEvent } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaUpload, FaSpinner, FaTrash, FaImage, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '../../../../lib/AuthContext';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  mainImage: string;
  stock: number;
  brand: string;
  category: string;
  description?: string;
  isNewArrival?: boolean;
  characteristics?: Array<{key: string, value: string}>;
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [characteristics, setCharacteristics] = useState<Array<{key: string, value: string}>>([{key: '', value: ''}]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`/api/products/${id}`);
          const productData = res.data;
          console.log('Fetched product data:', productData); // Debug log
          
          setTitle(productData.title);
          setPrice(productData.originalPrice?.toString() || productData.price.toString());
          setDiscountPercentage(productData.discountPercentage && productData.discountPercentage > 0 ? productData.discountPercentage.toString() : '');
          setStock(productData.stock.toString());
          setBrand(productData.brand || '');
          setCategory(
            [
              'Ndriçim i brendshëm',
              'Ndriçim i jashtëm',
              'Materiale ELEKTRIKE',
            ].includes(productData.category)
              ? productData.category
              : 'Other'
          );
          setCustomCategory(
            [
              'Ndriçim i brendshëm',
              'Ndriçim i jashtëm',
              'Materiale ELEKTRIKE',
            ].includes(productData.category)
              ? ''
              : productData.category || ''
          );
          setDescription(productData.description || '');
          setIsNewArrival(productData.isNewArrival || false);
          setCharacteristics(productData.characteristics && productData.characteristics.length > 0 ? productData.characteristics : [{key: '', value: ''}]);
          setProduct(productData);
          
          // Handle images
          const availableImages = [
            ...(productData.images || []),
            ...(productData.image ? [productData.image] : [])
          ].filter(Boolean);
          
          setPreviewUrls(availableImages);
          const mainImageIndex = availableImages.indexOf(productData.mainImage || availableImages[0]);
          setMainImageIndex(mainImageIndex >= 0 ? mainImageIndex : 0);
        } catch (err) {
          console.error('Error fetching product:', err);
          setMessage({ text: '❌ Gabim gjatë marrjes së të dhënave të produktit', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isAuthenticated]);

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  const setMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('discountPercentage', discountPercentage);
    formData.append('stock', stock);
    formData.append('brand', brand);
    formData.append('category', category === 'Other' ? customCategory : category || 'Other');
    formData.append('description', description);
    formData.append('isNewArrival', isNewArrival.toString());
    
    // Append characteristics
    const filteredCharacteristics = characteristics.filter(char => char.key.trim() !== '' && char.value.trim() !== '');
    formData.append('characteristics', JSON.stringify(filteredCharacteristics));
    
    formData.append('mainImageIndex', mainImageIndex.toString());

    // Append existing images that weren't removed
    const existingImages = product?.images || [];
    existingImages.forEach((image, index) => {
      if (previewUrls.includes(image)) {
        formData.append('existingImages', image);
      }
    });

    // Append new images
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await axios.put(`/api/products/${id}`, formData);
      if (res.status === 200) {
        setMessage({ text: '✅ Produkti u përditësua me sukses!', type: 'success' });
        setTimeout(() => {
          router.push('/admin/products/list');
        }, 1500);
      } else {
        setMessage({ text: '❌ Dështoi përditësimi i produktit', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: '❌ Gabim gjatë përditësimit', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        Produkti nuk u gjet
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-2">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editoni Produktin</h1>
          <p className="text-gray-500 mt-2">Përditësoni të dhënat e produktit tuaj këtu.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titulli i Produktit
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Shkruani titullin e produktit"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brendi
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Shkruani brendin e produktit"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategoria e Produktit
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Zgjidh kategorinë</option>
                <option value="Ndriçim i brendshëm">Ndriçim i brendshëm</option>
                <option value="Ndriçim i jashtëm">Ndriçim i jashtëm</option>
                <option value="Materiale ELEKTRIKE">Materiale ELEKTRIKE</option>
                <option value="Other">Tjetër...</option>
              </select>
              {category === 'Other' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Shkruani kategorinë e produktit"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stoku
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
          </div>
          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Çmimi Origjinal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-lg">€</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Përqindja e Zbritjes (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
                <span className="absolute right-3 top-3 text-gray-500 text-lg">%</span>
              </div>
              {discountPercentage && (
                <p className="mt-1 text-sm text-gray-500">
                  Çmimi i ri: €{((parseFloat(price) || 0) * (1 - (parseFloat(discountPercentage) || 0) / 100)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          {/* Description Section */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Përshkrimi
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Shkruani përshkrimin e produktit..."
            />
          </div>
          {/* Characteristics Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Karakteristika <span className="text-gray-500 font-normal">(Opsionale)</span>
            </label>
            <div className="space-y-4">
              {characteristics.map((characteristic, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={characteristic.key}
                    onChange={(e) => {
                      const newCharacteristics = [...characteristics];
                      newCharacteristics[index] = { ...newCharacteristics[index], key: e.target.value };
                      setCharacteristics(newCharacteristics);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Karakteristika (p.sh. Ngjyra)"
                  />
                  <span className="text-gray-500 font-semibold">:</span>
                  <input
                    type="text"
                    value={characteristic.value}
                    onChange={(e) => {
                      const newCharacteristics = [...characteristics];
                      newCharacteristics[index] = { ...newCharacteristics[index], value: e.target.value };
                      setCharacteristics(newCharacteristics);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Vlera (p.sh. E bardhë)"
                  />
                  {characteristics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newCharacteristics = characteristics.filter((_, i) => i !== index);
                        setCharacteristics(newCharacteristics);
                      }}
                      className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCharacteristics([...characteristics, {key: '', value: ''}])}
                className="flex items-center space-x-2 px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Shto Karakteristikë</span>
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Shtoni karakteristikat e produktit të ndriçimit (p.sh. Ngjyra: E bardhë, Fuqia: 60W, etj.)
            </p>
          </div>
          {/* New Arrival Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isNewArrival"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="w-4 h-4 text-blue-600 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isNewArrival" className="text-sm font-medium text-gray-700">
              Produkt i Ri (New Arrival)
            </label>
          </div>
          {/* Images Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imazhet
            </label>
            {previewUrls.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Imazhet e Ngarkuara ({previewUrls.length})</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={url + '-' + index} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-blue-500 transition-colors">
                        {imageErrors[url] ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <FaImage className="w-6 h-6" />
                          </div>
                        ) : (
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
                            className="object-contain"
                            onError={() => setImageErrors(prev => ({ ...prev, [url]: true }))}
                          />
                        )}
                        <div className="absolute top-1 right-1">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 text-white bg-red-500 rounded-full hover:bg-red-600 shadow"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {index === mainImageIndex && (
                        <div className="mt-1 text-[10px] text-center font-medium bg-blue-100 text-blue-800 py-0.5 px-1 rounded-full">
                          Imazhi Kryesor
                        </div>
                      )}
                      {index !== mainImageIndex && (
                        <button
                          type="button"
                          onClick={() => setMainImage(index)}
                          className="mt-1 w-full text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Bëj Kryesor
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="w-full min-h-[80px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors bg-gray-50 px-2 py-4">
              <div className="flex items-center space-x-2">
                <FaUpload className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Ngarko Imazhe</span>
                <span className="text-xs text-gray-400">(JPG, PNG, WebP)</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
                multiple
              />
            </label>
            <div className="text-[10px] text-gray-400 mt-1 ml-1">Imazhi i parë do të jetë kryesor</div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center"><FaSpinner className="animate-spin mr-2" /> Duke ruajtur...</span>
              ) : (
                'Ruaj Ndryshimet'
              )}
            </button>
          </div>
          {message.text && (
            <div className={`mt-4 text-center p-3 rounded-lg font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 