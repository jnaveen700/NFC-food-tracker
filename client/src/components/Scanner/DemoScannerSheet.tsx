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
  const [customCardId, setCustomCardId] = useState('23AK1A3218');

  const demoCards = [
    { label: 'Karthikeya R (CSD 4th Yr)', rollNumber: '23AK1A3218' },
    { label: 'ARSHIYA K (CSD 4th Yr)', rollNumber: '23AK1A3201' },
    { label: 'Unregistered NFC Card', rollNumber: '99AK9A9999' }
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
              <span className="font-extrabold text-slate-900 block">NFC Simulation Mode</span>
              <span className="text-slate-600">Simulates physical NFC card tap with plain roll number</span>
            </div>
          </div>
          <Badge variant="brand" size="sm">Active</Badge>
        </div>

        {/* Quick select cards */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Participant Card to Tap
          </label>
          <div className="grid grid-cols-1 gap-2">
            {demoCards.map((card) => (
              <button
                key={card.rollNumber}
                onClick={() => {
                  setCustomCardId(card.rollNumber);
                  handleSimulate(card.rollNumber);
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between transition-all group active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {card.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{card.rollNumber}</div>
                </div>
                <Zap className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Manual Card Input */}
        <div className="pt-2 border-t border-slate-200">
          <Input
            label="Or Enter Roll Number"
            value={customCardId}
            onChange={(e) => setCustomCardId(e.target.value)}
            placeholder="e.g. 23AK1A3218"
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
