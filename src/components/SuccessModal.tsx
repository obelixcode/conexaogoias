'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  redirectTo?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  redirectTo 
}: SuccessModalProps) {
  // Fechar modal com ESC
  useEffect(() => {
    if (typeof window === 'undefined' || !document?.body) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body quando modal estiver aberto
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      try {
        if (document) {
          document.removeEventListener('keydown', handleEscape);
        }
        if (document?.body) {
          document.body.style.overflow = 'unset';
        }
      } catch (error) {
        console.warn('Error cleaning up modal:', error);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Actions */}
          <div className="flex justify-end">
            <Button 
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
