import React, { useState, useEffect } from 'react';
import { Subject } from '../../contexts/AcademicContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Check } from 'lucide-react';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject: Subject | null;
  onSave: (subjectData: Omit<Subject, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
}

const COLOR_PRESETS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Rose', value: '#EC4899' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Cyan', value: '#06B6D4' },
];

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  isOpen,
  onClose,
  editingSubject,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [facultyName, setFacultyName] = useState('');
  const [targetMarks, setTargetMarks] = useState<number>(85);
  const [attended, setAttended] = useState<number>(0);
  const [totalClasses, setTotalClasses] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setCode(editingSubject.code);
      setCredits(editingSubject.credits);
      setFacultyName(editingSubject.facultyName);
      setTargetMarks(editingSubject.targetMarks || 85);
      setAttended(editingSubject.attendance?.attended || 0);
      setTotalClasses(editingSubject.attendance?.total || 0);
      setNotes(editingSubject.notes || '');
      setColor(editingSubject.color || '#3B82F6');
    } else {
      setName('');
      setCode('');
      setCredits(3);
      setFacultyName('');
      setTargetMarks(85);
      setAttended(0);
      setTotalClasses(0);
      setNotes('');
      setColor('#3B82F6');
    }
  }, [editingSubject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits: Number(credits) || 3,
        facultyName: facultyName.trim() || 'Faculty Instructor',
        targetMarks: Number(targetMarks) || 85,
        attendance: {
          attended: Number(attended) || 0,
          total: Number(totalClasses) || 0,
        },
        notes: notes.trim(),
        color,
        mid1Marks: editingSubject?.mid1Marks || { scored: 0, max: 30, evaluated: false },
        mid2Marks: editingSubject?.mid2Marks || { scored: 0, max: 30, evaluated: false },
        semesterMarks: editingSubject?.semesterMarks || { scored: 0, max: 100, evaluated: false },
        assignmentMarks: editingSubject?.assignmentMarks || { scored: 0, max: 50, evaluated: false },
        labMarks: editingSubject?.labMarks || { scored: 0, max: 30, evaluated: false },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSubject ? `Edit ${editingSubject.code}` : 'Create Academic Subject'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Subject Name *"
              placeholder="e.g. Data Structures & Algorithms"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="Subject Code *"
              placeholder="e.g. CS 301"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Credits *"
              type="number"
              min={1}
              max={12}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Input
              label="Faculty / Instructor"
              placeholder="e.g. Dr. Benjamin Bennett"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Target Marks (%)"
              type="number"
              min={0}
              max={100}
              value={targetMarks}
              onChange={(e) => setTargetMarks(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Initial Attendance Numbers */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            Attendance Log
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Classes Attended"
              type="number"
              min={0}
              value={attended}
              onChange={(e) => setAttended(Math.max(0, Number(e.target.value)))}
            />
            <Input
              label="Total Classes Conducted"
              type="number"
              min={0}
              value={totalClasses}
              onChange={(e) => setTotalClasses(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Current attendance: {totalClasses > 0 ? ((attended / totalClasses) * 100).toFixed(1) : 100}%
          </p>
        </div>

        {/* Color theme */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Subject Theme Color
          </label>
          <div className="flex items-center gap-2">
            {COLOR_PRESETS.map((col) => (
              <button
                key={col.value}
                type="button"
                onClick={() => setColor(col.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                  color === col.value ? 'border-white scale-110' : 'border-transparent opacity-80'
                }`}
                style={{ backgroundColor: col.value }}
              >
                {color === col.value && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Course Notes & Syllabus Topics
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key exam topics, office hour schedules, textbook references..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
