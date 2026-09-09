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
      className="p-3.5 bg-dark-card hover:bg-zinc-800/80 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
            student.active
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
          }`}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-100 truncate">{student.name}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                student.active ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-zinc-600'
              }`}
              title={student.active ? 'Active' : 'Inactive'}
            />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
            <span>{student.roll_number}</span>
            <span>•</span>
            <span>{student.department} ({student.year} Yr)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 text-zinc-500">
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300">
          <CreditCard className="w-3 h-3 text-brand-400" />
          <span>{student.card_id}</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};
