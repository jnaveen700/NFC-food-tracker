import React from 'react';
import { ProgressBar } from '../UI/ProgressBar';
import { MealType } from '../../types';

interface DailySummaryCardProps {
  mealType: MealType;
  count: number;
  total: number;
  percentage: number;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  mealType,
  count,
  total,
  percentage
}) => {
  return (
    <div className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {mealType} Attendance
        </span>
        <span className="text-xs font-bold text-slate-800">
          <strong className="text-brand-600 font-extrabold">{count}</strong> / {total} students ({percentage}%)
        </span>
      </div>
      <ProgressBar value={percentage} height="h-2.5" color="bg-brand-500" />
    </div>
  );
};
