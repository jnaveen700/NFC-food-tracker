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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Student Profile">
      <div className="space-y-5">
        {/* Header Profile Card */}
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-extrabold text-base">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-100">{student.name}</h3>
                <Badge variant={student.active ? 'success' : 'neutral'}>
                  {student.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Roll No: <span className="text-zinc-200 font-bold">{student.roll_number}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-dark-card border border-zinc-800 rounded-xl">
            <span className="text-[10px] font-semibold uppercase text-zinc-400 block">Department</span>
            <span className="text-xs font-bold text-zinc-200">{student.department}</span>
          </div>
          <div className="p-3 bg-dark-card border border-zinc-800 rounded-xl">
            <span className="text-[10px] font-semibold uppercase text-zinc-400 block">Academic Year</span>
            <span className="text-xs font-bold text-zinc-200">{student.year} Year</span>
          </div>
          <div className="col-span-2 p-3 bg-dark-card border border-zinc-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase text-zinc-400 block">NFC Card Identifier</span>
              <span className="text-xs font-mono font-bold text-brand-400">{student.card_id}</span>
            </div>
            <CreditCard className="w-4 h-4 text-zinc-400" />
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
            Edit Student
          </Button>

          <Button
            variant={student.active ? 'secondary' : 'primary'}
            size="sm"
            fullWidth
            onClick={() => onToggleActive(student)}
            icon={student.active ? <XCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4" />}
          >
            {student.active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>

        {/* Meal History Log */}
        <div className="pt-3 border-t border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            Recent Attendance History
          </h4>

          {history.length === 0 ? (
            <div className="p-3 bg-dark-card border border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No meal scans recorded yet for this student.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="p-2.5 bg-dark-card border border-zinc-800/60 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-400 uppercase text-[10px]">
                      {record.meal_type}
                    </span>
                    <span className="text-zinc-300 font-medium">{record.meal_date}</span>
                  </div>
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {record.formatted_time || record.scanned_at}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirm */}
        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Student
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Confirm deletion?</span>
              <button
                onClick={() => {
                  onDeleteStudent(student.id);
                  onClose();
                }}
                className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1 bg-zinc-800 text-zinc-300 font-bold rounded-lg text-xs"
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
