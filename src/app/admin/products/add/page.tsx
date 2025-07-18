'use client';

import { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaSpinner, FaTrash, FaImage, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function AddProduct() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [characteristics, setCharacteristics] = useState<Array<{key: string, value: string}>>([{key: '', value: ''}]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState('');

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  // Cleanup preview URLs when component unmounts or when images are removed
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      if (brandLogoPreview && brandLogoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(brandLogoPreview);
      }
    };
  }, [previewUrls, brandLogoPreview]);

  // Auto-close modal after 1500ms
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 1500);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file types
      const validFiles = files.filter(file => {
        const isValid = file.type.startsWith('image/');
        if (!isValid) {
          setMessage({ 
            text: `File ${file.name} is not a valid image`, 
            type: 'error' 
          });
        }
        return isValid;
      });

      if (validFiles.length === 0) return;

      // Create preview URLs for valid files
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      
      // Update state
      setImageFiles(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      setMessage({ text: '', type: '' });
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    const urlToRemove = previewUrls[index];
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
    }
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: `File ${file.name} is not a valid image`, type: 'error' });
        return;
      }
      setBrandLogoFile(file);
      const url = URL.createObjectURL(file);
      setBrandLogoPreview(url);
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    if (imageFiles.length === 0) {
      setMessage({ text: 'Ju lutem zgjidhni të paktën një imazh', type: 'error' });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('brand', brand || 'Other');
    formData.append('category', category === 'Other' ? customCategory : category || 'Other');
    formData.append('description', description);
    formData.append('isNewArrival', isNewArrival.toString());
    formData.append('subcategory', subcategory);
    
    // Append characteristics
    const filteredCharacteristics = characteristics.filter(char => char.key.trim() !== '' && char.value.trim() !== '');
    formData.append('characteristics', JSON.stringify(filteredCharacteristics));
    
    // Append all image files
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    // Append brand logo file if present
    if (brandLogoFile) {
      formData.append('brandLogo', brandLogoFile);
    }

    try {
      const res = await axios.post('/api/upload-product', formData);
      if (res.status === 200 && res.data.success) {
        setMessage({ text: '✅ Produkti u shtua me sukses!', type: 'success' });
        // Clear form
        setTitle('');
        setPrice('');
        setStock('0');
        setBrand('');
        setCategory('');
        setCustomCategory(''); // Clear custom category
        setDescription('');
        setIsNewArrival(false);
        setCharacteristics([{key: '', value: ''}]);
        setImageFiles([]);
        setPreviewUrls([]);
        setBrandLogoFile(null);
        setBrandLogoPreview(null);
        setSubcategory('');
      } else {
        setMessage({ text: '❌ Dështoi shtimi i produktit', type: 'error' });
      }
    } catch (err: unknown) {
      console.error('Product upload error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : '❌ Gabim gjatë ngarkimit';
      setMessage({ text: errorMessage || '❌ Gabim gjatë ngarkimit', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full mx-auto pt-14 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Shto Produkt të Ri</h1>
          </div>
          <p className="text-gray-600 text-lg">Shto produkte ndriçimi dhe elektrike në inventarin tuaj</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titulli i Produktit *
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
              {/* Brand Logo Upload */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Logo e Brendit (opsionale)</label>
                <div className="flex items-center space-x-4">
                  {brandLogoPreview && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                      <Image
                        src={brandLogoPreview}
                        alt="Brand Logo Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <label className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-xs">
                    <FaUpload className="mr-1" />
                    <span>Zgjidh Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandLogoChange}
                      className="sr-only"
                    />
                  </label>
                  {brandLogoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        if (brandLogoPreview.startsWith('blob:')) {
                          URL.revokeObjectURL(brandLogoPreview);
                        }
                        setBrandLogoFile(null);
                        setBrandLogoPreview(null);
                      }}
                      className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">Ngarko logon e brendit nëse dëshiron ta shfaqësh me produktin.</p>
              </div>
            </div>
          </div>

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
              <option value="Materiale Elektrike">Materiale Elektrike</option>
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
              Nënkategoria e Produktit
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="P.sh.: Llambadar, Spot, Panel, Kabllo, Prizë, etj."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Çmimi *
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
                Sasia në Stok *
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

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Përshkrimi i Produktit
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Përshkruani veçoritë, specifikimet dhe përfitimet e produktit..."
            />
          </div>

          {/* Product Specifications */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Specifikimet e Produktit <span className="text-gray-500 font-normal">(Opsionale)</span>
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
                    placeholder="Specifikimi (p.sh., Fuqia, Temperatura e Ngjyrës)"
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
                    placeholder="Vlera (p.sh., 60W, 3000K)"
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
                <span>Shto Specifikim</span>
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Shtoni specifikimet e produktit si Fuqia (W), Temperatura e Ngjyrës (K), Tensioni (V), etj.
            </p>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="isNewArrival"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="w-5 h-5 text-blue-600 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isNewArrival" className="text-sm font-semibold text-gray-700">
              Shëno si Produkt i Ri
            </label>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imazhet e Produktit *
            </label>
            {/* Image Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Imazhet e Ngarkuara ({previewUrls.length})</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative group">
                      <div className="aspect-square relative rounded-md overflow-hidden bg-white border border-gray-200 hover:border-blue-500 transition-colors">
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
                            onError={() => {
                              setImageErrors(prev => ({ ...prev, [url]: true }));
                            }}
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
                      {index === 0 && (
                        <div className="mt-1 text-[10px] text-center font-medium bg-blue-100 text-blue-800 py-0.5 px-1 rounded-full">
                          Imazhi Kryesor
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Upload Button */}
            <label className="w-full min-h-[80px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors bg-gray-50 px-2 py-4">
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
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Duke u Shtuar Produkti...
              </>
            ) : (
              <>
                <FaPlus className="mr-2 h-5 w-5" />
                Shto Produktin
              </>
            )}
          </button>

          {/* Modal-style Message Display */}
        </form>
        {message.text && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`relative w-full max-w-xs sm:max-w-sm mx-auto p-6 rounded-xl shadow-2xl border text-center pointer-events-auto ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <button
                className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => setMessage({ text: '', type: '' })}
                aria-label="Mbyll Mesazhin"
              >
                ×
              </button>
              <div className="py-2 px-2">
                {message.text}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 