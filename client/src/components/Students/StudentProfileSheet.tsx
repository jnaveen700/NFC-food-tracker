import React, { useState } from 'react';
import { CreditCard, Edit3, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Student, MealRecord } from '../../types';
import { BottomSheet } from '../UI/BottomSheet';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';

interface StudentProfileSheetProps {
  student: Student | null;
  history: MealRecord[];
  isOpen: boolean;
  onClose: () => void;
  onEditStudent: (student: Student) => void;
  onToggleActive: (student: Student) => void;
  onDeleteStudent: (id: number) => void;
}

export const StudentProfileSheet: React.FC<StudentProfileSheetProps> = ({
  student,
  history,
  isOpen,
  onClose,
  onEditStudent,
  onToggleActive,
  onDeleteStudent
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!student) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Participant Details">
      <div className="space-y-5">
        {/* Header Profile Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-extrabold text-base">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{student.name}</h3>
                <Badge variant={student.active ? 'success' : 'neutral'}>
                  {student.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Roll No: <span className="text-slate-800 font-bold">{student.roll_number}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">Department</span>
            <span className="text-xs font-bold text-slate-900">{student.department}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">Academic Year</span>
            <span className="text-xs font-bold text-slate-900">{student.year} Year</span>
          </div>
          <div className="col-span-2 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 block">NFC Pass Card ID</span>
              <span className="text-xs font-mono font-bold text-brand-700">{student.card_id}</span>
            </div>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Food Session Allowance Card (3 Snacks + 1 Meal) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Food Session Quota (4 Sessions)
            </span>
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
              {history.length} / 4 Collected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Day 1 Snack */}
            <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
              <span className="font-semibold text-slate-700">Day 1 Snack</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                history.some((h) => h.meal_type === 'Day 1 Snack') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {history.some((h) => h.meal_type === 'Day 1 Snack') ? 'Collected' : 'Not Collected'}
              </span>
            </div>

            {/* Day 1 Meal */}
            <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
              <span className="font-semibold text-slate-700">Day 1 Meal</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                history.some((h) => h.meal_type === 'Day 1 Meal') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {history.some((h) => h.meal_type === 'Day 1 Meal') ? 'Collected' : 'Not Collected'}
              </span>
            </div>

            {/* Day 2 Snack */}
            <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
              <span className="font-semibold text-slate-700">Day 2 Snack</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                history.some((h) => h.meal_type === 'Day 2 Snack') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {history.some((h) => h.meal_type === 'Day 2 Snack') ? 'Collected' : 'Not Collected'}
              </span>
            </div>

            {/* Day 3 Snack */}
            <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
              <span className="font-semibold text-slate-700">Day 3 Snack</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                history.some((h) => h.meal_type === 'Day 3 Snack') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {history.some((h) => h.meal_type === 'Day 3 Snack') ? 'Collected' : 'Not Collected'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onEditStudent(student)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Details
          </Button>

          <Button
            variant={student.active ? 'secondary' : 'primary'}
            size="sm"
            fullWidth
            onClick={() => onToggleActive(student)}
            icon={student.active ? <XCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4" />}
          >
            {student.active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>

        {/* Food Token History Log */}
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            Food Token Redemption History
          </h4>

          {history.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No food tokens redeemed yet for this participant.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-700 uppercase text-[10px]">
                      {record.meal_type === 'Dinner' ? 'Full Meal Token' : 'Snack Token'}
                    </span>
                    <span className="text-slate-700 font-medium">{record.meal_date}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] font-mono">
                    {record.formatted_time || record.scanned_at}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirm */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Student
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Confirm deletion?</span>
              <button
                onClick={() => {
                  onDeleteStudent(student.id);
                  onClose();
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
