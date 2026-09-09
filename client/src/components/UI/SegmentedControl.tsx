import React from 'react';
import { motion } from 'framer-motion';

export interface Option {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md'
}) => {
  return (
    <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              relative flex-1 min-w-[70px] py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 select-none
              ${isSelected ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900'}
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="activeSegment"
                className="absolute inset-0 bg-brand-500 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`relative z-10 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-white/25 text-white font-extrabold' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
