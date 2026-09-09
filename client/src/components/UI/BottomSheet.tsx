import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full max-w-lg bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col ${maxHeight} overflow-hidden`}
          >
            {/* Drag Pill */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 overflow-y-auto max-h-full">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
