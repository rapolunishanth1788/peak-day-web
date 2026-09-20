import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export interface MarksComponent {
  scored: number;
  max: number;
  evaluated?: boolean; // if false or max === 0, component is pending/upcoming
}

export interface Subject {
  id: string;
  userId?: string;
  name: string;
  code: string;
  credits: number;
  facultyName: string;
  mid1Marks: MarksComponent;
  mid2Marks: MarksComponent;
  semesterMarks: MarksComponent;
  assignmentMarks: MarksComponent;
  labMarks: MarksComponent;
  attendance: {
    attended: number;
    total: number;
  };
  targetMarks: number;
  notes: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export type GradingFormulaPreset =
  | 'standard_weighted'
  | 'best_of_mids'
  | 'continuous_eval'
  | 'raw_points'
  | 'custom';

export interface GradingSchemeWeights {
  mid1Weight: number;      // e.g. 15%
  mid2Weight: number;      // e.g. 15%
  semesterWeight: number;  // e.g. 40%
  assignmentWeight: number;// e.g. 15%
  labWeight: number;       // e.g. 15%
}

export interface GradingSchemeConfig {
  preset: GradingFormulaPreset;
  name: string;
  description: string;
  weights: GradingSchemeWeights;
  useBestOfMids: boolean;
  normalizeUnevaluated: boolean; // if true, scales available evaluated components to 100%
  minAttendanceThreshold: number; // e.g. 75%
  targetOverallGpa: number; // e.g. 3.8
  targetOverallPercentage: number; // e.g. 88
}

export interface ComponentCalculationDetail {
  name: string;
  scored: number;
  max: number;
  rawPercentage: number;
  nominalWeight: number;
  effectiveWeight: number;
  weightedContribution: number;
  isEvaluated: boolean;
  statusLabel: string;
}

export interface SubjectCalculation {
  subjectId: string;
  currentPercentage: number;
  rawAggregatePercentage: number;
  targetPercentage: number;
  targetGap: number; // current - target (negative if below target)
  targetProgress: number; // (current / target) * 100
  gradeLetter: string;
  gpaPoint4: number;
  gpaPoint10: number;
  attendancePercentage: number;
  attendanceStatus: 'safe' | 'warning' | 'critical';
  classesNeededForThreshold: number;
  bunksAvailable: number;
  componentDetails: ComponentCalculationDetail[];
  calculationFormulaExplanation: string;
  status: 'strong' | 'average' | 'needs_attention';
  trajectory: 'up' | 'down' | 'steady';
}

export interface AcademicSummary {
  totalSubjects: number;
  totalCredits: number;
  creditWeightedPercentage: number;
  simpleAveragePercentage: number;
  overallGpa4: number;
  overallGpa10: number;
  overallAttendancePercentage: number;
  totalClassesAttended: number;
  totalClassesConducted: number;
  strongSubjects: Subject[];
  needsAttentionSubjects: Subject[];
  attendanceWarningSubjects: Subject[];
  gradeDistribution: Record<string, number>;
}

export const PRESET_SCHEMES: Record<GradingFormulaPreset, { name: string; description: string; weights: GradingSchemeWeights; useBestOfMids: boolean }> = {
  standard_weighted: {
    name: 'Standard Comprehensive Scheme',
    description: 'Balanced university standard: 15% Mid 1, 15% Mid 2, 40% Final Exam, 15% Assignments, 15% Labs.',
    weights: { mid1Weight: 15, mid2Weight: 15, semesterWeight: 40, assignmentWeight: 15, labWeight: 15 },
    useBestOfMids: false,
  },
  best_of_mids: {
    name: 'Best of Mids + Heavy Final',
    description: 'Highest of the two midterms counts for 25%, with 45% Final Exam, 15% Assignments, and 15% Labs.',
    weights: { mid1Weight: 12.5, mid2Weight: 12.5, semesterWeight: 45, assignmentWeight: 15, labWeight: 15 },
    useBestOfMids: true,
  },
  continuous_eval: {
    name: 'Continuous Internal Assessment',
    description: 'Internal heavy: 20% Mid 1, 20% Mid 2, 20% Assignments, 10% Labs, and 30% End-Semester Exam.',
    weights: { mid1Weight: 20, mid2Weight: 20, semesterWeight: 30, assignmentWeight: 20, labWeight: 10 },
    useBestOfMids: false,
  },
  raw_points: {
    name: 'Direct Total Points Aggregate',
    description: 'Sums all scored points divided by total max points across all evaluated assessments.',
    weights: { mid1Weight: 20, mid2Weight: 20, semesterWeight: 20, assignmentWeight: 20, labWeight: 20 },
    useBestOfMids: false,
  },
  custom: {
    name: 'Custom User Configured Scheme',
    description: 'Personalized component weights and assessment rules tailored to your university curriculum.',
    weights: { mid1Weight: 15, mid2Weight: 15, semesterWeight: 40, assignmentWeight: 15, labWeight: 15 },
    useBestOfMids: false,
  },
};

export const DEFAULT_GRADING_CONFIG: GradingSchemeConfig = {
  preset: 'standard_weighted',
  name: PRESET_SCHEMES.standard_weighted.name,
  description: PRESET_SCHEMES.standard_weighted.description,
  weights: PRESET_SCHEMES.standard_weighted.weights,
  useBestOfMids: false,
  normalizeUnevaluated: true,
  minAttendanceThreshold: 75,
  targetOverallGpa: 3.8,
  targetOverallPercentage: 88,
};

export function percentageToGrade(pct: number): { letter: string; gpa4: number; gpa10: number } {
  if (pct >= 93) return { letter: 'A+', gpa4: 4.0, gpa10: 10.0 };
  if (pct >= 88) return { letter: 'A', gpa4: 4.0, gpa10: 9.5 };
  if (pct >= 83) return { letter: 'A-', gpa4: 3.7, gpa10: 9.0 };
  if (pct >= 78) return { letter: 'B+', gpa4: 3.3, gpa10: 8.5 };
  if (pct >= 73) return { letter: 'B', gpa4: 3.0, gpa10: 8.0 };
  if (pct >= 68) return { letter: 'B-', gpa4: 2.7, gpa10: 7.5 };
  if (pct >= 63) return { letter: 'C+', gpa4: 2.3, gpa10: 7.0 };
  if (pct >= 58) return { letter: 'C', gpa4: 2.0, gpa10: 6.5 };
  if (pct >= 50) return { letter: 'D', gpa4: 1.0, gpa10: 5.5 };
  return { letter: 'F', gpa4: 0.0, gpa10: 0.0 };
}

// Initial realistic default subjects for student-athlete seed
const INITIAL_DEMO_SUBJECTS: Omit<Subject, 'id' | 'userId' | 'createdAt'>[] = [
  {
    name: 'Advanced Algorithms & Complexity',
    code: 'CS 301',
    credits: 4,
    facultyName: 'Dr. Benjamin Bennett',
    mid1Marks: { scored: 27, max: 30, evaluated: true },
    mid2Marks: { scored: 28, max: 30, evaluated: true },
    semesterMarks: { scored: 0, max: 100, evaluated: false },
    assignmentMarks: { scored: 48, max: 50, evaluated: true },
    labMarks: { scored: 29, max: 30, evaluated: true },
    attendance: { attended: 32, total: 35 },
    targetMarks: 92,
    notes: 'Master Graph flows, NP-completeness reductions, and dynamic programming memoization.',
    color: '#3B82F6',
  },
  {
    name: 'Database Management Systems',
    code: 'CS 320',
    credits: 3,
    facultyName: 'Prof. Elena Rostova',
    mid1Marks: { scored: 25, max: 30, evaluated: true },
    mid2Marks: { scored: 26, max: 30, evaluated: true },
    semesterMarks: { scored: 0, max: 100, evaluated: false },
    assignmentMarks: { scored: 42, max: 50, evaluated: true },
    labMarks: { scored: 28, max: 30, evaluated: true },
    attendance: { attended: 29, total: 32 },
    targetMarks: 88,
    notes: 'Review B+ Trees index clustering and ACID isolation anomalies.',
    color: '#8B5CF6',
  },
  {
    name: 'Computer Networks & Distributed Systems',
    code: 'CS 340',
    credits: 4,
    facultyName: 'Dr. Marcus Vance',
    mid1Marks: { scored: 21, max: 30, evaluated: true },
    mid2Marks: { scored: 24, max: 30, evaluated: true },
    semesterMarks: { scored: 0, max: 100, evaluated: false },
    assignmentMarks: { scored: 38, max: 50, evaluated: true },
    labMarks: { scored: 24, max: 30, evaluated: true },
    attendance: { attended: 23, total: 32 }, // 71.8% (Attendance warning!)
    targetMarks: 85,
    notes: 'TCP Reno vs Cubic congestion control mechanics and Raft consensus leader election.',
    color: '#EC4899',
  },
  {
    name: 'Operating Systems & Concurrency',
    code: 'CS 350',
    credits: 4,
    facultyName: 'Prof. Sarah Lin',
    mid1Marks: { scored: 28, max: 30, evaluated: true },
    mid2Marks: { scored: 29, max: 30, evaluated: true },
    semesterMarks: { scored: 0, max: 100, evaluated: false },
    assignmentMarks: { scored: 49, max: 50, evaluated: true },
    labMarks: { scored: 30, max: 30, evaluated: true },
    attendance: { attended: 35, total: 36 },
    targetMarks: 95,
    notes: 'Virtual memory page tables, TLB shootdown, and lock-free concurrency queues.',
    color: '#10B981',
  },
  {
    name: 'Applied Machine Learning & Optimization',
    code: 'CS 360',
    credits: 3,
    facultyName: 'Dr. Arthur Chen',
    mid1Marks: { scored: 26, max: 30, evaluated: true },
    mid2Marks: { scored: 27, max: 30, evaluated: true },
    semesterMarks: { scored: 0, max: 100, evaluated: false },
    assignmentMarks: { scored: 45, max: 50, evaluated: true },
    labMarks: { scored: 27, max: 30, evaluated: true },
    attendance: { attended: 27, total: 30 },
    targetMarks: 90,
    notes: 'Gradient descent regularization, Adam optimizer momentum, and Transformer multi-head attention.',
    color: '#F59E0B',
  },
];

interface AcademicContextType {
  subjects: Subject[];
  gradingConfig: GradingSchemeConfig;
  subjectCalculations: Map<string, SubjectCalculation>;
  summary: AcademicSummary;
  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id' | 'createdAt' | 'userId'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  updateSubjectMarks: (
    id: string,
    marks: {
      mid1Marks?: MarksComponent;
      mid2Marks?: MarksComponent;
      semesterMarks?: MarksComponent;
      assignmentMarks?: MarksComponent;
      labMarks?: MarksComponent;
    }
  ) => Promise<void>;
  logAttendance: (id: string, change: 'present' | 'absent' | 'reset') => Promise<void>;
  // Grading Scheme Configuration
  updateGradingConfig: (newConfig: Partial<GradingSchemeConfig>) => Promise<void>;
  setGradingPreset: (preset: GradingFormulaPreset) => Promise<void>;
  resetToDefaultSubjects: () => Promise<void>;
  // State
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradingConfig, setGradingConfig] = useState<GradingSchemeConfig>(DEFAULT_GRADING_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Listen to User Preferences for Grading Config
  useEffect(() => {
    if (!user) {
      setGradingConfig(DEFAULT_GRADING_CONFIG);
      return;
    }

    const prefDocRef = doc(db, 'userPreferences', user.uid);
    const unsubscribePref = onSnapshot(
      prefDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.academicGradingConfig) {
            setGradingConfig({
              ...DEFAULT_GRADING_CONFIG,
              ...data.academicGradingConfig,
            });
          }
        }
      },
      (err) => {
        console.warn('Preferences listener non-blocking error:', err);
      }
    );

    return () => unsubscribePref();
  }, [user]);

  // 2. Real-time Listen to Subjects in Firestore
  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const subjectsCollection = collection(db, 'subjects');
    const q = query(subjectsCollection, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed default sample subjects for first-time user
          try {
            setIsSyncing(true);
            const batch = writeBatch(db);
            const timestamp = new Date().toISOString();

            INITIAL_DEMO_SUBJECTS.forEach((item) => {
              const newDocRef = doc(subjectsCollection);
              batch.set(newDocRef, {
                ...item,
                userId: user.uid,
                createdAt: timestamp,
                updatedAt: timestamp,
              });
            });

            await batch.commit();
          } catch (seedErr) {
            console.error('Error seeding subjects:', seedErr);
            setError('Failed to seed academic subjects.');
          } finally {
            setIsSyncing(false);
            setIsLoading(false);
          }
        } else {
          const list: Subject[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              userId: data.userId,
              name: data.name || 'Untitled Subject',
              code: data.code || 'SUB 101',
              credits: Number(data.credits) || 3,
              facultyName: data.facultyName || 'Faculty Instructor',
              mid1Marks: data.mid1Marks || { scored: 0, max: 30, evaluated: false },
              mid2Marks: data.mid2Marks || { scored: 0, max: 30, evaluated: false },
              semesterMarks: data.semesterMarks || { scored: 0, max: 100, evaluated: false },
              assignmentMarks: data.assignmentMarks || { scored: 0, max: 50, evaluated: false },
              labMarks: data.labMarks || { scored: 0, max: 30, evaluated: false },
              attendance: data.attendance || { attended: 0, total: 0 },
              targetMarks: Number(data.targetMarks) || 85,
              notes: data.notes || '',
              color: data.color || '#3B82F6',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt,
            });
          });

          // Sort by code or name
          list.sort((a, b) => a.code.localeCompare(b.code));
          setSubjects(list);
          setIsLoading(false);
          setError(null);
        }
      },
      (err) => {
        console.error('Firestore subjects subscription error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. Mathematical Calculations for Each Subject
  const subjectCalculations = useMemo(() => {
    const calcMap = new Map<string, SubjectCalculation>();

    subjects.forEach((sub) => {
      // Extract components
      const mid1 = sub.mid1Marks || { scored: 0, max: 30, evaluated: false };
      const mid2 = sub.mid2Marks || { scored: 0, max: 30, evaluated: false };
      const sem = sub.semesterMarks || { scored: 0, max: 100, evaluated: false };
      const assign = sub.assignmentMarks || { scored: 0, max: 50, evaluated: false };
      const lab = sub.labMarks || { scored: 0, max: 30, evaluated: false };

      const m1Pct = mid1.max > 0 ? (mid1.scored / mid1.max) * 100 : 0;
      const m2Pct = mid2.max > 0 ? (mid2.scored / mid2.max) * 100 : 0;
      const semPct = sem.max > 0 ? (sem.scored / sem.max) * 100 : 0;
      const assignPct = assign.max > 0 ? (assign.scored / assign.max) * 100 : 0;
      const labPct = lab.max > 0 ? (lab.scored / lab.max) * 100 : 0;

      // Check evaluated status
      const isM1Eval = Boolean(mid1.evaluated && mid1.max > 0);
      const isM2Eval = Boolean(mid2.evaluated && mid2.max > 0);
      const isSemEval = Boolean(sem.evaluated && sem.max > 0);
      const isAssignEval = Boolean(assign.evaluated && assign.max > 0);
      const isLabEval = Boolean(lab.evaluated && lab.max > 0);

      // Trajectory based on M1 vs M2
      let trajectory: 'up' | 'down' | 'steady' = 'steady';
      if (isM1Eval && isM2Eval) {
        if (m2Pct > m1Pct + 2) trajectory = 'up';
        else if (m2Pct < m1Pct - 2) trajectory = 'down';
      }

      // Raw total points percentage
      const totalScoredRaw =
        (isM1Eval ? mid1.scored : 0) +
        (isM2Eval ? mid2.scored : 0) +
        (isSemEval ? sem.scored : 0) +
        (isAssignEval ? assign.scored : 0) +
        (isLabEval ? lab.scored : 0);

      const totalMaxRaw =
        (isM1Eval ? mid1.max : 0) +
        (isM2Eval ? mid2.max : 0) +
        (isSemEval ? sem.max : 0) +
        (isAssignEval ? assign.max : 0) +
        (isLabEval ? lab.max : 0);

      const rawAggregatePercentage = totalMaxRaw > 0 ? (totalScoredRaw / totalMaxRaw) * 100 : 0;

      // Configured Scheme Calculation
      let finalPercentage = 0;
      const componentDetails: ComponentCalculationDetail[] = [];
      let explanation = '';

      if (gradingConfig.preset === 'raw_points') {
        finalPercentage = rawAggregatePercentage;
        explanation = `Calculated as raw sum of evaluated points: ${totalScoredRaw.toFixed(1)} / ${totalMaxRaw} = ${finalPercentage.toFixed(1)}%`;
        componentDetails.push(
          { name: 'Midterm 1', scored: mid1.scored, max: mid1.max, rawPercentage: m1Pct, nominalWeight: 20, effectiveWeight: mid1.max, weightedContribution: mid1.scored, isEvaluated: isM1Eval, statusLabel: isM1Eval ? `${mid1.scored}/${mid1.max}` : 'Pending' },
          { name: 'Midterm 2', scored: mid2.scored, max: mid2.max, rawPercentage: m2Pct, nominalWeight: 20, effectiveWeight: mid2.max, weightedContribution: mid2.scored, isEvaluated: isM2Eval, statusLabel: isM2Eval ? `${mid2.scored}/${mid2.max}` : 'Pending' },
          { name: 'Semester Exam', scored: sem.scored, max: sem.max, rawPercentage: semPct, nominalWeight: 20, effectiveWeight: sem.max, weightedContribution: sem.scored, isEvaluated: isSemEval, statusLabel: isSemEval ? `${sem.scored}/${sem.max}` : 'Pending' },
          { name: 'Assignments', scored: assign.scored, max: assign.max, rawPercentage: assignPct, nominalWeight: 20, effectiveWeight: assign.max, weightedContribution: assign.scored, isEvaluated: isAssignEval, statusLabel: isAssignEval ? `${assign.scored}/${assign.max}` : 'Pending' },
          { name: 'Lab Practical', scored: lab.scored, max: lab.max, rawPercentage: labPct, nominalWeight: 20, effectiveWeight: lab.max, weightedContribution: lab.scored, isEvaluated: isLabEval, statusLabel: isLabEval ? `${lab.scored}/${lab.max}` : 'Pending' },
        );
      } else {
        // Weighted Scheme (standard, best of mids, continuous, or custom)
        const weights = { ...gradingConfig.weights };

        let evaluatedWeightSum = 0;
        let weightedPointsSum = 0;

        if (gradingConfig.useBestOfMids) {
          const combinedMidsWeight = weights.mid1Weight + weights.mid2Weight;
          const bestMidPct = Math.max(isM1Eval ? m1Pct : 0, isM2Eval ? m2Pct : 0);
          const isEitherMidEval = isM1Eval || isM2Eval;

          if (isEitherMidEval) {
            evaluatedWeightSum += combinedMidsWeight;
            weightedPointsSum += bestMidPct * (combinedMidsWeight / 100);
          }

          componentDetails.push({
            name: 'Best of Midterms (Mid 1 vs Mid 2)',
            scored: isM1Eval && isM2Eval ? Math.max(m1Pct, m2Pct) : (isM1Eval ? m1Pct : m2Pct),
            max: 100,
            rawPercentage: bestMidPct,
            nominalWeight: combinedMidsWeight,
            effectiveWeight: combinedMidsWeight,
            weightedContribution: bestMidPct * (combinedMidsWeight / 100),
            isEvaluated: isEitherMidEval,
            statusLabel: isEitherMidEval ? `Best: ${bestMidPct.toFixed(1)}%` : 'Pending',
          });
        } else {
          if (isM1Eval) {
            evaluatedWeightSum += weights.mid1Weight;
            weightedPointsSum += m1Pct * (weights.mid1Weight / 100);
          }
          componentDetails.push({
            name: 'Midterm 1',
            scored: mid1.scored,
            max: mid1.max,
            rawPercentage: m1Pct,
            nominalWeight: weights.mid1Weight,
            effectiveWeight: weights.mid1Weight,
            weightedContribution: m1Pct * (weights.mid1Weight / 100),
            isEvaluated: isM1Eval,
            statusLabel: isM1Eval ? `${mid1.scored}/${mid1.max} (${m1Pct.toFixed(1)}%)` : 'Pending',
          });

          if (isM2Eval) {
            evaluatedWeightSum += weights.mid2Weight;
            weightedPointsSum += m2Pct * (weights.mid2Weight / 100);
          }
          componentDetails.push({
            name: 'Midterm 2',
            scored: mid2.scored,
            max: mid2.max,
            rawPercentage: m2Pct,
            nominalWeight: weights.mid2Weight,
            effectiveWeight: weights.mid2Weight,
            weightedContribution: m2Pct * (weights.mid2Weight / 100),
            isEvaluated: isM2Eval,
            statusLabel: isM2Eval ? `${mid2.scored}/${mid2.max} (${m2Pct.toFixed(1)}%)` : 'Pending',
          });
        }

        if (isSemEval) {
          evaluatedWeightSum += weights.semesterWeight;
          weightedPointsSum += semPct * (weights.semesterWeight / 100);
        }
        componentDetails.push({
          name: 'Semester Final Exam',
          scored: sem.scored,
          max: sem.max,
          rawPercentage: semPct,
          nominalWeight: weights.semesterWeight,
          effectiveWeight: weights.semesterWeight,
          weightedContribution: semPct * (weights.semesterWeight / 100),
          isEvaluated: isSemEval,
          statusLabel: isSemEval ? `${sem.scored}/${sem.max} (${semPct.toFixed(1)}%)` : 'Pending Exam',
        });

        if (isAssignEval) {
          evaluatedWeightSum += weights.assignmentWeight;
          weightedPointsSum += assignPct * (weights.assignmentWeight / 100);
        }
        componentDetails.push({
          name: 'Continuous Assignments',
          scored: assign.scored,
          max: assign.max,
          rawPercentage: assignPct,
          nominalWeight: weights.assignmentWeight,
          effectiveWeight: weights.assignmentWeight,
          weightedContribution: assignPct * (weights.assignmentWeight / 100),
          isEvaluated: isAssignEval,
          statusLabel: isAssignEval ? `${assign.scored}/${assign.max} (${assignPct.toFixed(1)}%)` : 'Pending',
        });

        if (isLabEval) {
          evaluatedWeightSum += weights.labWeight;
          weightedPointsSum += labPct * (weights.labWeight / 100);
        }
        componentDetails.push({
          name: 'Lab Work & Practicals',
          scored: lab.scored,
          max: lab.max,
          rawPercentage: labPct,
          nominalWeight: weights.labWeight,
          effectiveWeight: weights.labWeight,
          weightedContribution: labPct * (weights.labWeight / 100),
          isEvaluated: isLabEval,
          statusLabel: isLabEval ? `${lab.scored}/${lab.max} (${labPct.toFixed(1)}%)` : 'Pending',
        });

        if (gradingConfig.normalizeUnevaluated && evaluatedWeightSum > 0 && evaluatedWeightSum < 100) {
          // Normalize to 100% of evaluated coursework
          finalPercentage = (weightedPointsSum / (evaluatedWeightSum / 100));
          explanation = `Normalized to evaluated assessments (${evaluatedWeightSum}% completed): ${weightedPointsSum.toFixed(2)} pts / ${evaluatedWeightSum}% = ${finalPercentage.toFixed(1)}%`;
        } else if (evaluatedWeightSum > 0) {
          finalPercentage = weightedPointsSum;
          explanation = `Total weighted score: ${weightedPointsSum.toFixed(1)}% out of 100%`;
        } else {
          finalPercentage = 0;
          explanation = 'No evaluated assessments recorded yet.';
        }
      }

      // Attendance calculations
      const attended = sub.attendance?.attended || 0;
      const totalClasses = sub.attendance?.total || 0;
      const attendancePct = totalClasses > 0 ? (attended / totalClasses) * 100 : 100;
      const threshold = gradingConfig.minAttendanceThreshold || 75;

      let attendanceStatus: 'safe' | 'warning' | 'critical' = 'safe';
      if (attendancePct < threshold) {
        attendanceStatus = 'critical';
      } else if (attendancePct < threshold + 8) {
        attendanceStatus = 'warning';
      }

      // Classes needed to reach threshold:
      // (attended + X) / (totalClasses + X) >= threshold / 100
      // 100*attended + 100X >= threshold*total + threshold*X
      // (100 - threshold)X >= threshold*total - 100*attended
      // X = ceil((threshold * total - 100 * attended) / (100 - threshold))
      let classesNeededForThreshold = 0;
      if (attendancePct < threshold && threshold < 100) {
        const numerator = (threshold * totalClasses) - (100 * attended);
        const denominator = 100 - threshold;
        classesNeededForThreshold = Math.max(0, Math.ceil(numerator / denominator));
      }

      // Bunks available:
      // attended / (totalClasses + Y) >= threshold / 100
      // 100*attended >= threshold*total + threshold*Y
      // threshold*Y <= 100*attended - threshold*total
      // Y = floor((100 * attended - threshold * total) / threshold)
      let bunksAvailable = 0;
      if (attendancePct >= threshold && threshold > 0) {
        const numerator = (100 * attended) - (threshold * totalClasses);
        bunksAvailable = Math.max(0, Math.floor(numerator / threshold));
      }

      const targetMarks = sub.targetMarks || 85;
      const targetGap = finalPercentage - targetMarks;
      const targetProgress = targetMarks > 0 ? Math.min(150, (finalPercentage / targetMarks) * 100) : 100;

      const gradeInfo = percentageToGrade(finalPercentage);

      let status: 'strong' | 'average' | 'needs_attention' = 'average';
      if (finalPercentage >= 85 && attendancePct >= threshold) {
        status = 'strong';
      } else if (finalPercentage < 72 || attendancePct < threshold || targetGap <= -12) {
        status = 'needs_attention';
      }

      calcMap.set(sub.id, {
        subjectId: sub.id,
        currentPercentage: Number(finalPercentage.toFixed(1)),
        rawAggregatePercentage: Number(rawAggregatePercentage.toFixed(1)),
        targetPercentage: targetMarks,
        targetGap: Number(targetGap.toFixed(1)),
        targetProgress: Number(targetProgress.toFixed(1)),
        gradeLetter: gradeInfo.letter,
        gpaPoint4: gradeInfo.gpa4,
        gpaPoint10: gradeInfo.gpa10,
        attendancePercentage: Number(attendancePct.toFixed(1)),
        attendanceStatus,
        classesNeededForThreshold,
        bunksAvailable,
        componentDetails,
        calculationFormulaExplanation: explanation,
        status,
        trajectory,
      });
    });

    return calcMap;
  }, [subjects, gradingConfig]);

  // 4. Global Overall Academic Summary Calculations
  const summary: AcademicSummary = useMemo(() => {
    if (subjects.length === 0) {
      return {
        totalSubjects: 0,
        totalCredits: 0,
        creditWeightedPercentage: 0,
        simpleAveragePercentage: 0,
        overallGpa4: 0,
        overallGpa10: 0,
        overallAttendancePercentage: 100,
        totalClassesAttended: 0,
        totalClassesConducted: 0,
        strongSubjects: [],
        needsAttentionSubjects: [],
        attendanceWarningSubjects: [],
        gradeDistribution: {},
      };
    }

    let totalCredits = 0;
    let weightedScoreSum = 0;
    let simplePercentageSum = 0;
    let totalClassesAttended = 0;
    let totalClassesConducted = 0;
    const gradeDistribution: Record<string, number> = {};

    const strongSubjects: Subject[] = [];
    const needsAttentionSubjects: Subject[] = [];
    const attendanceWarningSubjects: Subject[] = [];

    subjects.forEach((sub) => {
      const calc = subjectCalculations.get(sub.id);
      const pct = calc ? calc.currentPercentage : 0;
      const credits = sub.credits || 3;

      totalCredits += credits;
      weightedScoreSum += pct * credits;
      simplePercentageSum += pct;

      const att = sub.attendance?.attended || 0;
      const total = sub.attendance?.total || 0;
      totalClassesAttended += att;
      totalClassesConducted += total;

      const letter = calc ? calc.gradeLetter : 'B';
      gradeDistribution[letter] = (gradeDistribution[letter] || 0) + 1;

      if (calc?.status === 'strong') {
        strongSubjects.push(sub);
      } else if (calc?.status === 'needs_attention') {
        needsAttentionSubjects.push(sub);
      }

      if (calc && calc.attendancePercentage < (gradingConfig.minAttendanceThreshold || 75)) {
        attendanceWarningSubjects.push(sub);
      }
    });

    const creditWeightedPct = totalCredits > 0 ? weightedScoreSum / totalCredits : 0;
    const simpleAvgPct = simplePercentageSum / subjects.length;
    const overallGrade = percentageToGrade(creditWeightedPct);
    const overallAttPct = totalClassesConducted > 0 ? (totalClassesAttended / totalClassesConducted) * 100 : 100;

    return {
      totalSubjects: subjects.length,
      totalCredits,
      creditWeightedPercentage: Number(creditWeightedPct.toFixed(1)),
      simpleAveragePercentage: Number(simpleAvgPct.toFixed(1)),
      overallGpa4: overallGrade.gpa4,
      overallGpa10: overallGrade.gpa10,
      overallAttendancePercentage: Number(overallAttPct.toFixed(1)),
      totalClassesAttended,
      totalClassesConducted,
      strongSubjects,
      needsAttentionSubjects,
      attendanceWarningSubjects,
      gradeDistribution,
    };
  }, [subjects, subjectCalculations, gradingConfig.minAttendanceThreshold]);

  // Actions
  const addSubject = useCallback(
    async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'userId'>) => {
      if (!user) return;
      try {
        setIsSyncing(true);
        const colRef = collection(db, 'subjects');
        const newDocRef = doc(colRef);
        const timestamp = new Date().toISOString();

        await setDoc(newDocRef, {
          ...subjectData,
          userId: user.uid,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'subjects');
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const updateSubject = useCallback(
    async (id: string, updates: Partial<Omit<Subject, 'id' | 'createdAt' | 'userId'>>) => {
      if (!user) return;
      try {
        setIsSyncing(true);
        const docRef = doc(db, 'subjects', id);
        await updateDoc(docRef, {
          ...updates,
          userId: user.uid,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `subjects/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const deleteSubject = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        setIsSyncing(true);
        const docRef = doc(db, 'subjects', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `subjects/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const updateSubjectMarks = useCallback(
    async (
      id: string,
      marks: {
        mid1Marks?: MarksComponent;
        mid2Marks?: MarksComponent;
        semesterMarks?: MarksComponent;
        assignmentMarks?: MarksComponent;
        labMarks?: MarksComponent;
      }
    ) => {
      if (!user) return;
      try {
        setIsSyncing(true);
        const docRef = doc(db, 'subjects', id);
        await updateDoc(docRef, {
          ...marks,
          userId: user.uid,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `subjects/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  const logAttendance = useCallback(
    async (id: string, change: 'present' | 'absent' | 'reset') => {
      if (!user) return;
      const targetSub = subjects.find((s) => s.id === id);
      if (!targetSub) return;

      const current = targetSub.attendance || { attended: 0, total: 0 };
      let updatedAttended = current.attended;
      let updatedTotal = current.total;

      if (change === 'present') {
        updatedAttended += 1;
        updatedTotal += 1;
      } else if (change === 'absent') {
        updatedTotal += 1;
      } else if (change === 'reset') {
        updatedAttended = 0;
        updatedTotal = 0;
      }

      try {
        setIsSyncing(true);
        const docRef = doc(db, 'subjects', id);
        await updateDoc(docRef, {
          attendance: { attended: updatedAttended, total: updatedTotal },
          userId: user.uid,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `subjects/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user, subjects]
  );

  const updateGradingConfig = useCallback(
    async (newConfig: Partial<GradingSchemeConfig>) => {
      if (!user) return;
      try {
        setIsSyncing(true);
        const updated = { ...gradingConfig, ...newConfig };
        setGradingConfig(updated);

        const prefDocRef = doc(db, 'userPreferences', user.uid);
        await setDoc(
          prefDocRef,
          {
            userId: user.uid,
            academicGradingConfig: updated,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `userPreferences/${user?.uid}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user, gradingConfig]
  );

  const setGradingPreset = useCallback(
    async (preset: GradingFormulaPreset) => {
      const presetData = PRESET_SCHEMES[preset];
      if (!presetData) return;

      await updateGradingConfig({
        preset,
        name: presetData.name,
        description: presetData.description,
        weights: presetData.weights,
        useBestOfMids: presetData.useBestOfMids,
      });
    },
    [updateGradingConfig]
  );

  const resetToDefaultSubjects = useCallback(async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const batch = writeBatch(db);

      // Delete existing
      subjects.forEach((sub) => {
        batch.delete(doc(db, 'subjects', sub.id));
      });

      // Seed fresh
      const colRef = collection(db, 'subjects');
      const timestamp = new Date().toISOString();
      INITIAL_DEMO_SUBJECTS.forEach((item) => {
        const newRef = doc(colRef);
        batch.set(newRef, {
          ...item,
          userId: user.uid,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'subjects');
    } finally {
      setIsSyncing(false);
    }
  }, [user, subjects]);

  const contextValue = useMemo<AcademicContextType>(
    () => ({
      subjects,
      gradingConfig,
      subjectCalculations,
      summary,
      addSubject,
      updateSubject,
      deleteSubject,
      updateSubjectMarks,
      logAttendance,
      updateGradingConfig,
      setGradingPreset,
      resetToDefaultSubjects,
      isLoading,
      isSyncing,
      error,
    }),
    [
      subjects,
      gradingConfig,
      subjectCalculations,
      summary,
      addSubject,
      updateSubject,
      deleteSubject,
      updateSubjectMarks,
      logAttendance,
      updateGradingConfig,
      setGradingPreset,
      resetToDefaultSubjects,
      isLoading,
      isSyncing,
      error,
    ]
  );

  return <AcademicContext.Provider value={contextValue}>{children}</AcademicContext.Provider>;
};

export const useAcademics = (): AcademicContextType => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademics must be used within an AcademicProvider');
  }
  return context;
};
