import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Check, Download } from 'lucide-react';
import { MealRecord, MealType } from '../types';
import { api } from '../services/api';
import { SegmentedControl } from '../components/UI/SegmentedControl';
import { Input } from '../components/UI/Input';

export const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [mealFilter, setMealFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getMeals({
        date: dateFilter,
        meal_type: mealFilter,
        search: searchTerm,
        limit: 100
      });
      setRecords(res.records);
      setTotalCount(res.total);
    } catch (err) {
      console.error('[History Fetch Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, mealFilter, searchTerm]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const mealFilterOptions = [
    { value: 'ALL', label: 'All Sessions' },
    { value: 'Snack 1', label: 'Snack' },
    { value: 'Dinner', label: 'Meal' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-3 pb-24">
      {/* Top Header & Export */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Food Token History</h1>
          <p className="text-xs text-slate-500 font-medium">
            Showing {records.length} of {totalCount} food token redemptions
          </p>
        </div>

        <a
          href={api.getExportCsvUrl(dateFilter)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-brand-600" />
          Export CSV
        </a>
      </div>

      {/* Date & Search Controls */}
      <div className="space-y-3 mb-3">
        <Input
          placeholder="Search participant, roll no, card..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SegmentedControl
              options={mealFilterOptions}
              value={mealFilter}
              onChange={(val) => setMealFilter(val)}
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-2xl p-1 shrink-0">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                dateFilter === 'today' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                dateFilter === 'ALL' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Days
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center my-6 shadow-sm">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No collection records found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your session filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => {
            const tokenLabel = r.meal_type === 'Dinner' ? 'Full Meal Token' : 'Snack Token';
            return (
              <div
                key={r.id}
                className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{r.student_name}</div>
                    <div className="text-[11px] font-mono text-slate-600 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-800">{r.roll_number}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">{r.department}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 block mb-0.5">
                    {tokenLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {r.formatted_time || r.scanned_at}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
