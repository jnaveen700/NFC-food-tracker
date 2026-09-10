import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Clock, Radio, Save, LogOut, CheckCircle } from 'lucide-react';
import { AppSettings, User } from '../types';
import { api } from '../services/api';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

interface SettingsPageProps {
  user: User | null;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [messName, setMessName] = useState('');
  const [breakfastStart, setBreakfastStart] = useState('07:00');
  const [breakfastEnd, setBreakfastEnd] = useState('10:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('15:00');
  const [dinnerStart, setDinnerStart] = useState('19:00');
  const [dinnerEnd, setDinnerEnd] = useState('22:00');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const data = await api.getSettings();
        setSettings(data);
        setMessName(data.mess_name || 'Central Hostel Mess');
        setBreakfastStart(data.breakfast_start || '07:00');
        setBreakfastEnd(data.breakfast_end || '10:00');
        setLunchStart(data.lunch_start || '12:00');
        setLunchEnd(data.lunch_end || '15:00');
        setDinnerStart(data.dinner_start || '19:00');
        setDinnerEnd(data.dinner_end || '22:00');
      } catch (err) {
        console.error('[Load Settings Error]', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings({
        mess_name: messName,
        breakfast_start: breakfastStart,
        breakfast_end: breakfastEnd,
        lunch_start: lunchStart,
        lunch_end: lunchEnd,
        dinner_start: dinnerStart,
        dinner_end: dinnerEnd
      });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      console.error('[Save Settings Error]', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isNFCSupported = 'NDEFReader' in window;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-3 pb-24 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">NEXUS Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure fest collection windows & NFC hardware diagnostics
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Web NFC Hardware Diagnostic */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-brand-600" />
            NFC Scanner Hardware
          </h3>
          <Badge variant={isNFCSupported ? 'success' : 'warning'}>
            {isNFCSupported ? 'Web NFC Ready' : 'Demo Mode Fallback'}
          </Badge>
        </div>
        <p className="text-xs text-slate-600">
          {isNFCSupported
            ? 'Web NFC API is available on this Android device. Card taps will register directly.'
            : 'Web NFC is not supported in this browser. Use the "Use Demo Scanner" option to simulate card reads.'}
        </p>
      </div>

      {/* Meal Hours Config Form */}
      <form onSubmit={handleSaveSettings} className="p-4 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Clock className="w-4 h-4 text-brand-600" />
          Configurable Collection Schedule
        </h3>

        <Input
          label="Fest Event Title"
          value={messName}
          onChange={(e) => setMessName(e.target.value)}
        />

        {/* Breakfast window */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Morning Snack Start"
            type="time"
            value={breakfastStart}
            onChange={(e) => setBreakfastStart(e.target.value)}
          />
          <Input
            label="Morning Snack End"
            type="time"
            value={breakfastEnd}
            onChange={(e) => setBreakfastEnd(e.target.value)}
          />
        </div>

        {/* Lunch window */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Afternoon Window Start"
            type="time"
            value={lunchStart}
            onChange={(e) => setLunchStart(e.target.value)}
          />
          <Input
            label="Afternoon Window End"
            type="time"
            value={lunchEnd}
            onChange={(e) => setLunchEnd(e.target.value)}
          />
        </div>

        {/* Dinner window */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Evening Meal Start"
            type="time"
            value={dinnerStart}
            onChange={(e) => setDinnerStart(e.target.value)}
          />
          <Input
            label="Evening Meal End"
            type="time"
            value={dinnerEnd}
            onChange={(e) => setDinnerEnd(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          Save Collection Schedule
        </Button>
      </form>

      {/* Reseed Sample Data */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Reset & Reseed Sample Data
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Resets database and seeds official 126 NEXUS participants (65 CSD + 61 AIML) with 0 collection records.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const res = await api.reseedData();
                setSuccessMsg(res.message);
                setTimeout(() => setSuccessMsg(''), 2500);
              } catch (err: any) {
                console.error(err);
              }
            }}
          >
            Reseed Data
          </Button>
        </div>
      </div>

      {/* Staff Session */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs font-bold text-slate-900">{user?.name || 'NEXUS Fest Volunteer'}</div>
          <div className="text-[11px] text-slate-500 font-mono">{user?.email || 'admin@mess.edu'}</div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          icon={<LogOut className="w-4 h-4 text-rose-500" />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
