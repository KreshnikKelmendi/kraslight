'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

 useEffect(() => {
  fetch('/api/products')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => setProducts(data))
    .catch(err => {
      console.error('Fetch error:', err);
      setProducts([]); // fallback empty array
    });
}, []);


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products?.map(p => (
            <tr key={p.id}>
              <td className="p-2 border">{p?.name}</td>
              <td className="p-2 border">${p?.price}</td>
              <td className="p-2 border">{p?.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
