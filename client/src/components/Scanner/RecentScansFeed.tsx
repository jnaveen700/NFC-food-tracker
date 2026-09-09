import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { MealRecord } from '../../types';

interface RecentScansFeedProps {
  scans: MealRecord[];
  onViewAllHistory?: () => void;
}

export const RecentScansFeed: React.FC<RecentScansFeedProps> = ({ scans, onViewAllHistory }) => {
  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          Recent Scans
        </h3>
        {onViewAllHistory && (
          <button
            onClick={onViewAllHistory}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View History →
          </button>
        )}
      </div>

      {scans.length === 0 ? (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 shadow-sm">
          No meal records yet today. Tap Start Scanning to begin.
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {scans.slice(0, 5).map((scan) => (
              <motion.div
                key={scan.id || `${scan.student_id}-${scan.scanned_at}`}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {scan.student_name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                      <span>{scan.roll_number}</span>
                      {scan.department && (
                        <>
                          <span>•</span>
                          <span>{scan.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {scan.formatted_time || 'Just now'}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-brand-600">
                    {scan.meal_type}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
