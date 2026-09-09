import React from 'react';
import { Utensils, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { MealType } from '../../types';

interface TopHeaderProps {
  activeMeal: MealType;
  messName?: string;
  isOnline?: boolean;
  onOpenMealSelector?: () => void;
  onOpenDemoScanner?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeMeal,
  messName = 'Hostel Mess & Event',
  isOnline = true,
  onOpenMealSelector,
  onOpenDemoScanner
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 pt-safe shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Mess Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 shrink-0 md:hidden">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                {messName}
              </h2>
              {isOnline ? (
                <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] text-rose-600 font-bold gap-1">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>{activeMeal}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Demo Action */}
        <div className="flex items-center gap-2">
          {onOpenDemoScanner && (
            <button
              onClick={onOpenDemoScanner}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Use Demo</span> Scanner
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
