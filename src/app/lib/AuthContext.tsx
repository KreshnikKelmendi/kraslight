'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthReady: boolean;
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
const SESSION_DAYS = 1;
const COOKIE_PATH = '/';

function readAuthFromCookies() {
  const authToken = Cookies.get('auth_token');
  const userData = Cookies.get('user_data');
  const tokenExpiry = Cookies.get('auth_expiry');

  if (authToken === 'true' && userData && tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry, 10);
    if (!Number.isNaN(expiryTime) && Date.now() < expiryTime) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(userData) as { username: string },
        };
      } catch {
        // fall through
      }
    }
  }

  return { isAuthenticated: false, user: null };
}

function clearAuthCookies() {
  Cookies.remove('auth_token', { path: COOKIE_PATH });
  Cookies.remove('user_data', { path: COOKIE_PATH });
  Cookies.remove('auth_expiry', { path: COOKIE_PATH });
}

function buildCookieOptions(rememberMe: boolean) {
  return {
    path: COOKIE_PATH,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    expires: rememberMe ? REMEMBER_ME_DAYS : SESSION_DAYS,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = readAuthFromCookies();
    if (auth.isAuthenticated) {
      setUser(auth.user);
      setIsAuthenticated(true);
    } else {
      clearAuthCookies();
    }
    setIsAuthReady(true);
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

      const cookieOptions = buildCookieOptions(rememberMe);
      const expiryTime =
        Date.now() +
        (rememberMe ? REMEMBER_ME_DAYS : SESSION_DAYS) * 24 * 60 * 60 * 1000;

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
    clearAuthCookies();
    localStorage.removeItem(REMEMBER_ME_KEY);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthReady, user, login, logout }}
    >
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
