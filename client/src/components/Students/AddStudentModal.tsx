import React, { useState, useEffect } from 'react';
import { User, CreditCard, BookOpen, Calendar, Save } from 'lucide-react';
import { Student } from '../../types';
import { BottomSheet } from '../UI/BottomSheet';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => Promise<void>;
  editStudent?: Student | null;
  initialCardId?: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editStudent,
  initialCardId
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [cardId, setCardId] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editStudent) {
      setName(editStudent.name);
      setRollNumber(editStudent.roll_number);
      setCardId(editStudent.card_id);
      setDepartment(editStudent.department);
      setYear(editStudent.year);
    } else {
      setName('');
      setRollNumber('');
      setCardId(initialCardId || '');
      setDepartment('CSE');
      setYear(3);
    }
    setError('');
  }, [editStudent, initialCardId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim() || !cardId.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onSave({
        id: editStudent ? editStudent.id : undefined,
        name: name.trim(),
        roll_number: rollNumber.trim().toUpperCase(),
        card_id: cardId.trim().toUpperCase(),
        department,
        year: Number(year)
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editStudent ? 'Edit Participant Details' : 'Register New Participant'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          placeholder="e.g. Karthikeya R"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          icon={<User className="w-4 h-4 text-slate-400" />}
        />

        <Input
          label="Roll Number / Participant ID"
          placeholder="e.g. 23AK1A3218"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
          icon={<BookOpen className="w-4 h-4 text-slate-400" />}
        />

        <Input
          label="NFC Pass Card ID"
          placeholder="e.g. NFC-23CSE1001"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          required
          icon={<CreditCard className="w-4 h-4 text-slate-400" />}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-12 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="CSD">CSD</option>
              <option value="AIML">AIML</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full h-12 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none"
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            icon={<Save className="w-4 h-4" />}
          >
            {editStudent ? 'Save Changes' : 'Register Participant'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
