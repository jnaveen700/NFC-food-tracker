import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Smartphone, Check, AlertCircle, HelpCircle } from 'lucide-react';

import { ScanStatusType } from '../../types';

interface NFCVisualizerProps {
  isScanning: boolean;
  status?: ScanStatusType | 'idle' | 'scanning' | 'success' | 'duplicate' | 'unknown';
  onTapVisualizer?: () => void;
}

export const NFCVisualizer: React.FC<NFCVisualizerProps> = ({
  isScanning,
  status = 'idle',
  onTapVisualizer
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center my-6 py-6 select-none">
      {/* Outer Ripples when scanning */}
      {isScanning && (
        <>
          <motion.div
            className="absolute w-64 h-64 rounded-full border-2 border-brand-500/30 bg-brand-500/5 pointer-events-none"
            animate={{ scale: [0.8, 1.3], opacity: [0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full border-2 border-brand-400/40 bg-brand-500/10 pointer-events-none"
            animate={{ scale: [0.8, 1.25], opacity: [0.9, 0] }}
            transition={{ duration: 2.2, delay: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Main Circle Graphic */}
      <motion.button
        onClick={onTapVisualizer}
        whileTap={{ scale: 0.95 }}
        className={`
          relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl border-4
          ${isScanning
            ? 'bg-zinc-900 border-brand-500 shadow-brand-500/30'
            : status === 'success' || status === 'recorded'
            ? 'bg-emerald-950/40 border-emerald-500 shadow-emerald-500/30'
            : status === 'duplicate' || status === 'already_recorded'
            ? 'bg-amber-950/40 border-amber-500 shadow-amber-500/30'
            : status === 'unknown' || status === 'not_found'
            ? 'bg-rose-950/40 border-rose-500 shadow-rose-500/30'
            : 'bg-dark-card border-zinc-800 hover:border-zinc-700 shadow-black/40'
          }
        `}
      >
        {/* Graphic Icon */}
        {status === 'success' || status === 'recorded' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400">
            <Check className="w-16 h-16 stroke-[3]" />
          </motion.div>
        ) : status === 'duplicate' || status === 'already_recorded' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-amber-400">
            <Check className="w-16 h-16 stroke-[3]" />
          </motion.div>
        ) : status === 'unknown' || status === 'not_found' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-rose-400">
            <HelpCircle className="w-16 h-16 stroke-[2.5]" />
          </motion.div>
        ) : isScanning ? (
          <div className="flex flex-col items-center gap-2 text-brand-400">
            <Radio className="w-14 h-14 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-400">Active</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <Smartphone className="w-14 h-14 stroke-[1.5]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Ready</span>
          </div>
        )}
      </motion.button>

      {/* Label under visualizer */}
      <div className="mt-4 text-center">
        {isScanning ? (
          <p className="text-sm font-bold text-brand-400 animate-pulse flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            Hold NFC card near back of phone...
          </p>
        ) : (
          <p className="text-xs font-semibold text-zinc-400">
            Tap NFC card against phone hardware
          </p>
        )}
      </div>
    </div>
  );
};
