'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../lib/AuthContext';
import { FaLink, FaLayerGroup, FaTags, FaSave, FaEdit, FaCheck } from 'react-icons/fa';

interface Slide {
  image: string;
  title: string;
  description: string;
  link: string;
}

interface Slider {
  _id: string;
  slides: Slide[];
}

export default function SliderAdmin() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [slider, setSlider] = useState<Slider | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<{ _id: string; name: string }[]>([]);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<number | null>(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  // Fetch current slider
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const sliderRes = await fetch('/api/sliders');
          if (sliderRes.ok) {
            const sliderData = await sliderRes.json();
            setSlider(sliderData);
            setSlides(sliderData.slides || []);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetch collections for the dropdown
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collections');
        const data = await res.json();
        setCollections(data.map((c: any) => ({ _id: c._id, name: c.name })));
      } catch (err) {
        // ignore error
      }
    };
    fetchCollections();

    // Fetch products to extract unique categories and brands
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const uniqueCategories = Array.from(new Set(data.map((p: any) => p.category).filter((c: unknown): c is string => typeof c === 'string' && !!c)));
        const uniqueBrands = Array.from(new Set(data.map((p: any) => p.brand).filter((b: unknown): b is string => typeof b === 'string' && !!b)));
        setCategories(uniqueCategories as string[]);
        setBrands(uniqueBrands as string[]);
      } catch (err) {
        // ignore error
      }
    };
    fetchProducts();
  }, []);

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'slider');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      const newSlides = [...slides];
      newSlides[index] = {
        ...newSlides[index],
        image: data.path
      };
      setSlides(newSlides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = {
      ...newSlides[index],
      [field]: value
    };
    setSlides(newSlides);
  };

  const addSlide = () => {
    setSlides([{ image: '', title: '', description: '', link: '' }, ...slides]);
    setEditIndex(0);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate form
      if (slides.length === 0) {
        throw new Error('At least one slide is required');
      }

      for (const slide of slides) {
        if (!slide.image) {
          throw new Error('Each slide must have an image');
        }
      }

      // Submit slider
      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save slider');
      }

      router.refresh();
      alert('Slider saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save slider');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Menaxho Slider</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-1">
                  Slides
                </label>
                <p className="text-gray-500 text-sm">Add, edit, or remove slides for your homepage slider. Only the image is required.</p>
              </div>
              <button
                type="button"
                onClick={addSlide}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg font-semibold shadow hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span> Add Slide
              </button>
            </div>

            <div className="space-y-8">
              {slides.map((slide, index) => {
                const isEditing = editIndex === index;
                return (
                  <div key={index} className="p-8 bg-white border border-gray-200 rounded-2xl shadow-lg transition-shadow hover:shadow-2xl relative mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Slide {index + 1}</h3>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <button
                            type="button"
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all text-base"
                            onClick={async () => {
                              setError(null);
                              try {
                                if (!slide.image) throw new Error('Image is required');
                                const updatedSlides = [...slides];
                                updatedSlides[index] = slide;
                                const response = await fetch('/api/sliders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ slides: updatedSlides }),
                                });
                                if (!response.ok) {
                                  const data = await response.json();
                                  throw new Error(data.error || 'Failed to save slider');
                                }
                                setEditIndex(null);
                                router.refresh();
                                alert('Slide saved successfully!');
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save slide');
                              }
                            }}
                          >
                            <FaCheck className="w-4 h-4" /> Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all text-base"
                            onClick={() => setEditIndex(index)}
                          >
                            <FaEdit className="w-4 h-4" /> Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSlide(index)}
                          className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-all text-base"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">
                          Image <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={isEditing ? (e) => handleImageUpload(e, index) : undefined}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:bg-gray-100"
                          disabled={!isEditing}
                        />
                        {slide.image && (
                          <div className="mt-4 relative h-48 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                            <Image
                              src={slide.image}
                              alt={slide.title || `Slide ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-base font-semibold text-gray-800 mb-1">
                            Title <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={isEditing ? (e) => updateSlide(index, 'title', e.target.value) : undefined}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:bg-gray-100 text-lg"
                            placeholder="Enter slide title (optional)"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-800 mb-1">
                            Description <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <textarea
                            value={slide.description}
                            onChange={isEditing ? (e) => updateSlide(index, 'description', e.target.value) : undefined}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:bg-gray-100 text-lg"
                            rows={2}
                            placeholder="Enter slide description (optional)"
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-800 mb-1">
                            Button/Link <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={slide.link}
                            onChange={isEditing ? (e) => updateSlide(index, 'link', e.target.value) : undefined}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:bg-gray-100 text-lg"
                            placeholder="e.g. /blog, /shop, or leave empty"
                            disabled={!isEditing}
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              className={`px-4 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors text-sm font-medium ${showCategoryDropdown === index ? 'ring-2 ring-gray-300' : ''}`}
                              onClick={isEditing ? () => {
                                setShowCategoryDropdown(showCategoryDropdown === index ? null : index);
                                setShowCollectionDropdown(null);
                                setShowBrandDropdown(null);
                              } : undefined}
                              disabled={!isEditing}
                            >
                              Category
                            </button>
                            <button
                              type="button"
                              className={`px-4 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors text-sm font-medium ${showBrandDropdown === index ? 'ring-2 ring-gray-300' : ''}`}
                              onClick={isEditing ? () => {
                                setShowBrandDropdown(showBrandDropdown === index ? null : index);
                                setShowCollectionDropdown(null);
                                setShowCategoryDropdown(null);
                              } : undefined}
                              disabled={!isEditing}
                            >
                              Brand
                            </button>
                          </div>
                          <div className="relative z-20">
                            {showCategoryDropdown === index && (
                              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-y-auto divide-y divide-gray-100">
                                <button
                                  type="button"
                                  className="block w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-900 text-base font-semibold"
                                  onClick={() => {
                                    updateSlide(index, 'link', '/shop/new-arrivals');
                                    setShowCategoryDropdown(null);
                                  }}
                                >
                                  New Arrivals
                                </button>
                                <button
                                  type="button"
                                  className="block w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-900 text-base font-semibold"
                                  onClick={() => {
                                    updateSlide(index, 'link', '/collections/685ffbb0bf9f854bf7948a02');
                                    setShowCategoryDropdown(null);
                                  }}
                                >
                                  Ndriqim i Brendshem
                                </button>
                                <button
                                  type="button"
                                  className="block w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-900 text-base font-semibold"
                                  onClick={() => {
                                    updateSlide(index, 'link', '/collections/685ffbb0bf9f854bf7948a02');
                                    setShowCategoryDropdown(null);
                                  }}
                                >
                                  Ndriqim i Jashtem
                                </button>
                                <button
                                  type="button"
                                  className="block w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-900 text-base font-semibold"
                                  onClick={() => {
                                    updateSlide(index, 'link', '/collections/materiale-elektrike');
                                    setShowCategoryDropdown(null);
                                  }}
                                >
                                  Materiale Elektrike
                                </button>
                                {categories.map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    className="block w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 text-base"
                                    onClick={() => {
                                      updateSlide(index, 'link', `/collections/category/${encodeURIComponent(cat)}`);
                                      setShowCategoryDropdown(null);
                                    }}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            )}
                            {showBrandDropdown === index && brands.length > 0 && (
                              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-y-auto divide-y divide-gray-100">
                                {brands.map((brand) => (
                                  <button
                                    key={brand}
                                    type="button"
                                    className="block w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-900 text-base font-semibold"
                                    onClick={() => {
                                      updateSlide(index, 'link', `/shop/brand/${encodeURIComponent(brand)}`);
                                      setShowBrandDropdown(null);
                                    }}
                                  >
                                    {brand}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white rounded-2xl font-extrabold shadow-xl hover:from-gray-800 hover:to-gray-900 transition-all text-xl tracking-wide border-2 border-gray-900 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              <FaSave className="w-6 h-6" />
              Save Slider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 