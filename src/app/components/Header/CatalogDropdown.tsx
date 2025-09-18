'use client';

import React from 'react';
import { FiChevronDown, FiFileText } from 'react-icons/fi';

interface CatalogDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isMobile?: boolean;
}

const CatalogDropdown: React.FC<CatalogDropdownProps> = ({ 
  isOpen, 
  onToggle, 
  onClose, 
  isMobile = false 
}) => {
  const handleCatalogClick = () => {
    console.log('Catalog link clicked'); // Debug log
    onClose();
  };

  if (isMobile) {
    return (
      <div>
        <button
          onClick={onToggle}
          className="w-full text-left py-4 px-4 text-xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0a9945]"
        >
          KATALOGU
          <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={20} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}> 
          <div className="mt-2 mx-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-3">
              <a
                href="/assets/CV- Kreshnik Kelmendi.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="CV-Kreshnik-Kelmendi.pdf"
                onClick={handleCatalogClick}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiFileText size={16} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    CV - Kreshnik Kelmendi
                  </h4>
                  <p className="text-xs text-gray-500">PDF • Shkarko tani</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative dropdown-container">
      <button 
        className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 flex items-center space-x-1 relative"
        onClick={onToggle}
      >
        <span>KATALOGU</span>
        <FiChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        <span className={`absolute bottom-0 left-0 h-0.5 bg-gray-800 transition-all duration-200 ${isOpen ? 'w-full' : 'w-0'}`}></span>
      </button>
      <div
        className={`absolute top-full left-1/2 transform -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 ease-in-out origin-top z-50
                   ${isOpen 
                     ? 'opacity-100 visible scale-100 translate-y-0' 
                     : 'opacity-0 invisible scale-95 -translate-y-2'
                   }`}
      >
        <div className="p-4">
          <a
            href="/assets/CV- Kreshnik Kelmendi.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="CV-Kreshnik-Kelmendi.pdf"
            onClick={handleCatalogClick}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiFileText size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                Katalogu 2025/2026
              </h4>
              <p className="text-xs text-gray-500">PDF • Shkarko tani</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CatalogDropdown;
