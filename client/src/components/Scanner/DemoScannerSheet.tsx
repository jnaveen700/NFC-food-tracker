import React, { useState } from 'react';
import { Smartphone, Zap, Sparkles } from 'lucide-react';
import { BottomSheet } from '../UI/BottomSheet';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Badge } from '../UI/Badge';

interface DemoScannerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: (cardId: string) => void;
  isLoading?: boolean;
}

export const DemoScannerSheet: React.FC<DemoScannerSheetProps> = ({
  isOpen,
  onClose,
  onSimulateScan,
  isLoading = false
}) => {
  const [customCardId, setCustomCardId] = useState('NFC-23CSE1001');

  const demoCards = [
    { label: 'Karthikeya R (CSD 4th Yr)', cardId: 'NFC-23CSE1001' },
    { label: 'Priya Sharma (CSE 3rd Yr)', cardId: 'NFC-23CSE1002' },
    { label: 'Arjun Reddy (ECE 2nd Yr)', cardId: 'NFC-23CSE1003' },
    { label: 'Unrecognized / New Card', cardId: 'NFC-99999999' }
  ];

  const handleSimulate = (cardIdToUse?: string) => {
    const target = cardIdToUse || customCardId;
    if (!target.trim()) return;
    onSimulateScan(target.trim());
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Demo NFC Scanner">
      <div className="space-y-4">
        {/* Banner */}
        <div className="p-3 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-slate-900 block">Demo Scanner Mode</span>
              <span className="text-slate-600">Simulates NFC card tap against real API endpoint</span>
            </div>
          </div>
          <Badge variant="brand" size="sm">Active</Badge>
        </div>

        {/* Quick select cards */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Student Card to Tap
          </label>
          <div className="grid grid-cols-1 gap-2">
            {demoCards.map((card) => (
              <button
                key={card.cardId}
                onClick={() => {
                  setCustomCardId(card.cardId);
                  handleSimulate(card.cardId);
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between transition-all group active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {card.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{card.cardId}</div>
                </div>
                <Zap className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Manual Card Input */}
        <div className="pt-2 border-t border-slate-200">
          <Input
            label="Or Enter Custom Card ID"
            value={customCardId}
            onChange={(e) => setCustomCardId(e.target.value)}
            placeholder="e.g. NFC-23CSE1001"
            icon={<Smartphone className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          onClick={() => handleSimulate()}
          icon={<Zap className="w-5 h-5" />}
        >
          Simulate NFC Tap
        </Button>
      </div>
    </BottomSheet>
  );
};
