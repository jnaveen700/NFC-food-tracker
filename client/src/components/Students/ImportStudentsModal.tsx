import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle } from 'lucide-react';
import { BottomSheet } from '../UI/BottomSheet';
import { Button } from '../UI/Button';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: any[]) => Promise<{ message: string; inserted: number; skipped: number }>;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const defaultSample = JSON.stringify(
    [
      { name: "Aditi Joshi", roll_number: "23CSE1021", card_id: "NFC-23CSE1021", department: "CSE", year: 2 },
      { name: "Rahul Deshmukh", roll_number: "23ECE1022", card_id: "NFC-23CSE1022", department: "ECE", year: 3 }
    ],
    null,
    2
  );

  const [jsonText, setJsonText] = useState(defaultSample);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFeedback(null);

      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setError('JSON payload must be an array of student objects');
        return;
      }

      const res = await onImport(parsed);
      setFeedback(`Successfully imported ${res.inserted} student(s)! ${res.skipped} skipped.`);
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Import Participants (JSON)">
      <div className="space-y-4">
        {feedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {feedback}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold">
            {error}
          </div>
        )}

        <div className="text-xs text-slate-600 font-medium">
          Paste participant objects in JSON format to bulk register fest participants:
        </div>

        <div className="relative">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={8}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none shadow-sm"
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          onClick={handleImport}
          icon={<Upload className="w-4 h-4" />}
        >
          Import Participants Array
        </Button>
      </div>
    </BottomSheet>
  );
};
