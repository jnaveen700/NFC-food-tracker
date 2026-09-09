import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Zap, Calendar } from 'lucide-react';
import { MealType, EventDay, ScanResponse, DashboardData } from '../types';
import { api } from '../services/api';
import { useWebNFC } from '../hooks/useWebNFC';
import { useScanAudio } from '../hooks/useScanAudio';

import { NFCVisualizer } from '../components/Scanner/NFCVisualizer';
import { ScanResultOverlay } from '../components/Scanner/ScanResultOverlay';
import { DemoScannerSheet } from '../components/Scanner/DemoScannerSheet';
import { RecentScansFeed } from '../components/Scanner/RecentScansFeed';
import { DailySummaryCard } from '../components/Scanner/DailySummaryCard';
import { Button } from '../components/UI/Button';

interface ScannerPageProps {
  activeMeal: MealType;
  onChangeActiveMeal: (meal: MealType) => void;
  onNavigateToTab?: (tab: any) => void;
  onAddStudentWithCard?: (cardId: string) => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  activeMeal,
  onChangeActiveMeal,
  onNavigateToTab,
  onAddStudentWithCard
}) => {
  const [activeDay, setActiveDay] = useState<EventDay>('Day 1');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const { playSuccess, playDuplicate, playUnknown } = useScanAudio();

  // NEXUS Event Sessions Rule:
  // Day 1: Snack + Meal (mapped internally to Snack 1 & Dinner for backend safety)
  // Day 2: Snack (mapped to Snack 1)
  // Day 3: Snack (mapped to Snack 1)
  const getSessionsForDay = (day: EventDay): { label: string; mealType: MealType }[] => {
    if (day === 'Day 1') {
      return [
        { label: 'Snack', mealType: 'Snack 1' },
        { label: 'Meal', mealType: 'Dinner' }
      ];
    }
    return [
      { label: 'Snack', mealType: 'Snack 1' }
    ];
  };

  const currentAvailableSessions = getSessionsForDay(activeDay);

  const handleSelectDay = (day: EventDay) => {
    setActiveDay(day);
    const validSessions = getSessionsForDay(day);
    const currentValid = validSessions.some((s) => s.mealType === activeMeal);
    if (!currentValid) {
      onChangeActiveMeal(validSessions[0].mealType);
    }
  };

  // Load latest stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('[Fetch Stats Error]', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fast scan processor
  const processCardScan = useCallback(async (cardId: string) => {
    if (isProcessingScan) return;
    try {
      setIsProcessingScan(true);
      const response = await api.scanCard(cardId, activeMeal);
      setScanResult(response);

      if (response.status === 'recorded') {
        playSuccess();
      } else if (response.status === 'already_recorded') {
        playDuplicate();
      } else if (response.status === 'not_found' || response.status === 'inactive') {
        playUnknown();
      }

      fetchStats();
    } catch (err: any) {
      setScanResult({
        status: 'error',
        message: err.message || 'Connection lost to server'
      });
      playUnknown();
    } finally {
      setIsProcessingScan(false);
    }
  }, [activeMeal, fetchStats, isProcessingScan, playSuccess, playDuplicate, playUnknown]);

  // Reset / Clear specific collection record (POC Demo Feature)
  const handleResetRecord = async (result: ScanResponse) => {
    try {
      await api.deleteMealRecord({
        recordId: result.recordId,
        studentId: result.student?.id,
        mealType: result.mealType || activeMeal,
        mealDate: result.mealDate
      });
      // Immediately refresh stats so dashboard count decreases and history/recent scans reflect the deletion
      await fetchStats();
    } catch (err: any) {
      console.error('[Reset Record Error]', err);
      throw err;
    }
  };

  // Web NFC hook
  const { isScanning: isNFCScanning, startScanning: startNFC, stopScanning: stopNFC } = useWebNFC({
    onScanSuccess: (detectedId) => {
      processCardScan(detectedId);
    },
    onScanError: (errMsg) => {
      setScanResult({
        status: 'error',
        message: errMsg
      });
    }
  });

  const toggleScanningState = async () => {
    if (isScanningActive || isNFCScanning) {
      stopNFC();
      setIsScanningActive(false);
    } else {
      await startNFC();
      setIsScanningActive(true);
    }
  };

  const days: EventDay[] = ['Day 1', 'Day 2', 'Day 3'];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-xl mx-auto px-4 py-3 pb-24 bg-slate-50">
      {/* Top Event Day & Session Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3 mb-3">
        {/* Event Day Pills */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-600" />
            3-Day Food Token Schedule
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => handleSelectDay(d)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  activeDay === d
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions for selected day */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {activeDay === 'Day 1' ? 'Day 1 Tokens (1 Snack + 1 Full Meal)' : `${activeDay} Token (1 Snack)`}
          </div>
          <div className="flex items-center gap-2">
            {currentAvailableSessions.map((s) => (
              <button
                key={s.mealType}
                onClick={() => onChangeActiveMeal(s.mealType)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                  activeMeal === s.mealType
                    ? 'bg-brand-500 text-white shadow-brand-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.label === 'Meal' ? 'Full Meal Token' : 'Snack Token'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <NFCVisualizer
          isScanning={isScanningActive || isNFCScanning}
          status={scanResult ? scanResult.status : 'idle'}
          onTapVisualizer={toggleScanningState}
        />

        {/* Primary Scan Button */}
        <div className="w-full max-w-xs space-y-3">
          <Button
            variant={isScanningActive || isNFCScanning ? 'danger' : 'primary'}
            fullWidth
            size="lg"
            isLoading={isProcessingScan}
            onClick={toggleScanningState}
            icon={<Smartphone className="w-5 h-5" />}
          >
            {isScanningActive || isNFCScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Button>

          {/* Secondary Demo Button */}
          <button
            onClick={() => setIsDemoSheetOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-extrabold text-slate-800 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
          >
            <Zap className="w-4 h-4 text-brand-600" />
            <span>Use Demo Scanner</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Summary Card */}
      {dashboardData && (() => {
        const sessionCount = activeMeal === 'Dinner' ? (dashboardData.meals?.dinner || 0) : (dashboardData.meals?.snack1 || 0);
        const sessionPct = dashboardData.totalStudents > 0 ? Math.round((sessionCount / dashboardData.totalStudents) * 100) : 0;
        return (
          <DailySummaryCard
            mealType={activeMeal}
            sessionLabel={`${activeDay} • ${activeMeal === 'Dinner' ? 'Meal' : 'Snack'}`}
            count={sessionCount}
            total={dashboardData.totalStudents}
            percentage={sessionPct}
          />
        );
      })()}

      {/* Live Recent Scans Feed */}
      <RecentScansFeed
        scans={dashboardData?.recentScans || []}
        onViewAllHistory={onNavigateToTab ? () => onNavigateToTab('history') : undefined}
      />

      {/* Overlays & Sheets */}
      <ScanResultOverlay
        scanResult={scanResult}
        sessionLabel={`${activeDay} • ${activeMeal === 'Dinner' ? 'Meal' : 'Snack'}`}
        onDismiss={() => setScanResult(null)}
        onResetRecord={handleResetRecord}
        onAddStudentClick={(cardId) => {
          setScanResult(null);
          if (onAddStudentWithCard) onAddStudentWithCard(cardId || '');
        }}
      />

      <DemoScannerSheet
        isOpen={isDemoSheetOpen}
        onClose={() => setIsDemoSheetOpen(false)}
        onSimulateScan={(cardId) => processCardScan(cardId)}
      />
    </div>
  );
};
