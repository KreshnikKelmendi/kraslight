"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import UploadCompressionInfo from '../../components/admin/UploadCompressionInfo';
import type { CompressionStats } from '@/app/lib/images';
import { invalidateFetchCache, invalidateFetchCachePrefix } from '@/app/lib/client-fetch-cache';

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
  sortOrder?: number;
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
  const [lastCompression, setLastCompression] = useState<CompressionStats | null>(null);
  
  // Edit state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editSelectedCategories, setEditSelectedCategories] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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
  let productsByCategory: CategoryGroup[] = products.reduce((acc, product) => {
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

  // Add virtual 'Produktet ne Zbritje' (On Sale) category
  const onSaleProducts = products.filter(
    p => (typeof p.discountPercentage === 'number' && p.discountPercentage > 0) ||
         (typeof p.originalPrice === 'number' && p.price < p.originalPrice)
  );
  if (onSaleProducts.length > 0 && !productsByCategory.some(cg => cg.category === 'Produktet ne Zbritje')) {
    productsByCategory = [
      { category: 'Produktet ne Zbritje', productCount: onSaleProducts.length, products: onSaleProducts },
      ...productsByCategory
    ];
  }

  async function fetchCollections() {
    const res = await fetch("/api/collections");
    const data = await res.json();
    const sorted = Array.isArray(data)
      ? [...data].sort((a: Collection, b: Collection) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [];
    setCollections(sorted);
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
        formData.append("folder", "collections");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url || uploadData.path || uploadData.image || "";
        if (uploadData.compression) {
          setLastCompression(uploadData.compression);
        }
      }

      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          image: imageUrl,
          categories: [...new Set([...selectedCategories, ...(name.trim() ? [name.trim()] : [])])],
        }),
      });

      if (response.ok) {
        invalidateFetchCache('/api/collections');
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
    } catch {
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;
    
    setEditLoading(true);
    
    try {
      let imageUrl = editingCollection.image; // Keep existing image by default
      if (editImage) {
        const formData = new FormData();
        formData.append("file", editImage);
        formData.append("folder", "collections");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url || uploadData.path || uploadData.image || "";
        if (uploadData.compression) {
          setLastCompression(uploadData.compression);
        }
      }

      const response = await fetch(`/api/collections/${editingCollection._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          image: imageUrl,
          categories: [...new Set([...editSelectedCategories, ...(editName.trim() ? [editName.trim()] : [])])],
        }),
      });

      if (response.ok) {
        invalidateFetchCache('/api/collections');
        showSuccessAlert("✅ Koleksioni u përditësua me sukses!");
        cancelEdit();
        await fetchCollections();
      } else {
        showErrorAlert("❌ Gabim gjatë përditësimit të koleksionit!");
      }
    } catch {
      showErrorAlert("❌ Gabim gjatë përditësimit të koleksionit!");
    } finally {
      setEditLoading(false);
    }
  };

  async function moveCollection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;

    const reordered = [...collections];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setOrderSaving(true);
    try {
      const response = await fetch("/api/collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((c) => c._id) }),
      });
      if (response.ok) {
        invalidateFetchCache('/api/collections');
        setCollections(reordered.map((c, i) => ({ ...c, sortOrder: i + 1 })));
        showSuccessAlert("✅ Renditja u përditësua!");
      } else {
        showErrorAlert("❌ Gabim gjatë ndryshimit të renditjes!");
      }
    } catch {
      showErrorAlert("❌ Gabim gjatë ndryshimit të renditjes!");
    } finally {
      setOrderSaving(false);
    }
  }

  async function handleDeleteCollection(collection: Collection) {
    if (
      !window.confirm(
        'A jeni të sigurt që doni ta fshini këtë koleksion? Do të fshihet edhe nga databaza.'
      )
    ) {
      return;
    }

    setDeleteLoading(collection._id);

    try {
      const response = await fetch(`/api/collections/${collection._id}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showErrorAlert(data.error || data.details || '❌ Gabim gjatë fshirjes së koleksionit!');
        return;
      }

      setCollections((prev) => prev.filter((c) => c._id !== collection._id));
      invalidateFetchCache('/api/collections');
      invalidateFetchCachePrefix('/api/collections/');
      if (editingCollection?._id === collection._id) {
        cancelEdit();
      }
      showSuccessAlert('✅ Koleksioni u fshi me sukses!');
    } catch {
      showErrorAlert('❌ Gabim gjatë fshirjes së koleksionit!');
    } finally {
      setDeleteLoading(null);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white">
        <div className="flex w-full items-center justify-between px-4 py-5 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Menaxho Koleksionet</h1>
            <p className="mt-1 text-sm text-gray-500">
              Renditja (#1, #2…) shfaqet njësoj në website
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            {showForm ? "Mbyll" : "Shto Koleksion"}
          </button>
        </div>
      </header>

      {/* Alert */}
      {showAlert && (
        <div className={`fixed top-6 right-6 z-50 rounded-lg px-4 py-3 shadow-lg ${
          alertType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          <span className="font-medium">{alertMessage}</span>
        </div>
      )}

      <main className="w-full px-4 py-8 lg:px-8">
        {lastCompression && (
          <UploadCompressionInfo stats={lastCompression} className="mb-6" />
        )}

        {/* Add Collection Form */}
        {showForm && (
          <div className="mb-8 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Shto Koleksion të Ri</h2>
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
                  <div className="grid grid-cols-2 gap-0">
                    {productsByCategory.map((categoryGroup) => (
                      <div key={categoryGroup.category} className="border-b border-gray-200 last:border-b-0">
                        <label className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                          <span className="font-semibold text-base text-gray-800">{categoryGroup.category}</span>
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
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-8 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
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
          <div className="mb-8 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Përditëso Koleksionin</h2>
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
                  <div className="grid grid-cols-2 gap-0">
                    {productsByCategory.map((categoryGroup) => (
                      <div key={categoryGroup.category} className="border-b border-gray-200 last:border-b-0">
                        <label className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white hover:bg-green-50 transition-colors">
                          <span className="font-semibold text-base text-gray-800">{categoryGroup.category}</span>
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
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="rounded-lg bg-[#0a9945] px-8 py-3 font-medium text-white transition-colors hover:bg-[#088038] disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
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

        {/* Collections List */}
        <div className="w-full space-y-4">
          {collections.map((collection, index) => (
            <div
              key={collection._id}
              className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center lg:p-5"
            >
              <div className="flex shrink-0 items-center gap-3 sm:w-28">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
                  #{index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0 || orderSaving}
                    onClick={() => moveCollection(index, "up")}
                    className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Lart"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === collections.length - 1 || orderSaving}
                    onClick={() => moveCollection(index, "down")}
                    className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Poshtë"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-36">
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    Nuk ka imazh
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-gray-900">{collection.name}</h3>
                {collection.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{collection.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {collection.products.length} produkte
                  </span>
                  {collection.categories?.length > 0 && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {collection.categories.length} kategori
                    </span>
                  )}
                </div>
                {collection.categories?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {collection.categories.slice(0, 4).map((category) => (
                      <span
                        key={category}
                        className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 gap-2 sm:flex-col lg:flex-row">
                <button
                  type="button"
                  onClick={() => startEdit(collection)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Ndrysho
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCollection(collection)}
                  disabled={deleteLoading === collection._id}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteLoading === collection._id ? 'Duke fshirë...' : 'Fshi'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {collections.length === 0 && (
          <div className="w-full py-16 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">Nuk ka koleksione</h3>
            <p className="mb-6 text-gray-600">Krijo koleksionin tënd të parë për të filluar</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Shto Koleksion të Parë
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 