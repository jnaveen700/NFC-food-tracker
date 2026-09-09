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
    <div className={`p-4 bg-dark-card border border-zinc-800 rounded-2xl flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 bg-zinc-800/60 rounded-xl text-brand-400">{icon}</div>}
        {badge}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-zinc-400 mt-1 font-medium">{subtitle}</div>}
        {trend && (
          <div className={`text-xs font-semibold mt-2 ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};
