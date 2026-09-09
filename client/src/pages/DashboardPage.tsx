import React, { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, AlertCircle, RefreshCw, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { DashboardData, EventDay } from '../types';
import { api } from '../services/api';
import { ProgressBar } from '../components/UI/ProgressBar';
import { StatCard } from '../components/UI/StatCard';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<EventDay>('Day 1');

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
        <div className="h-24 bg-slate-200/60 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalParticipants = data.totalStudents || 20;

  // Real collections from backend response
  const day1SnackCount = data.dayCollections?.day1.snack ?? data.meals.snack1;
  const day1MealCount = data.dayCollections?.day1.meal ?? data.meals.dinner;
  const day2SnackCount = data.dayCollections?.day2.snack ?? data.meals.snack1;
  const day3SnackCount = data.dayCollections?.day3.snack ?? data.meals.snack1;

  // Active day metrics
  const activeDayCount = selectedDay === 'Day 1'
    ? day1SnackCount
    : selectedDay === 'Day 2'
    ? day2SnackCount
    : day3SnackCount;

  const activeDayPercentage = totalParticipants > 0 ? Math.round((activeDayCount / totalParticipants) * 100) : 0;
  const activeDayPending = Math.max(0, totalParticipants - activeDayCount);

  const days: { day: EventDay; subtitle: string }[] = [
    { day: 'Day 1', subtitle: 'Snack + Meal' },
    { day: 'Day 2', subtitle: 'Snack' },
    { day: 'Day 3', subtitle: 'Snack' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 py-3 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-extrabold uppercase tracking-wider">
              NEXUS Fest 2026
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Food Token Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">
            3 Snacks (1/day) + 1 Full Meal Allowance per Participant
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

      {/* Top 4 Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          title="Participants"
          value={totalParticipants}
          subtitle="4 Food Tokens Each"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="Current Day"
          value={selectedDay}
          subtitle={selectedDay === 'Day 1' ? 'Snack + Full Meal' : '1 Snack Token'}
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          title="Tokens Redeemed"
          value={`${activeDayCount} / ${totalParticipants}`}
          subtitle={`${selectedDay} Token Session`}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          title="Tokens Pending"
          value={activeDayPending}
          subtitle={`${activeDayPercentage}% Redeemed`}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Prominent Day Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-600" />
            Select Fest Day
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            3 Snacks (1/day) + 1 Full Meal
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {days.map(({ day, subtitle }) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="text-sm font-extrabold">{day}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {day === 'Day 1' ? '1 Snack + 1 Full Meal' : '1 Snack Token'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Food Token Details */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              {selectedDay} Food Token Redemptions
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Token redemption rate across all 20 registered participants
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            {selectedDay === 'Day 1' ? 'Snack + Full Meal' : '1 Snack'}
          </span>
        </div>

        {selectedDay === 'Day 1' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day 1 Snack */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Day 1 Snack Token</span>
                <span className="text-xs font-extrabold text-brand-700">
                  {Math.round((day1SnackCount / totalParticipants) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{day1SnackCount}</span>
                <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Tokens Redeemed</span>
              </div>
              <ProgressBar
                value={Math.round((day1SnackCount / totalParticipants) * 100)}
                height="h-2.5"
                color="bg-brand-500"
              />
              <div className="text-[11px] text-slate-500 font-medium">
                {totalParticipants - day1SnackCount} participants yet to redeem
              </div>
            </div>

            {/* Day 1 Full Meal */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Day 1 Full Meal Token</span>
                <span className="text-xs font-extrabold text-brand-700">
                  {Math.round((day1MealCount / totalParticipants) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{day1MealCount}</span>
                <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Tokens Redeemed</span>
              </div>
              <ProgressBar
                value={Math.round((day1MealCount / totalParticipants) * 100)}
                height="h-2.5"
                color="bg-brand-500"
              />
              <div className="text-[11px] text-slate-500 font-medium">
                {totalParticipants - day1MealCount} participants yet to redeem
              </div>
            </div>
          </div>
        ) : selectedDay === 'Day 2' ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Day 2 Snack Token</span>
              <span className="text-xs font-extrabold text-brand-700">
                {Math.round((day2SnackCount / totalParticipants) * 100)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{day2SnackCount}</span>
              <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Tokens Redeemed</span>
            </div>
            <ProgressBar
              value={Math.round((day2SnackCount / totalParticipants) * 100)}
              height="h-2.5"
              color="bg-brand-500"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              {totalParticipants - day2SnackCount} participants yet to redeem
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Day 3 Snack Token</span>
              <span className="text-xs font-extrabold text-brand-700">
                {Math.round((day3SnackCount / totalParticipants) * 100)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{day3SnackCount}</span>
              <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Tokens Redeemed</span>
            </div>
            <ProgressBar
              value={Math.round((day3SnackCount / totalParticipants) * 100)}
              height="h-2.5"
              color="bg-brand-500"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              {totalParticipants - day3SnackCount} participants yet to redeem
            </div>
          </div>
        )}
      </div>

      {/* Pending Participants Checklist */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Pending Token Redemption ({data.missingStudents.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Food Token Roster</span>
        </div>

        {data.missingStudents.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-700 font-bold">
            ✓ 100% Turnout! All registered participants have redeemed their food tokens for this session.
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
