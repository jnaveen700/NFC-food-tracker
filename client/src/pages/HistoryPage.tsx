import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Check, Download, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { MealRecord, MealType } from '../types';
import { api } from '../services/api';
import { SegmentedControl } from '../components/UI/SegmentedControl';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

export const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [mealFilter, setMealFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recordToReset, setRecordToReset] = useState<MealRecord | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

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

  const handleConfirmReset = async () => {
    if (!recordToReset) return;
    try {
      setIsResetting(true);
      await api.deleteMealRecord({
        recordId: recordToReset.id,
        studentId: recordToReset.student_id,
        mealType: recordToReset.meal_type,
        mealDate: recordToReset.meal_date
      });
      setResetFeedback('Collection reset. The participant can be scanned again.');
      setRecordToReset(null);
      await fetchHistory();
      setTimeout(() => setResetFeedback(null), 3000);
    } catch (err: any) {
      console.error('[Reset Error]', err);
      alert(err.message || 'Failed to reset collection');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-3 pb-24">
      {/* Toast Feedback */}
      {resetFeedback && (
        <div className="mb-3 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-sm animate-fade-in">
          <span>✓ {resetFeedback}</span>
          <button onClick={() => setResetFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Export */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Food Token History</h1>
          <p className="text-xs text-slate-500 font-medium">
            Showing {records.length} of {totalCount} food token collections
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
            const tokenLabel = r.meal_type === 'Dinner' ? 'Meal Token' : 'Snack Token';
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

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 block mb-0.5">
                      {tokenLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {r.formatted_time || r.scanned_at}
                    </span>
                  </div>

                  {/* Reset Collection Action */}
                  <button
                    onClick={() => setRecordToReset(r)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Reset Collection Record"
                    aria-label="Reset Collection Record"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {recordToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 border border-amber-500/80 bg-white text-center shadow-2xl relative">
            <button
              onClick={() => setRecordToReset(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900">Reset Collection?</h3>
            <p className="mt-1 text-xs text-slate-600 font-semibold">
              This will remove the collection record for:
            </p>

            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs space-y-1">
              <div className="font-extrabold text-rose-950 text-sm">{recordToReset.student_name}</div>
              <div className="font-semibold text-rose-800">
                {recordToReset.meal_type === 'Dinner' ? 'Meal Token' : 'Snack Token'} • {recordToReset.meal_date}
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-rose-200">
                The participant will return to "Not Collected" and can be scanned again.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <Button
                variant="outline"
                size="md"
                disabled={isResetting}
                onClick={() => setRecordToReset(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                isLoading={isResetting}
                onClick={handleConfirmReset}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset Collection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
