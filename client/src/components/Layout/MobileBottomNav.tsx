import React from 'react';
import { Scan, Clock, Users, LayoutDashboard, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabType = 'scanner' | 'history' | 'students' | 'dashboard' | 'settings';

interface MobileBottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'scanner' as TabType, label: 'Scan', icon: Scan, isPrimary: true },
    { id: 'history' as TabType, label: 'History', icon: Clock },
    { id: 'students' as TabType, label: 'Students', icon: Users },
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 pb-safe md:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`
                relative flex flex-col items-center justify-center min-w-[64px] h-[52px] py-1 px-2 rounded-2xl transition-all duration-150 active:scale-95 select-none
                ${isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-brand-50 rounded-2xl border border-brand-200"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-brand-700 font-extrabold' : 'font-semibold'}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
