import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  badge?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 bg-brand-50 border border-brand-200/60 rounded-xl text-brand-600">{icon}</div>}
        {badge}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-slate-600 mt-1 font-medium">{subtitle}</div>}
        {trend && (
          <div className={`text-xs font-semibold mt-2 ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};
