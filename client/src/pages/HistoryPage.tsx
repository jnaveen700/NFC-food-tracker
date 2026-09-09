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
    { value: 'ALL', label: 'All Meals' },
    { value: 'Breakfast', label: 'Breakfast' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-3 pb-24">
      {/* Top Header & Export */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-100">Meal History</h1>
          <p className="text-xs text-zinc-400 font-medium">
            Showing {records.length} of {totalCount} records
          </p>
        </div>

        <a
          href={api.getExportCsvUrl(dateFilter)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          Export CSV
        </a>
      </div>

      {/* Date & Search Controls */}
      <div className="space-y-3 mb-3">
        <Input
          placeholder="Search student, roll no, card..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-zinc-400" />}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SegmentedControl
              options={mealFilterOptions}
              value={mealFilter}
              onChange={(val) => setMealFilter(val)}
            />
          </div>
          <div className="flex items-center gap-1 bg-dark-card border border-zinc-800 rounded-2xl p-1 shrink-0">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                dateFilter === 'today' ? 'bg-brand-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                dateFilter === 'ALL' ? 'bg-brand-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-zinc-900/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="p-8 bg-dark-card border border-zinc-800 rounded-3xl text-center my-6">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-zinc-300">No meal records found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try clearing your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div
              key={r.id}
              className="p-3 bg-dark-card border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-100 truncate">{r.student_name}</div>
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                    <span>{r.roll_number}</span>
                    <span>•</span>
                    <span>{r.department}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 block mb-0.5">
                  {r.meal_type}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {r.formatted_time || r.scanned_at}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
