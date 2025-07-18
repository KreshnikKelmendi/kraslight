"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  stock: number;
  brand: string;
  sizes: string;
  gender: string;
  category: string;
  isNewArrival?: boolean;
}

interface TotalLook {
  _id: string;
  name: string;
  image: string;
  products: Product[];
  description?: string;
}

interface BrandGroup {
  brand: string;
  products: Product[];
}

export default function TotalLookAdminPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [looks, setLooks] = useState<TotalLook[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showForm, setShowForm] = useState(false);
  const [editingLook, setEditingLook] = useState<TotalLook | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLooks();
      fetchProducts();
    }
  }, [isAuthenticated]);

  const startEditing = (look: TotalLook) => {
    setEditingLook(look);
    setName(look.name);
    setDescription(look.description || "");
    setSelectedProducts(look.products.map(p => p._id));
    setImagePreview(look.image || "");
    setIsEditing(true);
    setShowForm(true);
  };

  const cancelEditing = () => {
    setEditingLook(null);
    setIsEditing(false);
    setName("");
    setDescription("");
    setSelectedProducts([]);
    setImage(null);
    setImagePreview("");
    setShowForm(false);
  };

  const productsByBrand: BrandGroup[] = products.reduce((acc, product) => {
    const existingBrand = acc.find(group => group.brand === product.brand);
    if (existingBrand) {
      existingBrand.products.push(product);
    } else {
      acc.push({ brand: product.brand, products: [product] });
    }
    return acc;
  }, [] as BrandGroup[]);

  async function fetchLooks() {
    const res = await fetch("/api/total-look");
    const data = await res.json();
    setLooks(data);
  }

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  const showSuccessAlert = (message: string) => {
    setAlertMessage(message);
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const showErrorAlert = (message: string) => {
    setAlertMessage(message);
    setAlertType("error");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url || uploadData.path || uploadData.image || "";
        if (imageUrl && !imageUrl.startsWith("/uploads/")) {
          imageUrl = "/uploads/" + imageUrl.replace(/^.*[\\/]/, "");
        }
      }
      const requestBody = {
        name,
        description,
        image: imageUrl || (editingLook ? editingLook.image : ""),
        products: selectedProducts,
      };

      const url = isEditing ? `/api/total-look/${editingLook?._id}` : "/api/total-look";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        showSuccessAlert(isEditing ? "✅ ShopLook u përditësua me sukses!" : "✅ ShopLook u shtua me sukses!");
        setName("");
        setDescription("");
        setImage(null);
        setImagePreview("");
        setSelectedProducts([]);
        setEditingLook(null);
        setIsEditing(false);
        setShowForm(false);
        await fetchLooks();
      } else {
        showErrorAlert(isEditing ? "❌ Gabim gjatë përditësimit të ShopLook!" : "❌ Gabim gjatë shtimit të ShopLook!");
      }
    } catch (error) {
      showErrorAlert(isEditing ? "❌ Gabim gjatë përditësimit të ShopLook!" : "❌ Gabim gjatë shtimit të ShopLook!");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAllBrand = (brand: string, select: boolean) => {
    const brandProducts = productsByBrand.find(bg => bg.brand === brand)?.products || [];
    const brandProductIds = brandProducts.map(p => p._id);
    if (select) {
      setSelectedProducts(prev => [...new Set([...prev, ...brandProductIds])]);
    } else {
      setSelectedProducts(prev => prev.filter(id => !brandProductIds.includes(id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {showAlert && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl transform transition-all duration-300 ${
          alertType === "success" 
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white" 
            : "bg-gradient-to-r from-red-500 to-red-600 text-white"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">{alertType === "success" ? "✅" : "❌"}</span>
            <span className="font-medium">{alertMessage}</span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ShopLook</h1>
              <p className="mt-2 text-gray-600">Menaxho ShopLook (Total Look) të produkteve</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-black hover:bg-gray-800 text-white p-3 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
                title={showForm ? "Mbyll" : "Shto ShopLook"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Add ShopLook Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? "Përditëso ShopLook" : "Shto ShopLook të Ri"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri i ShopLook *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Shkruaj emrin e ShopLook..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imazhi i ShopLook *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setImage(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setImagePreview(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setImagePreview("");
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  {/* Image Preview */}
                  {(imagePreview || (editingLook && editingLook.image)) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pamja e Imazhit:
                      </label>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <Image
                          src={imagePreview || (editingLook?.image || "")}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Përshkrimi
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                  placeholder="Përshkrimi i ShopLook..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Zgjidh Produktet ({selectedProducts.length} të zgjedhura)
                </label>
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {productsByBrand.map((brandGroup) => (
                    <div key={brandGroup.brand} className="border-b border-gray-200 last:border-b-0">
                      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {brandGroup.brand}
                          </h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAllBrand(brandGroup.brand, true)}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                              Zgjidh të Gjitha
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectAllBrand(brandGroup.brand, false)}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                            >
                              Hiq të Gjitha
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {brandGroup.products.map(product => (
                            <label key={product._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product._id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedProducts([...selectedProducts, product._id]);
                                  } else {
                                    setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">{product.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditing ? "Duke përditësuar..." : "Duke shtuar..."}
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      {isEditing ? "Përditëso ShopLook" : "Shto ShopLook"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={isEditing ? cancelEditing : () => setShowForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {isEditing ? "Anulo Përditësimin" : "Anulo"}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* ShopLook Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {looks.map(look => (
            <div key={look._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="relative w-full h-48">
                  {look.image ? (
                    <Image 
                      src={look.image} 
                      alt={look.name} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Nuk ka imazh</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm('A je i sigurt që do ta fshish këtë ShopLook?')) {
                      try {
                        const response = await fetch(`/api/total-look`, {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: look._id }),
                        });
                        if (response.ok) {
                          showSuccessAlert("✅ ShopLook u fshi me sukses!");
                          await fetchLooks();
                        } else {
                          showErrorAlert("❌ Gabim gjatë fshirjes së ShopLook!");
                        }
                      } catch (error) {
                        showErrorAlert("❌ Gabim gjatë fshirjes së ShopLook!");
                      }
                    }
                  }}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                  title="Fshi ShopLook"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => startEditing(look)}
                  className="absolute top-3 right-12 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                  title="Përditëso ShopLook"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{look.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {look.products.length} produkte
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Produktet:</h4>
                  <div className="flex flex-wrap gap-2">
                    {look.products.length === 0 && (
                      <span className="text-gray-400 text-xs">Nuk ka produkte</span>
                    )}
                    {look.products.map(product => (
                      <a
                        key={product._id}
                        href={`/admin/products/edit/${product._id}`}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {product.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {looks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka ShopLook</h3>
            <p className="text-gray-600 mb-6">Krijo ShopLook-un tënd të parë për të filluar</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Shto ShopLook të Parë
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 