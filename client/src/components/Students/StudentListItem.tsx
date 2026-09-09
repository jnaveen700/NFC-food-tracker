import React from 'react';
import { ChevronRight, CreditCard } from 'lucide-react';
import { Student } from '../../types';

interface StudentListItemProps {
  student: Student;
  onClick: (student: Student) => void;
}

export const StudentListItem: React.FC<StudentListItemProps> = ({ student, onClick }) => {
  return (
    <div
      onClick={() => onClick(student)}
      className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] select-none shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
            student.active
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{student.name}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                student.active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-slate-300'
              }`}
              title={student.active ? 'Active' : 'Inactive'}
            />
          </div>
          <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-slate-800">{student.roll_number}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">{student.department} ({student.year} Yr)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 text-slate-400">
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold">
          <CreditCard className="w-3 h-3 text-brand-600" />
          <span>{student.card_id}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};
