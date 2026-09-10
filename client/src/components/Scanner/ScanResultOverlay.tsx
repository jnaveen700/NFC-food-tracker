import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, AlertCircle, ArrowRight, UserPlus, RefreshCw, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { ScanResponse } from '../../types';
import { Button } from '../UI/Button';

interface ScanResultOverlayProps {
  scanResult: ScanResponse | null;
  sessionLabel?: string;
  onDismiss: () => void;
  onAddStudentClick?: (cardId?: string) => void;
  onResetRecord?: (result: ScanResponse) => Promise<void>;
}

export const ScanResultOverlay: React.FC<ScanResultOverlayProps> = ({
  scanResult,
  sessionLabel,
  onDismiss,
  onAddStudentClick,
  onResetRecord
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Reset local state when a new scan arrives or dismiss happens
  useEffect(() => {
    setShowResetConfirm(false);
    setIsResetting(false);
    setResetSuccess(false);
    setResetError(null);
  }, [scanResult]);

  if (!scanResult) return null;

  const isSuccess = scanResult.status === 'recorded';
  const isDuplicate = scanResult.status === 'already_recorded';
  const isUnknown = scanResult.status === 'not_found';
  const isError = scanResult.status === 'error' || scanResult.status === 'inactive';

  // Compute readable session display (e.g., "Day 1 • Snack")
  const formatSession = (s?: string) => {
    if (!s) return 'Day 1 • Snack';
    if (s.includes('•')) return s;
    if (s === 'Day 1 Snack') return 'Day 1 • Snack';
    if (s === 'Day 1 Meal') return 'Day 1 • Meal';
    if (s === 'Day 2 Snack') return 'Day 2 • Snack';
    if (s === 'Day 3 Snack') return 'Day 3 • Snack';
    return s;
  };
  const displaySession = formatSession(scanResult.sessionLabel || sessionLabel || scanResult.session || scanResult.mealType);

  const handleConfirmReset = async () => {
    if (!onResetRecord || !scanResult) return;
    try {
      setIsResetting(true);
      setResetError(null);
      await onResetRecord(scanResult);
      setResetSuccess(true);
      setTimeout(() => {
        onDismiss();
      }, 2000);
    } catch (err: any) {
      console.error('[Reset Collection Error]', err);
      setResetError(err.message || 'Failed to reset collection record');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`
            w-full max-w-sm rounded-3xl p-6 border text-center shadow-2xl overflow-hidden relative bg-white
            ${resetSuccess
              ? 'border-emerald-500/60 shadow-emerald-500/10'
              : showResetConfirm
              ? 'border-amber-500/80 shadow-amber-500/20'
              : isSuccess
              ? 'border-emerald-500/60 shadow-emerald-500/10'
              : isDuplicate
              ? 'border-rose-500 shadow-rose-500/20'
              : isUnknown
              ? 'border-amber-500/60 shadow-amber-500/10'
              : 'border-slate-300 shadow-slate-900/10'
            }
          `}
        >
          {/* Top Close Button (X) */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ========================================================
              STATE 1: RESET SUCCESS MESSAGE
             ======================================================== */}
          {resetSuccess ? (
            <div className="py-3">
              <div className="flex justify-center mb-4 pt-1">
                <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-emerald-700">
                Collection Reset
              </h2>
              <p className="mt-1 text-sm font-bold text-slate-700">
                The participant can be scanned again.
              </p>

              {scanResult.student && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Participant:</span>
                    <span className="font-extrabold text-slate-900">{scanResult.student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Session:</span>
                    <span className="font-extrabold text-slate-900">{displaySession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Status:</span>
                    <span className="font-extrabold text-amber-600">Not Collected</span>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button variant="primary" fullWidth size="md" onClick={onDismiss}>
                  Scan Again
                </Button>
              </div>
            </div>
          ) : showResetConfirm ? (
            /* ========================================================
               STATE 2: CONFIRMATION DIALOG (Safe POC Demo Flow)
               ======================================================== */
            <div className="py-2">
              <div className="flex justify-center mb-4 pt-1">
                <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
                  <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Reset Collection?
              </h2>

              <p className="mt-2 text-xs font-semibold text-slate-600">
                This will remove the collection record for:
              </p>

              <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-left">
                <div className="text-sm font-extrabold text-rose-950">
                  {scanResult.student?.name || 'Participant'}
                </div>
                <div className="text-xs font-bold text-rose-700 mt-0.5">
                  {displaySession}
                </div>
                <div className="text-[11px] font-medium text-slate-600 mt-2 border-t border-rose-200/60 pt-1.5">
                  The participant will return to <span className="font-bold text-slate-900">Not Collected</span> state and their NFC card can be scanned again immediately.
                </div>
              </div>

              {resetError && (
                <div className="mt-3 p-2 bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-700">
                  {resetError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-6">
                <Button
                  variant="outline"
                  size="md"
                  disabled={isResetting}
                  onClick={() => setShowResetConfirm(false)}
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
          ) : (
            /* ========================================================
               STATE 3: STANDARD SCAN RESULT (Success, Duplicate, Unknown, Error)
               ======================================================== */
            <>
              {/* Icon Badge */}
              <div className="flex justify-center mb-4 pt-1">
                {isSuccess && (
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                )}

                {isDuplicate && (
                  <div className="w-20 h-20 rounded-full bg-rose-100 border-2 border-rose-600 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/20 animate-pulse">
                    <AlertTriangle className="w-10 h-10 stroke-[3]" />
                  </div>
                )}

                {isUnknown && (
                  <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <HelpCircle className="w-10 h-10 stroke-[2.5]" />
                  </div>
                )}

                {isError && (
                  <div className="w-20 h-20 rounded-full bg-rose-100 border-2 border-rose-500 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Status Title with NEXUS Terminology */}
              <h2 className={`text-2xl font-black tracking-tight ${
                isSuccess
                  ? 'text-emerald-700'
                  : isDuplicate
                  ? 'text-rose-600'
                  : isUnknown
                  ? 'text-amber-700'
                  : 'text-slate-900'
              }`}>
                {isSuccess && '✓ COLLECTION RECORDED'}
                {isDuplicate && 'ALREADY COLLECTED'}
                {isUnknown && 'Participant Not Found'}
                {isError && (scanResult.message || 'Scan Failed')}
              </h2>

              {/* Duplicate Notice */}
              {isDuplicate && (
                <div className="mt-1 font-bold text-xs text-rose-600 uppercase tracking-wider">
                  This participant has already collected for this session
                </div>
              )}

              {/* Participant Info */}
              {scanResult.student ? (
                <div className={`mt-3 py-3 px-4 rounded-2xl border text-left ${
                  isDuplicate
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Participant
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    {scanResult.student.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">
                    Roll No: <span className="font-bold text-slate-900">{scanResult.student.roll_number}</span> • {scanResult.student.department} ({scanResult.student.year} Yr)
                  </div>
                </div>
              ) : isUnknown ? (
                <div className="mt-3 py-2 text-xs text-slate-600">
                  Card ID: <code className="px-2 py-1 bg-slate-100 rounded font-mono text-slate-800 font-bold">{scanResult.cardId}</code>
                  <p className="mt-2 text-slate-500">This NFC card is not linked to any registered participant.</p>
                </div>
              ) : null}

              {/* Session & Status Details */}
              {(isSuccess || isDuplicate) && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      Session
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {displaySession}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      Status
                    </span>
                    <span className={`font-extrabold px-2 py-0.5 rounded-md text-[11px] ${
                      isDuplicate
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isDuplicate ? 'Already Collected' : 'Collected'}
                    </span>
                  </div>

                  {scanResult.formattedTime && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400 font-medium">Time:</span>
                      <span className="font-mono font-semibold text-slate-600">
                        {scanResult.formattedTime}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col gap-2">
                {(isSuccess || isDuplicate) && (
                  <>
                    <Button
                      variant={isDuplicate ? 'danger' : 'primary'}
                      fullWidth
                      size="lg"
                      onClick={onDismiss}
                      icon={<ArrowRight className="w-5 h-5" />}
                    >
                      Scan Another
                    </Button>

                    {/* Secondary Reset Collection Button for Demo POC */}
                    {onResetRecord && (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reset Collection</span>
                      </button>
                    )}
                  </>
                )}

                {isUnknown && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={onDismiss}
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        onDismiss();
                        if (onAddStudentClick) onAddStudentClick(scanResult.cardId);
                      }}
                      icon={<UserPlus className="w-4 h-4" />}
                    >
                      Add Participant
                    </Button>
                  </div>
                )}

                {isError && (
                  <Button variant="primary" fullWidth size="md" onClick={onDismiss}>
                    Dismiss
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

