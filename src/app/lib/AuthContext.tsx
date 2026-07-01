'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (
    username: string,
    password: string,
    from?: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'kraslight_admin';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Kraslight2024!Secure';

const REMEMBER_ME_KEY = 'auth_remember_me';
const REMEMBER_ME_DAYS = 30;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authToken = Cookies.get('auth_token');
    const userData = Cookies.get('user_data');
    const tokenExpiry = Cookies.get('auth_expiry');
    
    if (authToken === 'true' && userData && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        Cookies.remove('auth_expiry');
      }
    }
  }, []);

  const login = async (
    username: string,
    password: string,
    from?: string,
    rememberMe = false
  ): Promise<boolean> => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const userData = { username };
      setUser(userData);
      setIsAuthenticated(true);

      const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        ...(rememberMe ? { expires: REMEMBER_ME_DAYS } : {}),
      };

      const expiryTime =
        Date.now() +
        (rememberMe ? REMEMBER_ME_DAYS : 1) * 24 * 60 * 60 * 1000;

      Cookies.set('auth_token', 'true', cookieOptions);
      Cookies.set('user_data', JSON.stringify(userData), cookieOptions);
      Cookies.set('auth_expiry', expiryTime.toString(), cookieOptions);

      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }

      router.push(from || '/admin/products/list');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    Cookies.remove('auth_expiry');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 