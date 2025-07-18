'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

const UnsubscribePage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('Email nuk u gjet në URL');
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch {
        setStatus('error');
        setMessage('Gabim i lidhjes me serverin');
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
            status === 'success' 
              ? 'bg-green-100 text-green-600' 
              : status === 'error' 
              ? 'bg-red-100 text-red-600'
              : 'bg-blue-100 text-blue-600'
          }`}>
            {status === 'loading' && <FaEnvelope className="w-8 h-8 animate-pulse" />}
            {status === 'success' && <FaCheck className="w-8 h-8" />}
            {status === 'error' && <FaTimes className="w-8 h-8" />}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Duke u çabonuar...'}
            {status === 'success' && 'Çabonimi u krye!'}
            {status === 'error' && 'Gabim gjatë çabonimit'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {status === 'loading' && 'Ju lutem prisni...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          {/* Email Display */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Email:</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Kthehu në Ballina
            </a>
            
            {status === 'success' && (
              <p className="text-sm text-gray-500">
                Nëse ndryshoni mendje, mund të abonoheni përsëri nga ballina e faqes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage; 