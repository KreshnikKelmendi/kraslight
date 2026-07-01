'use client';

import { AuthProvider } from '../lib/AuthContext';
import { Provider } from 'react-redux';
import { store } from '../../lib/store';
import CartHydrator from '../../lib/CartHydrator';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartHydrator />
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
} 