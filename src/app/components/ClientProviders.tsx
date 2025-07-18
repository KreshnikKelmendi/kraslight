'use client';

import { AuthProvider } from '../lib/AuthContext';
import { Provider } from 'react-redux';
import { store } from '../../lib/store';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
} 