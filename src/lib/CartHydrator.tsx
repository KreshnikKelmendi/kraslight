'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCart, type CartItem } from '@/lib/cartSlice';

export default function CartHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (!raw) return;

      const items = JSON.parse(raw) as CartItem[];
      if (Array.isArray(items)) {
        dispatch(setCart(items));
      }
    } catch {
      localStorage.removeItem('cart');
    }
  }, [dispatch]);

  return null;
}
