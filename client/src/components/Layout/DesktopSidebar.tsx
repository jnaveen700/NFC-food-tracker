import React from 'react';
import { Scan, Clock, Users, LayoutDashboard, Settings, UtensilsCrossed, Shield } from 'lucide-react';
import { TabType } from './MobileBottomNav';

interface DesktopSidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  messName?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  messName = 'Food Tracker'
}) => {
  const menuItems = [
    { id: 'scanner' as TabType, label: 'Scanner', icon: Scan, badge: 'NFC' },
    { id: 'history' as TabType, label: 'Collection History', icon: Clock },
    { id: 'students' as TabType, label: 'Participants', icon: Users },
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <aside aria-label="Desktop Sidebar" className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-4 justify-between shrink-0 h-screen sticky top-0 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-brand-500/20 shrink-0">
            N
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 leading-tight">NEXUS</h1>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">Food Token Tracker</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav aria-label="Desktop Sidebar Navigation" className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150
                  ${isActive
                    ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900">Staff Mode</div>
          <div className="text-[10px] text-slate-500">Light Mode Active</div>
        </div>
      </div>
    </aside>
  );
};
