import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 - 100
  height?: string;
  color?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 'h-2.5',
  color = 'bg-brand-500',
  showLabel = false
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full flex flex-col gap-1">
      <div className={`w-full ${height} bg-zinc-800/80 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-400">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
    </div>
  );
};
