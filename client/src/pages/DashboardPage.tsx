import React, { useState, useEffect, useCallback } from 'react';
import { Users, PieChart, AlertCircle, RefreshCw, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { DashboardData } from '../types';
import { api } from '../services/api';
import { ProgressBar } from '../components/UI/ProgressBar';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('[Dashboard Fetch Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 py-4 space-y-4">
        <div className="h-20 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 py-3 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Mess & Event Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">
            Daily Attendance Summary • {data.date}
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          title="Refresh Dashboard"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Stat: Active Meal Turnout */}
      <div className="p-5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
            {data.activeMeal} Turnout Today
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs backdrop-blur-sm">
            {data.activeMealPercentage}% Attendance
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-extrabold text-white">{data.activeMealCount}</span>
          <span className="text-sm font-semibold text-emerald-100">/ {data.totalStudents} Active Students</span>
        </div>

        <ProgressBar value={data.activeMealPercentage} height="h-3" color="bg-white" />
      </div>

      {/* Meals & Snacks Breakdown Cards */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          Today's Meals & Snacks Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <Coffee className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <div className="text-[11px] text-slate-500 font-semibold">Breakfast</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{data.meals.breakfast}</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <Cookie className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <div className="text-[11px] text-slate-500 font-semibold">Snack 1</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{data.meals.snack1 || 0}</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <div className="text-[11px] text-slate-500 font-semibold">Lunch</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{data.meals.lunch}</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <Cookie className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <div className="text-[11px] text-slate-500 font-semibold">Snack 2</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{data.meals.snack2 || 0}</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <Moon className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
            <div className="text-[11px] text-slate-500 font-semibold">Dinner</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{data.meals.dinner}</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <Cookie className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <div className="text-[11px] text-slate-500 font-semibold">Snack 3</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{data.meals.snack3 || 0}</div>
          </div>
        </div>
      </div>

      {/* Students Who Haven't Eaten Active Meal */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Not Eaten {data.activeMeal} Yet ({data.missingStudents.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Event Roster</span>
        </div>

        {data.missingStudents.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-700 font-bold">
            ✓ 100% Turnout! All active students have taken their {data.activeMeal}.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {data.missingStudents.map((st) => (
              <div
                key={st.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{st.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono ml-2">({st.roll_number})</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600">{st.department}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
