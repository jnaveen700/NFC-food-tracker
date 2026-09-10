import React, { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, AlertCircle, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
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

  const totalParticipants = data.totalStudents || 65;

  // Exact session collections from backend response
  const day1SnackCount = data.dayCollections?.day1?.snack ?? 0;
  const day1MealCount = data.dayCollections?.day1?.meal ?? 0;
  const day2SnackCount = data.dayCollections?.day2?.snack ?? 0;
  const day3SnackCount = data.dayCollections?.day3?.snack ?? 0;

  const formatPct = (count: number) => {
    if (totalParticipants === 0 || count === 0) return '0%';
    const pct = (count / totalParticipants) * 100;
    return `${Number.isInteger(pct) ? pct : pct.toFixed(2)}%`;
  };

  const getPctNum = (count: number) => {
    if (totalParticipants === 0) return 0;
    return Math.round((count / totalParticipants) * 100);
  };

  // Active day metrics
  const activeDayTotalCollected = selectedDay === 'Day 1'
    ? day1SnackCount + day1MealCount
    : selectedDay === 'Day 2'
    ? day2SnackCount
    : day3SnackCount;

  const activeDayMaxQuota = selectedDay === 'Day 1' ? totalParticipants * 2 : totalParticipants;
  const activeDayPercentage = activeDayMaxQuota > 0 ? Math.round((activeDayTotalCollected / activeDayMaxQuota) * 100) : 0;
  const activeDayPending = Math.max(0, activeDayMaxQuota - activeDayTotalCollected);

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
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-extrabold uppercase tracking-wider">
              NEXUS Fest 2026
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Collection Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">
            IV-I CSE (Data Science) • 65 Official Participants
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
          subtitle="4 Food Sessions Quota"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="Current Day"
          value={selectedDay}
          subtitle={selectedDay === 'Day 1' ? 'Snack + Meal' : '1 Snack'}
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          title="Collections"
          value={`${activeDayTotalCollected} / ${activeDayMaxQuota}`}
          subtitle={`${selectedDay} Total`}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          title="Pending"
          value={activeDayPending}
          subtitle={`${activeDayPercentage}% Turnout`}
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
            3 Snacks (1/day) + 1 Meal
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
                  {subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Collection Details */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              {selectedDay} Collection Status
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Collection progress across all {totalParticipants} registered participants
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            {selectedDay === 'Day 1' ? 'Snack + Meal' : '1 Snack'}
          </span>
        </div>

        {selectedDay === 'Day 1' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day 1 Snack */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Day 1 Snack</span>
                <span className="text-xs font-extrabold text-brand-700">
                  {formatPct(day1SnackCount)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{day1SnackCount}</span>
                <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Collected</span>
              </div>
              <ProgressBar
                value={getPctNum(day1SnackCount)}
                height="h-2.5"
                color="bg-brand-500"
              />
              <div className="text-[11px] text-slate-500 font-medium">
                {totalParticipants - day1SnackCount} participants pending
              </div>
            </div>

            {/* Day 1 Meal */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Day 1 Meal</span>
                <span className="text-xs font-extrabold text-brand-700">
                  {formatPct(day1MealCount)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{day1MealCount}</span>
                <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Collected</span>
              </div>
              <ProgressBar
                value={getPctNum(day1MealCount)}
                height="h-2.5"
                color="bg-brand-500"
              />
              <div className="text-[11px] text-slate-500 font-medium">
                {totalParticipants - day1MealCount} participants pending
              </div>
            </div>
          </div>
        ) : selectedDay === 'Day 2' ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Day 2 Snack</span>
              <span className="text-xs font-extrabold text-brand-700">
                {formatPct(day2SnackCount)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{day2SnackCount}</span>
              <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Collected</span>
            </div>
            <ProgressBar
              value={getPctNum(day2SnackCount)}
              height="h-2.5"
              color="bg-brand-500"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              {totalParticipants - day2SnackCount} participants pending
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Day 3 Snack</span>
              <span className="text-xs font-extrabold text-brand-700">
                {formatPct(day3SnackCount)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{day3SnackCount}</span>
              <span className="text-xs font-bold text-slate-500">/ {totalParticipants} Collected</span>
            </div>
            <ProgressBar
              value={getPctNum(day3SnackCount)}
              height="h-2.5"
              color="bg-brand-500"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              {totalParticipants - day3SnackCount} participants pending
            </div>
          </div>
        )}
      </div>

      {/* Pending Participants Checklist */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Pending Collection ({data.missingStudents.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Participant Roster</span>
        </div>

        {data.missingStudents.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-700 font-bold">
            ✓ 100% Turnout! All registered participants have completed collection for this session.
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
