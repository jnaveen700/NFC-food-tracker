import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Upload, Users } from 'lucide-react';
import { Student, MealRecord } from '../types';
import { api } from '../services/api';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { StudentListItem } from '../components/Students/StudentListItem';
import { StudentProfileSheet } from '../components/Students/StudentProfileSheet';
import { AddStudentModal } from '../components/Students/AddStudentModal';
import { ImportStudentsModal } from '../components/Students/ImportStudentsModal';

interface StudentsPageProps {
  initialCardIdForAdd?: string;
  onClearInitialCardId?: () => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  initialCardIdForAdd,
  onClearInitialCardId
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Sheet / Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentHistory, setStudentHistory] = useState<MealRecord[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(Boolean(initialCardIdForAdd));
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await api.getStudents({
        search: searchTerm,
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined
      });
      setStudents(list);
    } catch (err) {
      console.error('[Students Fetch Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDepartment]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (initialCardIdForAdd) {
      setIsAddModalOpen(true);
    }
  }, [initialCardIdForAdd]);

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
    try {
      const res = await api.getStudentDetail(student.id);
      setStudentHistory(res.history);
    } catch (err) {
      console.error('[Student Detail Error]', err);
    }
  };

  const handleSaveStudent = async (data: Partial<Student>) => {
    if (editingStudent) {
      await api.updateStudent(editingStudent.id, data);
    } else {
      await api.createStudent(data);
    }
    if (onClearInitialCardId) onClearInitialCardId();
    fetchStudents();
  };

  const handleToggleActive = async (student: Student) => {
    const updated = await api.updateStudent(student.id, { active: student.active ? 0 : 1 });
    setSelectedStudent(updated);
    fetchStudents();
  };

  const handleDeleteStudent = async (id: number) => {
    await api.deleteStudent(id);
    fetchStudents();
  };

  const departments = ['ALL', 'CSD', 'AIML'];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-3 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Participant Roster</h1>
          <p className="text-xs text-slate-500 font-medium">
            {students.length} registered fest participants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            icon={<Upload className="w-4 h-4 text-brand-600" />}
          >
            Import
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingStudent(null);
              setIsAddModalOpen(true);
            }}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add Participant
          </Button>
        </div>
      </div>

      {/* Search & Dept Filters */}
      <div className="space-y-3">
        <Input
          placeholder="Search by name, roll no, NFC card..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedDepartment === dept
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Student Roster List */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center my-6 shadow-sm">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No participants found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search term or department filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((st) => (
            <StudentListItem
              key={st.id}
              student={st}
              onClick={handleSelectStudent}
            />
          ))}
        </div>
      )}

      {/* Student Profile Sheet */}
      <StudentProfileSheet
        student={selectedStudent}
        history={studentHistory}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onEditStudent={(st) => {
          setIsProfileOpen(false);
          setEditingStudent(st);
          setIsAddModalOpen(true);
        }}
        onToggleActive={handleToggleActive}
        onDeleteStudent={handleDeleteStudent}
      />

      {/* Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
          if (onClearInitialCardId) onClearInitialCardId();
        }}
        onSave={handleSaveStudent}
        editStudent={editingStudent}
        initialCardId={initialCardIdForAdd}
      />

      {/* Import Students Modal */}
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(list) => api.importStudents(list)}
      />
    </div>
  );
};
