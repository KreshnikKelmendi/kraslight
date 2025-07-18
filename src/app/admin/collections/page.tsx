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

interface Collection {
  _id: string;
  name: string;
  description?: string;
  image: string;
  categories: string[];
  products: Product[];
}

interface CategoryGroup {
  category: string;
  productCount: number;
  products: Product[];
}

export default function CollectionsAdminPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showForm, setShowForm] = useState(false);
  
  // Edit state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editSelectedCategories, setEditSelectedCategories] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
      fetchProducts();
    }
  }, [isAuthenticated]);

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Group products by category
  const productsByCategory: CategoryGroup[] = products.reduce((acc, product) => {
    const existingCategory = acc.find(group => group.category === product.category);
    if (existingCategory) {
      existingCategory.products.push(product);
      existingCategory.productCount++;
    } else {
      acc.push({ 
        category: product.category, 
        products: [product],
        productCount: 1
      });
    }
    return acc;
  }, [] as CategoryGroup[]);

  async function fetchCollections() {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data);
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
      }
      
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          image: imageUrl,
          categories: selectedCategories,
        }),
      });

      if (response.ok) {
        showSuccessAlert("✅ Koleksioni u shtua me sukses!");
        setName("");
        setDescription("");
        setImage(null);
        setSelectedCategories([]);
        setShowForm(false);
        await fetchCollections();
      } else {
        showErrorAlert("❌ Gabim gjatë shtimit të koleksionit!");
      }
    } catch (error) {
      showErrorAlert("❌ Gabim gjatë shtimit të koleksionit!");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAllCategories = (select: boolean) => {
    if (select) {
      const allCategories = productsByCategory.map(cg => cg.category);
      setSelectedCategories(allCategories);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleEditSelectAllCategories = (select: boolean) => {
    if (select) {
      const allCategories = productsByCategory.map(cg => cg.category);
      setEditSelectedCategories(allCategories);
    } else {
      setEditSelectedCategories([]);
    }
  };

  // Calculate total products that would be included
  const totalProductsInSelectedCategories = selectedCategories.reduce((total, category) => {
    const categoryGroup = productsByCategory.find(cg => cg.category === category);
    return total + (categoryGroup?.productCount || 0);
  }, 0);

  const totalProductsInEditSelectedCategories = editSelectedCategories.reduce((total, category) => {
    const categoryGroup = productsByCategory.find(cg => cg.category === category);
    return total + (categoryGroup?.productCount || 0);
  }, 0);

  // Start editing a collection
  const startEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setEditName(collection.name);
    setEditDescription(collection.description || "");
    setEditSelectedCategories(collection.categories || []);
    setEditImage(null);
    setShowEditForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCollection(null);
    setEditName("");
    setEditDescription("");
    setEditSelectedCategories([]);
    setEditImage(null);
    setShowEditForm(false);
  };

  // Handle edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;
    
    setEditLoading(true);
    
    try {
      let imageUrl = editingCollection.image; // Keep existing image by default
      if (editImage) {
        const formData = new FormData();
        formData.append("file", editImage);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url || uploadData.path || uploadData.image || "";
      }
      
      const response = await fetch(`/api/collections/${editingCollection._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          image: imageUrl,
          categories: editSelectedCategories,
        }),
      });

      if (response.ok) {
        showSuccessAlert("✅ Koleksioni u përditësua me sukses!");
        cancelEdit();
        await fetchCollections();
      } else {
        showErrorAlert("❌ Gabim gjatë përditësimit të koleksionit!");
      }
    } catch (error) {
      showErrorAlert("❌ Gabim gjatë përditësimit të koleksionit!");
    } finally {
      setEditLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Koleksionet</h1>
              <p className="mt-2 text-gray-600">Menaxho koleksionet e produkteve sipas kategorive</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {showForm ? "Mbyll" : "Shto Koleksion"}
            </button>
          </div>
        </div>

        {/* Add Collection Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Shto Koleksion të Ri</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri i Koleksionit *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Shkruaj emrin e koleksionit..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imazhi *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
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
                  placeholder="Përshkrimi i koleksionit..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Zgjidh Kategoritë ({selectedCategories.length} të zgjedhura)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllCategories(true)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      Zgjidh të Gjitha
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllCategories(false)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Hiq të Gjitha
                    </button>
                  </div>
                </div>
                
                {totalProductsInSelectedCategories > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{totalProductsInSelectedCategories}</strong> produkte do të përfshinen në këtë koleksion
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {productsByCategory.map((categoryGroup) => (
                    <div key={categoryGroup.category} className="border-b border-gray-200 last:border-b-0">
                      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                              {categoryGroup.category}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {categoryGroup.productCount} produkte
                            </p>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(categoryGroup.category)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, categoryGroup.category]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(cat => cat !== categoryGroup.category));
                                }
                              }}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Zgjidh</span>
                          </label>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryGroup.products.slice(0, 6).map(product => (
                            <div key={product._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="w-8 h-8 relative rounded overflow-hidden">
                                {product.image ? (
                                  <Image 
                                    src={product.image} 
                                    alt={product.title} 
                                    fill 
                                    className="object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">N/A</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700 truncate">{product.title}</span>
                            </div>
                          ))}
                          {categoryGroup.products.length > 6 && (
                            <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                              <span className="text-sm text-gray-600">
                                +{categoryGroup.products.length - 6} më shumë
                              </span>
                            </div>
                          )}
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
                      Duke shtuar...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Shto Koleksion
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Collection Form */}
        {showEditForm && editingCollection && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Përditëso Koleksionin</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri i Koleksionit *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Shkruaj emrin e koleksionit..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imazhi {editImage ? '(i ri)' : '(aktual)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  {!editImage && editingCollection.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Imazhi aktual:</p>
                      <div className="w-20 h-20 relative rounded overflow-hidden mt-1">
                        <Image 
                          src={editingCollection.image} 
                          alt={editingCollection.name} 
                          fill 
                          className="object-cover" 
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
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                  placeholder="Përshkrimi i koleksionit..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Zgjidh Kategoritë ({editSelectedCategories.length} të zgjedhura)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSelectAllCategories(true)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      Zgjidh të Gjitha
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditSelectAllCategories(false)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Hiq të Gjitha
                    </button>
                  </div>
                </div>
                
                {totalProductsInEditSelectedCategories > 0 && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>{totalProductsInEditSelectedCategories}</strong> produkte do të përfshinen në këtë koleksion
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {productsByCategory.map((categoryGroup) => (
                    <div key={categoryGroup.category} className="border-b border-gray-200 last:border-b-0">
                      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                              {categoryGroup.category}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {categoryGroup.productCount} produkte
                            </p>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editSelectedCategories.includes(categoryGroup.category)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setEditSelectedCategories([...editSelectedCategories, categoryGroup.category]);
                                } else {
                                  setEditSelectedCategories(editSelectedCategories.filter(cat => cat !== categoryGroup.category));
                                }
                              }}
                              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Zgjidh</span>
                          </label>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryGroup.products.slice(0, 6).map(product => (
                            <div key={product._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="w-8 h-8 relative rounded overflow-hidden">
                                {product.image ? (
                                  <Image 
                                    src={product.image} 
                                    alt={product.title} 
                                    fill 
                                    className="object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">N/A</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700 truncate">{product.title}</span>
                            </div>
                          ))}
                          {categoryGroup.products.length > 6 && (
                            <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                              <span className="text-sm text-gray-600">
                                +{categoryGroup.products.length - 6} më shumë
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Duke përditësuar...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Përditëso Koleksionin
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <div key={collection._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="relative w-full h-48">
                  {collection.image ? (
                    <Image 
                      src={collection.image} 
                      alt={collection.name} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Nuk ka imazh</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => startEdit(collection)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                    title="Përditëso koleksionin"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('A je i sigurt që do ta fshish këtë koleksion?')) {
                        try {
                          const response = await fetch(`/api/collections/${collection._id}`, { method: 'DELETE' });
                          if (response.ok) {
                            showSuccessAlert("✅ Koleksioni u fshi me sukses!");
                            await fetchCollections();
                          } else {
                            showErrorAlert("❌ Gabim gjatë fshirjes së koleksionit!");
                          }
                        } catch (error) {
                          showErrorAlert("❌ Gabim gjatë fshirjes së koleksionit!");
                        }
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                    title="Fshi koleksionin"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {collection.products.length} produkte
                  </span>
                  {collection.categories && collection.categories.length > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {collection.categories.length} kategoritë
                    </span>
                  )}
                </div>
                
                {collection.categories && collection.categories.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Kategoritë:</h4>
                    <div className="flex flex-wrap gap-2">
                      {collection.categories.map(category => (
                        <span key={category} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Produktet:</h4>
                  <div className="flex flex-wrap gap-2">
                    {collection.products.slice(0, 3).map(product => (
                      <span key={product._id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                        {product.title}
                      </span>
                    ))}
                    {collection.products.length > 3 && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md">
                        +{collection.products.length - 3} më shumë
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {collections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka koleksione</h3>
            <p className="text-gray-600 mb-6">Krijo koleksionin tënd të parë për të filluar</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Shto Koleksion të Parë
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 