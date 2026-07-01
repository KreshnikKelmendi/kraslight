'use client';

import { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaSpinner, FaTrash, FaImage, FaPlus, FaMinus, FaCheck, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import CollectionSelect from '@/app/components/admin/CollectionSelect';
import UploadCompressionInfo from '@/app/components/admin/UploadCompressionInfo';
import { formatFileSize, type CompressionStats } from '@/app/lib/images';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ open, onClose, onSuccess }: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [characteristics, setCharacteristics] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);
  const [subcategory, setSubcategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileSizes, setFileSizes] = useState<number[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [uploadCompression, setUploadCompression] = useState<CompressionStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, isLoading, onClose]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      if (brandLogoPreview?.startsWith('blob:')) URL.revokeObjectURL(brandLogoPreview);
    };
  }, [previewUrls, brandLogoPreview]);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setStock('');
    setBrand('');
    setCollectionId('');
    setCategory('');
    setDescription('');
    setCharacteristics([{ key: '', value: '' }]);
    setSubcategory('');
    setBarcode('');
    setImageFiles([]);
    setPreviewUrls([]);
    setFileSizes([]);
    setImageErrors({});
    setBrandLogoFile(null);
    setBrandLogoPreview(null);
    setUploadCompression([]);
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!validFiles.length) return;
    setImageFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
    setFileSizes((prev) => [...prev, ...validFiles.map((f) => f.size)]);
    setError('');
  };

  const removeImage = (index: number) => {
    const url = previewUrls[index];
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFileSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    setBrandLogoFile(file);
    setBrandLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!imageFiles.length) {
      setError('Ju lutem zgjidhni të paktën një imazh');
      return;
    }
    if (!collectionId || !category) {
      setError('Ju lutem zgjidhni një koleksion');
      return;
    }

    const filteredCharacteristics = characteristics.filter(
      (c) => c.key.trim() && c.value.trim()
    );
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('stock', stock.trim());
    formData.append('brand', brand || 'Other');
    formData.append('category', category);
    formData.append('description', description);
    formData.append('subcategory', subcategory);
    formData.append('barcode', barcode);
    formData.append('characteristics', JSON.stringify(filteredCharacteristics));
    imageFiles.forEach((file) => formData.append('images', file));
    if (brandLogoFile) formData.append('brandLogo', brandLogoFile);

    setIsLoading(true);
    try {
      const res = await axios.post('/api/upload-product', formData);
      if (res.data?.success) {
        setUploadCompression(res.data.compression ?? []);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
          onSuccess();
          onClose();
        }, 2800);
      } else {
        setError('Dështoi shtimi i produktit');
      }
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gabim gjatë ngarkimit';
      setError(msg || 'Gabim gjatë ngarkimit');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isLoading && !showSuccess && onClose()} />
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
              <FaCheck className="text-emerald-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Produkti u shtua!</h3>
            <p className="text-gray-500 mb-4">Imazhet u kompresuan dhe u ruajtën.</p>
            {uploadCompression.length > 0 && (
              <UploadCompressionInfo stats={uploadCompression} className="w-full max-w-md text-left" />
            )}
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-2 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Shto Produkt të Ri</h2>
                <p className="text-sm text-gray-600">Shto produkte ndriçimi dhe elektrike</p>
              </div>
              <button type="button" onClick={onClose} disabled={isLoading} className="p-2 rounded-lg hover:bg-white/80">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Titulli i Produktit *</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Shkruani titullin e produktit" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brendi</label>
                  <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} placeholder="Shkruani brendin e produktit" />
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Logo e Brendit (opsionale)</label>
                    <div className="flex items-center space-x-4">
                      {brandLogoPreview && (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                          <Image src={brandLogoPreview} alt="Logo" fill className="object-contain" />
                        </div>
                      )}
                      <label className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 border border-blue-200 text-xs">
                        <FaUpload className="mr-1" />
                        Zgjidh Logo
                        <input type="file" accept="image/*" onChange={handleBrandLogoChange} className="sr-only" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <CollectionSelect
                value={collectionId}
                onChange={(id, cat) => {
                  setCollectionId(id);
                  setCategory(cat);
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nënkategoria</label>
                  <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={inputClass} placeholder="P.sh.: Llambadar, Spot..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Barkodi <span className="text-gray-500 font-normal">(Opsionale)</span></label>
                  <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className={inputClass} placeholder="Barkodi" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Çmimi <span className="text-gray-500 font-normal">(Opsionale)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-lg">€</span>
                    <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} pl-8`} placeholder="Lëreni bosh" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sasia në Stok <span className="text-gray-500 font-normal">(Opsionale)</span></label>
                  <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} placeholder="Lëreni bosh" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Përshkrimi</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} placeholder="Përshkruani produktin..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Specifikimet <span className="text-gray-500 font-normal">(Opsionale)</span></label>
                <div className="space-y-3">
                  {characteristics.map((char, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input value={char.key} onChange={(e) => { const n = [...characteristics]; n[index] = { ...n[index], key: e.target.value }; setCharacteristics(n); }} className={`flex-1 ${inputClass}`} placeholder="Specifikimi" />
                      <span className="text-gray-500">:</span>
                      <input value={char.value} onChange={(e) => { const n = [...characteristics]; n[index] = { ...n[index], value: e.target.value }; setCharacteristics(n); }} className={`flex-1 ${inputClass}`} placeholder="Vlera" />
                      {characteristics.length > 1 && (
                        <button type="button" onClick={() => setCharacteristics(characteristics.filter((_, i) => i !== index))} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                          <FaMinus />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setCharacteristics([...characteristics, { key: '', value: '' }])} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm">
                    <FaPlus /> Shto Specifikim
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imazhet e Produktit *</label>
                {previewUrls.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 md:grid-cols-6 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative">
                        <div className="aspect-square relative rounded-md overflow-hidden bg-gray-50 border border-gray-200 hover:border-blue-500">
                          {imageErrors[url] ? (
                            <div className="w-full h-full flex items-center justify-center"><FaImage className="text-gray-400" /></div>
                          ) : (
                            <Image src={url} alt="" fill className="object-contain" onError={() => setImageErrors((p) => ({ ...p, [url]: true }))} />
                          )}
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                        {fileSizes[index] !== undefined && (
                          <p className="mt-1 text-[10px] text-center text-gray-500">{formatFileSize(fileSizes[index])} (para ngarkimit)</p>
                        )}
                        {index === 0 && <p className="mt-1 text-[10px] text-center bg-blue-100 text-blue-800 rounded-full py-0.5">Kryesor</p>}
                      </div>
                    ))}
                  </div>
                )}
                <label className="w-full min-h-[80px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FaUpload className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Ngarko Imazhe</span>
                  </div>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} />
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70"
              >
                {isLoading ? <><FaSpinner className="animate-spin" /> Duke u shtuar...</> : <><FaPlus /> Shto Produktin</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
