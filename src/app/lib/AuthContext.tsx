'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get credentials from environment variables or use defaults for development
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is logged in on mount
    const authToken = Cookies.get('auth_token');
    const userData = Cookies.get('user_data');
    const tokenExpiry = Cookies.get('auth_expiry');
    
    if (authToken === 'true' && userData && tokenExpiry) {
      // Check if token has expired
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        // Token expired, clear cookies
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        Cookies.remove('auth_expiry');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Secure authentication with environment variables
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const userData = { username };
      setUser(userData);
      setIsAuthenticated(true);
      
      // Set secure cookies with expiration
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      Cookies.set('auth_token', 'true', { 
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      Cookies.set('user_data', JSON.stringify(userData), { 
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      Cookies.set('auth_expiry', expiryTime.toString(), { 
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Redirect to the original requested page or default to admin products list
      const from = searchParams.get('from') || '/admin/products/list';
      router.push(from);
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Remove all auth cookies
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