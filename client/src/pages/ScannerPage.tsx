import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Zap, Calendar, Radio } from 'lucide-react';
import { EventDay, ScanResponse, DashboardData } from '../types';
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
  activeDay?: EventDay;
  setActiveDay?: (day: EventDay) => void;
  activeSessionType?: 'Snack' | 'Meal';
  setActiveSessionType?: (type: 'Snack' | 'Meal') => void;
  onNavigateToTab?: (tab: any) => void;
  onAddStudentWithCard?: (cardId: string) => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  activeDay: propActiveDay,
  setActiveDay: propSetActiveDay,
  activeSessionType: propActiveSessionType,
  setActiveSessionType: propSetActiveSessionType,
  onNavigateToTab,
  onAddStudentWithCard
}) => {
  // Local fallback state if props not provided
  const [localActiveDay, setLocalActiveDay] = useState<EventDay>('Day 1');
  const [localActiveSessionType, setLocalActiveSessionType] = useState<'Snack' | 'Meal'>('Snack');

  const activeDay = propActiveDay ?? localActiveDay;
  const activeSessionType = propActiveSessionType ?? localActiveSessionType;

  const setActiveDay = (day: EventDay) => {
    if (propSetActiveDay) propSetActiveDay(day);
    else setLocalActiveDay(day);

    if (day !== 'Day 1' && activeSessionType === 'Meal') {
      if (propSetActiveSessionType) propSetActiveSessionType('Snack');
      else setLocalActiveSessionType('Snack');
    }
  };

  const setActiveSessionType = (type: 'Snack' | 'Meal') => {
    if (propSetActiveSessionType) propSetActiveSessionType(type);
    else setLocalActiveSessionType(type);
  };

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const { playSuccess, playDuplicate, playUnknown } = useScanAudio();

  // Full NEXUS session key: "Day 1 Snack", "Day 1 Meal", "Day 2 Snack", "Day 3 Snack"
  const currentSession = `${activeDay} ${activeSessionType}`;
  const currentSessionDisplay = `${activeDay} • ${activeSessionType}`;

  // NEXUS schedule rule:
  // Day 1: Snack, Meal
  // Day 2: Snack
  // Day 3: Snack
  const availableSessionTypes: ('Snack' | 'Meal')[] = activeDay === 'Day 1' ? ['Snack', 'Meal'] : ['Snack'];

  const handleSelectDay = (day: EventDay) => {
    setActiveDay(day);
  };

  // Load latest stats for the active session
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboard(currentSession);
      setDashboardData(data);
    } catch (err) {
      console.error('[Fetch Stats Error]', err);
    }
  }, [currentSession]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fast scan processor
  const processCardScan = useCallback(async (cardId: string) => {
    if (isProcessingScan) return;
    try {
      setIsProcessingScan(true);
      const response = await api.scanCard(cardId, currentSession);
      setScanResult(response);

      if (response.status === 'recorded') {
        playSuccess();
      } else if (response.status === 'already_recorded') {
        playDuplicate();
      } else if (response.status === 'not_found' || response.status === 'inactive') {
        playUnknown();
      } else if (response.status === 'error') {
        playUnknown();
      }

      await fetchStats();
    } catch (err: any) {
      setScanResult({
        status: 'error',
        message: err.message || 'Connection lost to server'
      });
      playUnknown();
    } finally {
      setIsProcessingScan(false);
    }
  }, [currentSession, fetchStats, isProcessingScan, playSuccess, playDuplicate, playUnknown]);

  // Reset / Clear specific collection record
  const handleResetRecord = async (result: ScanResponse) => {
    try {
      await api.deleteMealRecord({
        recordId: result.recordId,
        studentId: result.student?.id,
        session: result.session || currentSession,
        mealType: result.session || currentSession,
        mealDate: result.mealDate
      });
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

  // Current session collection count from dashboard
  const getSessionCount = (): number => {
    if (!dashboardData?.dayCollections) return 0;
    if (activeDay === 'Day 1') {
      return activeSessionType === 'Meal'
        ? dashboardData.dayCollections.day1?.meal || 0
        : dashboardData.dayCollections.day1?.snack || 0;
    }
    if (activeDay === 'Day 2') {
      return dashboardData.dayCollections.day2?.snack || 0;
    }
    if (activeDay === 'Day 3') {
      return dashboardData.dayCollections.day3?.snack || 0;
    }
    return 0;
  };

  const totalParticipants = dashboardData?.totalStudents || 126;
  const currentCount = getSessionCount();
  const currentPct = totalParticipants > 0 ? Number(((currentCount / totalParticipants) * 100).toFixed(2)) : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-xl mx-auto px-4 py-3 pb-28 bg-slate-50">
      {/* Top Event Day & Session Selector - Specially designed for mobile finger taps */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3 mb-3">
        {/* DAY SECTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              NEXUS DAY
            </span>
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
              {activeDay}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {days.map((d) => {
              const isSelected = activeDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={`
                    h-12 min-h-[48px] rounded-2xl font-black text-sm transition-all duration-150 flex items-center justify-center select-none active:scale-95 shadow-sm
                    ${isSelected
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-slate-900/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* SESSION SECTION (Dependent on Selected Day) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {activeDay} SESSION
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {activeSessionType}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableSessionTypes.map((type) => {
              const isSelected = activeSessionType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveSessionType(type)}
                  className={`
                    h-12 min-h-[48px] rounded-2xl font-black text-sm transition-all duration-150 flex items-center justify-center select-none active:scale-95 shadow-sm
                    ${availableSessionTypes.length === 1 ? 'col-span-2' : ''}
                    ${isSelected
                      ? 'bg-brand-500 text-white ring-2 ring-brand-500 shadow-brand-500/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }
                  `}
                >
                  {type.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prominent Session Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="truncate">
            <span className="text-xs font-black text-slate-900 tracking-wider">
              NEXUS • {activeDay.toUpperCase()} • {activeSessionType.toUpperCase()}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
          Ready to Scan
        </span>
      </div>

      {/* Main Scanner Section */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <NFCVisualizer
          isScanning={isScanningActive || isNFCScanning}
          status={scanResult ? scanResult.status : 'idle'}
          onTapVisualizer={toggleScanningState}
        />

        <div className="text-center mb-4">
          <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Tap NFC card against phone
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            Card roll number will record for {currentSessionDisplay}
          </div>
        </div>

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
      <DailySummaryCard
        mealType={currentSession}
        sessionLabel={`${activeDay} • ${activeSessionType}`}
        count={currentCount}
        total={totalParticipants}
        percentage={Math.round(currentPct)}
      />

      {/* Live Recent Scans Feed */}
      <RecentScansFeed
        scans={dashboardData?.recentScans || []}
        onViewAllHistory={onNavigateToTab ? () => onNavigateToTab('history') : undefined}
      />

      {/* Overlays & Sheets */}
      <ScanResultOverlay
        scanResult={scanResult}
        sessionLabel={currentSessionDisplay}
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
