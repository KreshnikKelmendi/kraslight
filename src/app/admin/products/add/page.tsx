'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/products/list?add=1');
  }, [router]);
  return null;
}
