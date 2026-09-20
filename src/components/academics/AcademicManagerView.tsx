import React, { useState } from 'react';
import { useAcademics, Subject } from '../../contexts/AcademicContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SubjectCard } from './SubjectCard';
import { SubjectDetailModal } from './SubjectDetailModal';
import { SubjectFormModal } from './SubjectFormModal';
import { MarksEntryModal } from './MarksEntryModal';
import { GradingSchemeModal } from './GradingSchemeModal';
import { AttendanceTrackerView } from './AttendanceTrackerView';
import { MarksMatrixView } from './MarksMatrixView';
import { AcademicAnalyticsView } from './AcademicAnalyticsView';
import { AcademicGoalsView } from './AcademicGoalsView';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Plus,
  Settings2,
  FileSpreadsheet,
  BarChart3,
  Target,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export type AcademicTab =
  | 'dashboard'
  | 'marks_matrix'
  | 'attendance'
  | 'analytics'
  | 'goals';

export const AcademicManagerView: React.FC = () => {
  const {
    subjects,
    subjectCalculations,
    summary,
    gradingConfig,
    addSubject,
    updateSubject,
    deleteSubject,
    logAttendance,
    resetToDefaultSubjects,
    isLoading,
    isSyncing,
  } = useAcademics();

  // Tab State
  const [activeTab, setActiveTab] = useState<AcademicTab>('dashboard');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'strong' | 'needs_attention'>('all');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);
  const [marksEntrySubject, setMarksEntrySubject] = useState<Subject | null>(null);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);

  // Subject Handlers
  const handleOpenCreate = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (window.confirm(`Are you sure you want to remove "${subject.name}" (${subject.code})?`)) {
      await deleteSubject(subject.id);
    }
  };

  const handleSaveSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'userId'>) => {
    if (editingSubject) {
      await updateSubject(editingSubject.id, subjectData);
    } else {
      await addSubject(subjectData);
    }
  };

  // Filtered Subjects for Dashboard
  const filteredSubjects = subjects.filter((sub) => {
    const calc = subjectCalculations.get(sub.id);
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.facultyName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'strong') return calc?.status === 'strong';
    if (statusFilter === 'needs_attention') return calc?.status === 'needs_attention';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-blue-400" />
              <span>Academic Management OS</span>
            </h2>
            {isSyncing && (
              <Badge variant="blue" size="sm" className="animate-pulse">
                Syncing Firestore...
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time GPA forecasting, continuous assessment matrix, attendance eligibility buffers, and configurable university grading scales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Settings2 className="w-4 h-4 text-purple-400" />}
            onClick={() => setIsSchemeModalOpen(true)}
          >
            Scheme: {gradingConfig.preset === 'custom' ? 'Custom Weights' : gradingConfig.name.split(' ')[0]}
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* 2. Top Cumulative Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Weighted Average</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {summary.creditWeightedPercentage}%
            </span>
            <span className="text-xs font-mono text-blue-400">
              GPA {summary.overallGpa4.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {summary.totalCredits} Credits Enrolled
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Overall Attendance</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {summary.overallAttendancePercentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({summary.totalClassesAttended}/{summary.totalClassesConducted})
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 truncate">
            Min Requirement: {gradingConfig.minAttendanceThreshold}%
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Strong Subjects</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {summary.strongSubjects.length}
            </span>
            <span className="text-xs text-slate-400">
              / {summary.totalSubjects}
            </span>
          </div>
          <p className="text-[11px] text-purple-300 mt-1 truncate">
            Exceeding 85% Benchmark
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
              {summary.needsAttentionSubjects.length}
            </span>
            <span className="text-xs text-slate-400">Courses</span>
          </div>
          <p className="text-[11px] text-rose-300 mt-1 truncate">
            Target Gap or Shortage
          </p>
        </GlassCard>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subject Cards ({subjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marks_matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'marks_matrix'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Marks Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance Tracker</span>
            {summary.attendanceWarningSubjects.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Academic Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Goals & Exam Planner</span>
          </button>
        </div>

        <button
          type="button"
          onClick={resetToDefaultSubjects}
          className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer whitespace-nowrap"
          title="Reset to default engineering courses"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject code, name, or faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Courses ({subjects.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('strong')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === 'strong'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Strong ({summary.strongSubjects.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('needs_attention')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === 'needs_attention'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Attention ({summary.needsAttentionSubjects.length})
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          {filteredSubjects.length === 0 ? (
            <GlassCard className="p-8 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Subjects Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No course matches your search filter.'
                  : 'Start tracking your academic subjects, grades, and attendance.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenCreate}
              >
                Create Subject
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((subject) => {
                const calc = subjectCalculations.get(subject.id);
                if (!calc) return null;
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    calculation={calc}
                    onOpenDetails={(s) => setDetailSubject(s)}
                    onOpenMarksEntry={(s) => setMarksEntrySubject(s)}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteSubject}
                    onLogAttendance={(id, type) => logAttendance(id, type)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'marks_matrix' && <MarksMatrixView />}

      {activeTab === 'attendance' && <AttendanceTrackerView />}

      {activeTab === 'analytics' && <AcademicAnalyticsView />}

      {activeTab === 'goals' && <AcademicGoalsView />}

      {/* Modals */}
      <SubjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingSubject={editingSubject}
        onSave={handleSaveSubject}
      />

      <SubjectDetailModal
        isOpen={Boolean(detailSubject)}
        onClose={() => setDetailSubject(null)}
        subject={detailSubject}
        calculation={detailSubject ? subjectCalculations.get(detailSubject.id) || null : null}
        gradingConfig={gradingConfig}
        onOpenMarksEntry={(s) => setMarksEntrySubject(s)}
        onEditSubject={(s) => handleOpenEdit(s)}
      />

      <MarksEntryModal
        isOpen={Boolean(marksEntrySubject)}
        onClose={() => setMarksEntrySubject(null)}
        subject={marksEntrySubject}
      />

      <GradingSchemeModal
        isOpen={isSchemeModalOpen}
        onClose={() => setIsSchemeModalOpen(false)}
      />
    </div>
  );
};
