import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, AlertCircle, ArrowRight, UserPlus, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { ScanResponse } from '../../types';
import { Button } from '../UI/Button';

interface ScanResultOverlayProps {
  scanResult: ScanResponse | null;
  onDismiss: () => void;
  onAddStudentClick?: (cardId?: string) => void;
}

export const ScanResultOverlay: React.FC<ScanResultOverlayProps> = ({
  scanResult,
  onDismiss,
  onAddStudentClick
}) => {
  if (!scanResult) return null;

  const isSuccess = scanResult.status === 'recorded';
  const isDuplicate = scanResult.status === 'already_recorded';
  const isUnknown = scanResult.status === 'not_found';
  const isError = scanResult.status === 'error' || scanResult.status === 'inactive';

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
            ${isSuccess
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

          {/* Icon Badge */}
          <div className="flex justify-center mb-4 pt-2">
            {isSuccess && (
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
            )}

            {/* Already Ate -> Bright VIBRANT RED */}
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

          {/* Status Title */}
          <h2 className={`text-2xl font-extrabold tracking-tight ${
            isSuccess
              ? 'text-emerald-700'
              : isDuplicate
              ? 'text-rose-600'
              : isUnknown
              ? 'text-amber-700'
              : 'text-slate-900'
          }`}>
            {isSuccess && '✓ Food Token Redeemed'}
            {isDuplicate && '❌ TOKEN ALREADY REDEEMED!'}
            {isUnknown && 'Participant Not Found'}
            {isError && (scanResult.message || 'Scan Failed')}
          </h2>

          {/* Subtitle notice for Already Ate */}
          {isDuplicate && (
            <div className="mt-1 font-bold text-xs text-rose-600 uppercase tracking-wider">
              This participant has already redeemed their token for this session
            </div>
          )}

          {/* Participant Info */}
          {scanResult.student ? (
            <div className={`mt-3 py-3 px-4 rounded-2xl border text-left ${
              isDuplicate
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <div className="text-base font-extrabold">{scanResult.student.name}</div>
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

          {/* Token Details */}
          {(isSuccess || isDuplicate) && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className={`uppercase tracking-wider font-extrabold ${isDuplicate ? 'text-rose-600' : 'text-emerald-700'}`}>
                {scanResult.mealType === 'Dinner' ? 'Full Meal Token' : 'Snack Token'}
              </span>
              <span>
                {isDuplicate
                  ? `Redeemed at ${scanResult.formattedTime || 'earlier today'}`
                  : `Redeemed • ${scanResult.formattedTime}`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2">
            {(isSuccess || isDuplicate) && (
              <Button
                variant={isDuplicate ? 'danger' : 'primary'}
                fullWidth
                size="lg"
                onClick={onDismiss}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Scan Next Card
              </Button>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
