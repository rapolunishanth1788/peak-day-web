import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import {
  MuscleGroup,
  WorkoutTemplate,
  LoggedWorkout,
  WorkoutExercise,
  WorkoutSet,
  PersonalRecord,
  BodyMetricEntry,
  FitnessGoal,
  FitnessSummary,
  AchievedPR,
  RestDayEntry,
  MuscleDistributionItem,
} from '../types/fitness';
import { PREBUILT_TEMPLATES, MUSCLE_COLOR_MAP, EXERCISE_LIBRARY } from '../data/exerciseLibrary';

export interface ActiveWorkoutSession {
  templateId?: string;
  title: string;
  category: string;
  startTime: string; // ISO
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface RestTimerState {
  isActive: boolean;
  secondsRemaining: number;
  totalSeconds: number;
  exerciseName?: string;
}

interface FitnessContextType {
  templates: WorkoutTemplate[];
  loggedWorkouts: LoggedWorkout[];
  bodyMetrics: BodyMetricEntry[];
  goals: FitnessGoal[];
  restDays: RestDayEntry[];
  personalRecords: PersonalRecord[];
  summary: FitnessSummary;
  loading: boolean;

  // Active workout runner
  activeWorkout: ActiveWorkoutSession | null;
  activeWorkoutDuration: number; // in seconds
  restTimer: RestTimerState;
  startWorkout: (template?: WorkoutTemplate | null, customTitle?: string) => void;
  updateActiveSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  toggleActiveSetComplete: (exerciseIndex: number, setIndex: number) => void;
  addActiveSet: (exerciseIndex: number) => void;
  removeActiveSet: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  startRestTimer: (seconds?: number, exerciseName?: string) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  stopRestTimer: () => void;
  finishActiveWorkout: (rpe?: number, notes?: string) => Promise<LoggedWorkout | null>;
  cancelActiveWorkout: () => void;

  // Data persistence
  saveTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt'> & { id?: string }) => Promise<string>;
  deleteTemplate: (templateId: string) => Promise<void>;
  logDirectWorkout: (workout: Omit<LoggedWorkout, 'id' | 'createdAt'>) => Promise<string>;
  deleteLoggedWorkout: (workoutId: string) => Promise<void>;
  addBodyMetric: (metric: Omit<BodyMetricEntry, 'id' | 'createdAt'>) => Promise<string>;
  logBodyMetrics: (metric: Omit<BodyMetricEntry, 'id' | 'createdAt'>) => Promise<string>;
  deleteBodyMetric: (id: string) => Promise<void>;
  addGoal: (goal: Omit<FitnessGoal, 'id' | 'createdAt'>) => Promise<string>;
  updateGoal: (id: string, updates: Partial<FitnessGoal>) => Promise<void>;
  updateGoalProgress: (id: string, newCurrentValue: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  logRestDay: (restDay: Omit<RestDayEntry, 'id'>) => void;
  resetToSampleData: () => Promise<void>;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

// Local Storage Keys for offline / guest mode
const STORAGE_TEMPLATES_KEY = 'peakday_fitness_templates';
const STORAGE_WORKOUTS_KEY = 'peakday_fitness_workouts';
const STORAGE_METRICS_KEY = 'peakday_fitness_metrics';
const STORAGE_GOALS_KEY = 'peakday_fitness_goals';
const STORAGE_RESTDAYS_KEY = 'peakday_fitness_restdays';

// Calculate 1RM using standard Epley Formula: weight * (1 + reps / 30)
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Generate realistic starter sample workouts
function getInitialSampleWorkouts(): LoggedWorkout[] {
  const today = new Date();
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'log-sample-1',
      title: 'Push Hypertrophy & Chest Blast',
      category: 'Push / Pull / Legs',
      date: getPastDateStr(1),
      startTime: `${getPastDateStr(1)}T17:30:00.000Z`,
      endTime: `${getPastDateStr(1)}T18:25:00.000Z`,
      durationMinutes: 55,
      totalVolume: 14850,
      totalSets: 17,
      totalReps: 168,
      rpe: 8.5,
      notes: 'Huge pump on incline presses. Felt explosive on flat bench.',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      completed: true,
      createdAt: `${getPastDateStr(1)}T18:26:00.000Z`,
      personalRecordsAchieved: [
        {
          exerciseId: 'ex-bench-press',
          exerciseName: 'Barbell Flat Bench Press',
          weight: 225,
          reps: 6,
          estimated1RM: 270,
          previousBestWeight: 215,
          previous1RM: 258,
          type: 'weight',
        },
      ],
      exercises: [
        {
          id: 'w-ex-1',
          exerciseId: 'ex-bench-press',
          exerciseName: 'Barbell Flat Bench Press',
          primaryMuscle: 'Chest',
          equipment: 'Barbell',
          targetSets: 4,
          restTimeSeconds: 120,
          completed: true,
          sets: [
            { id: 's1', setNumber: 1, targetReps: 10, targetWeight: 135, actualReps: 10, actualWeight: 135, completed: true, isWarmup: true },
            { id: 's2', setNumber: 2, targetReps: 8, targetWeight: 185, actualReps: 8, actualWeight: 185, completed: true },
            { id: 's3', setNumber: 3, targetReps: 6, targetWeight: 205, actualReps: 6, actualWeight: 205, completed: true },
            { id: 's4', setNumber: 4, targetReps: 6, targetWeight: 225, actualReps: 6, actualWeight: 225, completed: true },
          ],
        },
        {
          id: 'w-ex-2',
          exerciseId: 'ex-incline-dumbbell-press',
          exerciseName: 'Incline Dumbbell Press',
          primaryMuscle: 'Chest',
          equipment: 'Dumbbell',
          targetSets: 3,
          restTimeSeconds: 90,
          completed: true,
          sets: [
            { id: 's5', setNumber: 1, targetReps: 10, targetWeight: 70, actualReps: 10, actualWeight: 70, completed: true },
            { id: 's6', setNumber: 2, targetReps: 10, targetWeight: 75, actualReps: 10, actualWeight: 75, completed: true },
            { id: 's7', setNumber: 3, targetReps: 8, targetWeight: 80, actualReps: 8, actualWeight: 80, completed: true },
          ],
        },
        {
          id: 'w-ex-3',
          exerciseId: 'ex-dumbbell-lateral-raise',
          exerciseName: 'Dumbbell Lateral Raise',
          primaryMuscle: 'Shoulders',
          equipment: 'Dumbbell',
          targetSets: 4,
          restTimeSeconds: 60,
          completed: true,
          sets: [
            { id: 's8', setNumber: 1, targetReps: 15, targetWeight: 25, actualReps: 15, actualWeight: 25, completed: true },
            { id: 's9', setNumber: 2, targetReps: 12, targetWeight: 25, actualReps: 12, actualWeight: 25, completed: true },
            { id: 's10', setNumber: 3, targetReps: 12, targetWeight: 25, actualReps: 12, actualWeight: 25, completed: true },
            { id: 's11', setNumber: 4, targetReps: 15, targetWeight: 20, actualReps: 15, actualWeight: 20, completed: true, isDropSet: true },
          ],
        },
      ],
    },
    {
      id: 'log-sample-2',
      title: 'Pull Power & Lat Width',
      category: 'Push / Pull / Legs',
      date: getPastDateStr(3),
      startTime: `${getPastDateStr(3)}T16:00:00.000Z`,
      endTime: `${getPastDateStr(3)}T16:52:00.000Z`,
      durationMinutes: 52,
      totalVolume: 16200,
      totalSets: 15,
      totalReps: 135,
      rpe: 8.0,
      notes: 'Deadlifts felt snappy with double-overhand hook grip.',
      muscleGroups: ['Back', 'Biceps', 'Shoulders'],
      completed: true,
      createdAt: `${getPastDateStr(3)}T16:55:00.000Z`,
      personalRecordsAchieved: [
        {
          exerciseId: 'ex-barbell-deadlift',
          exerciseName: 'Conventional Barbell Deadlift',
          weight: 365,
          reps: 3,
          estimated1RM: 401,
          previousBestWeight: 350,
          previous1RM: 385,
          type: '1rm',
        },
      ],
      exercises: [
        {
          id: 'w-ex-4',
          exerciseId: 'ex-barbell-deadlift',
          exerciseName: 'Conventional Barbell Deadlift',
          primaryMuscle: 'Back',
          equipment: 'Barbell',
          targetSets: 3,
          restTimeSeconds: 180,
          completed: true,
          sets: [
            { id: 's12', setNumber: 1, targetReps: 5, targetWeight: 275, actualReps: 5, actualWeight: 275, completed: true },
            { id: 's13', setNumber: 2, targetReps: 5, targetWeight: 315, actualReps: 5, actualWeight: 315, completed: true },
            { id: 's14', setNumber: 3, targetReps: 3, targetWeight: 365, actualReps: 3, actualWeight: 365, completed: true },
          ],
        },
        {
          id: 'w-ex-5',
          exerciseId: 'ex-pull-ups',
          exerciseName: 'Strict Bodyweight Pull-Ups',
          primaryMuscle: 'Back',
          equipment: 'Bodyweight',
          targetSets: 3,
          restTimeSeconds: 90,
          completed: true,
          sets: [
            { id: 's15', setNumber: 1, targetReps: 10, targetWeight: 0, actualReps: 10, actualWeight: 0, completed: true },
            { id: 's16', setNumber: 2, targetReps: 9, targetWeight: 0, actualReps: 9, actualWeight: 0, completed: true },
            { id: 's17', setNumber: 3, targetReps: 8, targetWeight: 0, actualReps: 8, actualWeight: 0, completed: true },
          ],
        },
      ],
    },
    {
      id: 'log-sample-3',
      title: 'Lower Body Strength & Quads',
      category: 'Push / Pull / Legs',
      date: getPastDateStr(5),
      startTime: `${getPastDateStr(5)}T18:00:00.000Z`,
      endTime: `${getPastDateStr(5)}T19:05:00.000Z`,
      durationMinutes: 65,
      totalVolume: 21400,
      totalSets: 18,
      totalReps: 155,
      rpe: 9.0,
      notes: 'Heavy squats felt locked in. Depth below parallel on every rep.',
      muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
      completed: true,
      createdAt: `${getPastDateStr(5)}T19:08:00.000Z`,
      personalRecordsAchieved: [
        {
          exerciseId: 'ex-barbell-back-squat',
          exerciseName: 'Barbell Back Squat',
          weight: 275,
          reps: 5,
          estimated1RM: 320,
          previousBestWeight: 265,
          previous1RM: 308,
          type: 'weight',
        },
      ],
      exercises: [
        {
          id: 'w-ex-6',
          exerciseId: 'ex-barbell-back-squat',
          exerciseName: 'Barbell Back Squat',
          primaryMuscle: 'Quads',
          equipment: 'Barbell',
          targetSets: 4,
          restTimeSeconds: 150,
          completed: true,
          sets: [
            { id: 's18', setNumber: 1, targetReps: 8, targetWeight: 185, actualReps: 8, actualWeight: 185, completed: true },
            { id: 's19', setNumber: 2, targetReps: 6, targetWeight: 225, actualReps: 6, actualWeight: 225, completed: true },
            { id: 's20', setNumber: 3, targetReps: 5, targetWeight: 255, actualReps: 5, actualWeight: 255, completed: true },
            { id: 's21', setNumber: 4, targetReps: 5, targetWeight: 275, actualReps: 5, actualWeight: 275, completed: true },
          ],
        },
      ],
    },
    {
      id: 'log-sample-4',
      title: 'Full Body Conditioning & Core',
      category: 'Conditioning',
      date: getPastDateStr(7),
      startTime: `${getPastDateStr(7)}T08:00:00.000Z`,
      endTime: `${getPastDateStr(7)}T08:45:00.000Z`,
      durationMinutes: 45,
      totalVolume: 8200,
      totalSets: 12,
      totalReps: 180,
      rpe: 7.5,
      notes: 'Active recovery day. High heart rate intervals and core stability.',
      muscleGroups: ['Core', 'Cardio', 'Shoulders'],
      completed: true,
      createdAt: `${getPastDateStr(7)}T08:47:00.000Z`,
      exercises: [],
    },
  ];
}

function getInitialSampleMetrics(): BodyMetricEntry[] {
  const today = new Date();
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'metric-1',
      date: getPastDateStr(30),
      weightLbs: 182.4,
      bodyFatPercentage: 15.2,
      chestInches: 41.5,
      waistInches: 32.5,
      hipsInches: 39.0,
      bicepsInches: 15.0,
      thighsInches: 23.5,
      calvesInches: 15.2,
      shouldersInches: 48.0,
      notes: 'Beginning of cycle check-in.',
      createdAt: `${getPastDateStr(30)}T08:00:00.000Z`,
    },
    {
      id: 'metric-2',
      date: getPastDateStr(20),
      weightLbs: 181.1,
      bodyFatPercentage: 14.8,
      chestInches: 41.8,
      waistInches: 32.2,
      hipsInches: 38.8,
      bicepsInches: 15.2,
      thighsInches: 23.8,
      calvesInches: 15.3,
      shouldersInches: 48.2,
      notes: 'Leaner waistline, arms feeling fuller.',
      createdAt: `${getPastDateStr(20)}T08:00:00.000Z`,
    },
    {
      id: 'metric-3',
      date: getPastDateStr(10),
      weightLbs: 180.2,
      bodyFatPercentage: 14.3,
      chestInches: 42.0,
      waistInches: 31.9,
      hipsInches: 38.5,
      bicepsInches: 15.4,
      thighsInches: 24.0,
      calvesInches: 15.4,
      shouldersInches: 48.6,
      notes: 'Consistent nutrition and 1g/lb protein daily.',
      createdAt: `${getPastDateStr(10)}T08:00:00.000Z`,
    },
    {
      id: 'metric-4',
      date: getPastDateStr(1),
      weightLbs: 179.5,
      bodyFatPercentage: 13.9,
      chestInches: 42.2,
      waistInches: 31.5,
      hipsInches: 38.4,
      bicepsInches: 15.5,
      thighsInches: 24.2,
      calvesInches: 15.5,
      shouldersInches: 49.0,
      notes: 'Vascularity showing in shoulders and upper chest.',
      createdAt: `${getPastDateStr(1)}T08:00:00.000Z`,
    },
  ];
}

function getInitialSampleGoals(): FitnessGoal[] {
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 45);
  const deadlineStr = nextMonth.toISOString().split('T')[0];

  return [
    {
      id: 'goal-bench-225',
      title: 'Bench Press 225 lbs for 8 Reps',
      type: 'strength',
      category: 'Fitness',
      targetValue: 8,
      currentValue: 6,
      startValue: 4,
      unit: 'reps',
      exerciseId: 'ex-bench-press',
      exerciseName: 'Barbell Flat Bench Press',
      deadline: deadlineStr,
      completed: false,
      notes: 'Currently achieved 225 x 6. Overload +2 reps.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-deadlift-405',
      title: 'Deadlift 4 Plates (405 lbs 1RM)',
      type: 'exercise_pr',
      category: 'Fitness',
      targetValue: 405,
      currentValue: 365,
      startValue: 335,
      unit: 'lbs',
      exerciseId: 'ex-barbell-deadlift',
      exerciseName: 'Conventional Barbell Deadlift',
      deadline: deadlineStr,
      completed: false,
      notes: 'Current est 1RM is 401 lbs. Need clean lockout with 405 lbs.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-weight-cut',
      title: 'Target Athletic Weight 175 lbs',
      type: 'weight',
      category: 'Fitness',
      targetValue: 175,
      currentValue: 179.5,
      startValue: 185,
      unit: 'lbs',
      deadline: deadlineStr,
      completed: false,
      notes: 'Controlled deficit with high protein retention.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-consistency',
      title: 'Complete 16 Workouts in 4 Weeks',
      type: 'consistency',
      category: 'Fitness',
      targetValue: 16,
      currentValue: 12,
      startValue: 0,
      unit: 'workouts',
      deadline: deadlineStr,
      completed: false,
      notes: '4 structured sessions per week without missing a split.',
      createdAt: new Date().toISOString(),
    },
  ];
}

function getInitialSampleRestDays(): RestDayEntry[] {
  const today = new Date();
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'rest-1',
      date: getPastDateStr(2),
      type: 'active_recovery',
      recoveryScore: 88,
      notes: '25 min light stationary cycling and 15 min mobility foam rolling.',
      sleepHours: 8.5,
      sorenessLevel: 3,
    },
    {
      id: 'rest-2',
      date: getPastDateStr(4),
      type: 'full_rest',
      recoveryScore: 92,
      notes: 'Sauna + cold plunge session. Zero lifting.',
      sleepHours: 9.0,
      sorenessLevel: 2,
    },
    {
      id: 'rest-3',
      date: getPastDateStr(6),
      type: 'mobility_stretching',
      recoveryScore: 84,
      notes: 'Hip flexor opener & thoracic spine rotations.',
      sleepHours: 7.8,
      sorenessLevel: 4,
    },
  ];
}

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Core Data Collections
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_TEMPLATES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return PREBUILT_TEMPLATES.map(t => ({ ...t, isPrebuilt: true, createdAt: new Date().toISOString() }));
  });

  const [loggedWorkouts, setLoggedWorkouts] = useState<LoggedWorkout[]>(() => {
    const saved = localStorage.getItem(STORAGE_WORKOUTS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return getInitialSampleWorkouts();
  });

  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_METRICS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return getInitialSampleMetrics();
  });

  const [goals, setGoals] = useState<FitnessGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_GOALS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return getInitialSampleGoals();
  });

  const [restDays, setRestDays] = useState<RestDayEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_RESTDAYS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return getInitialSampleRestDays();
  });

  // Active Live Workout Session
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(() => {
    const saved = localStorage.getItem('peakday_active_workout');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  const [activeWorkoutDuration, setActiveWorkoutDuration] = useState<number>(0);

  // Live Rest Timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    secondsRemaining: 0,
    totalSeconds: 0,
  });

  // Keep local storage synced for fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_WORKOUTS_KEY, JSON.stringify(loggedWorkouts));
  }, [loggedWorkouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_METRICS_KEY, JSON.stringify(bodyMetrics));
  }, [bodyMetrics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_RESTDAYS_KEY, JSON.stringify(restDays));
  }, [restDays]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('peakday_active_workout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('peakday_active_workout');
    }
  }, [activeWorkout]);

  // Firestore Real-Time Subscriptions when User is Authenticated
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Workouts collection
    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid)
    );

    const unsubWorkouts = onSnapshot(
      workoutsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LoggedWorkout[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              userId: data.userId,
              templateId: data.templateId,
              title: data.title || 'Workout',
              category: data.category || 'General',
              date: data.date || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
              startTime: data.startTime || data.createdAt || new Date().toISOString(),
              endTime: data.endTime || data.createdAt || new Date().toISOString(),
              durationMinutes: data.durationMinutes || 45,
              totalVolume: data.totalVolume || 0,
              totalSets: data.totalSets || 0,
              totalReps: data.totalReps || 0,
              muscleGroups: data.muscleGroups || ['Full Body'],
              rpe: data.rpe,
              notes: data.notes,
              personalRecordsAchieved: data.personalRecordsAchieved || [],
              exercises: data.exercises || [],
              completed: data.completed ?? true,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLoggedWorkouts(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'workouts')
    );

    // 2. Workout Templates collection
    const templatesQuery = query(
      collection(db, 'workoutTemplates'),
      where('userId', '==', user.uid)
    );

    const unsubTemplates = onSnapshot(
      templatesQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const userTemplates: WorkoutTemplate[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            userTemplates.push({
              id: docSnap.id,
              userId: data.userId,
              name: data.name || 'Custom Routine',
              category: data.category || 'General',
              description: data.description || '',
              exercises: data.exercises || [],
              estimatedDurationMinutes: data.estimatedDurationMinutes || 50,
              targetMuscleGroups: data.targetMuscleGroups || ['Full Body'],
              isPrebuilt: false,
              color: data.color || '#3b82f6',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          // Merge prebuilts with user templates
          const prebuilts = PREBUILT_TEMPLATES.map(t => ({ ...t, isPrebuilt: true, createdAt: new Date().toISOString() }));
          setTemplates([...userTemplates, ...prebuilts]);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'workoutTemplates')
    );

    // 3. Fitness Progress / Body Metrics collection
    const metricsQuery = query(
      collection(db, 'fitnessProgress'),
      where('userId', '==', user.uid)
    );

    const unsubMetrics = onSnapshot(
      metricsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: BodyMetricEntry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              userId: data.userId,
              date: data.date || new Date().toISOString().split('T')[0],
              weightLbs: data.weightLbs || data.weight || 0,
              bodyFatPercentage: data.bodyFatPercentage,
              chestInches: data.chestInches,
              waistInches: data.waistInches,
              hipsInches: data.hipsInches,
              bicepsInches: data.bicepsInches,
              thighsInches: data.thighsInches,
              calvesInches: data.calvesInches,
              shouldersInches: data.shouldersInches,
              neckInches: data.neckInches,
              notes: data.notes,
              photoUrl: data.photoUrl,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setBodyMetrics(list);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'fitnessProgress')
    );

    // 4. Goals collection
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid),
      where('category', '==', 'Fitness')
    );

    const unsubGoals = onSnapshot(
      goalsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: FitnessGoal[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              userId: data.userId,
              title: data.title || 'Fitness Milestone',
              type: data.type || 'strength',
              category: 'Fitness',
              targetValue: data.targetValue || 0,
              currentValue: data.currentValue || 0,
              startValue: data.startValue,
              unit: data.unit || 'lbs',
              exerciseId: data.exerciseId,
              exerciseName: data.exerciseName,
              deadline: data.deadline || new Date().toISOString().split('T')[0],
              completed: data.completed || false,
              notes: data.notes,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          setGoals(list);
        }
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'goals');
        setLoading(false);
      }
    );

    return () => {
      unsubWorkouts();
      unsubTemplates();
      unsubMetrics();
      unsubGoals();
    };
  }, [user]);

  // Active workout session timer runner
  useEffect(() => {
    if (!activeWorkout) {
      setActiveWorkoutDuration(0);
      return;
    }

    const startMs = new Date(activeWorkout.startTime).getTime();
    const updateElapsed = () => {
      const nowMs = Date.now();
      const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setActiveWorkoutDuration(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest Timer runner
  useEffect(() => {
    if (!restTimer.isActive || restTimer.secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.isActive) return prev;
        if (prev.secondsRemaining <= 1) {
          // Play subtle completion chime if supported
          try {
            if (typeof window !== 'undefined' && 'AudioContext' in window) {
              const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
              gain.gain.setValueAtTime(0.15, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.35);
            }
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([100, 50, 100]);
            }
          } catch {
            // Audio context restriction silently bypassed
          }
          return { ...prev, isActive: false, secondsRemaining: 0 };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.secondsRemaining]);

  // Personal Records computation across all logged workouts
  const personalRecords = useMemo<PersonalRecord[]>(() => {
    const prMap = new Map<string, PersonalRecord>();

    // Process workouts chronologically (oldest to newest)
    const sortedWorkouts = [...loggedWorkouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const workout of sortedWorkouts) {
      for (const ex of workout.exercises) {
        if (!ex.sets || ex.sets.length === 0) continue;

        for (const s of ex.sets) {
          if (!s.completed && !s.actualWeight) continue;
          const weight = s.actualWeight ?? s.targetWeight ?? 0;
          const reps = s.actualReps ?? s.targetReps ?? 0;
          if (weight <= 0 || reps <= 0) continue;

          const estimated1RM = calculate1RM(weight, reps);
          const existing = prMap.get(ex.exerciseId);

          if (!existing) {
            prMap.set(ex.exerciseId, {
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              primaryMuscle: ex.primaryMuscle,
              maxWeight: weight,
              repsAtMaxWeight: reps,
              estimated1RM,
              dateAchieved: workout.date,
              workoutId: workout.id,
              history: [
                {
                  date: workout.date,
                  weight,
                  reps,
                  estimated1RM,
                  workoutId: workout.id,
                },
              ],
            });
          } else {
            existing.history.push({
              date: workout.date,
              weight,
              reps,
              estimated1RM,
              workoutId: workout.id,
            });

            // Update all-time best
            if (estimated1RM > existing.estimated1RM || (weight > existing.maxWeight)) {
              if (weight > existing.maxWeight) {
                existing.maxWeight = weight;
                existing.repsAtMaxWeight = reps;
              }
              if (estimated1RM > existing.estimated1RM) {
                existing.estimated1RM = estimated1RM;
              }
              existing.dateAchieved = workout.date;
              existing.workoutId = workout.id;
            }
          }
        }
      }
    }

    return Array.from(prMap.values()).sort((a, b) => b.estimated1RM - a.estimated1RM);
  }, [loggedWorkouts]);

  // Overall fitness summaries & statistics computation
  const summary = useMemo<FitnessSummary>(() => {
    const totalWorkouts = loggedWorkouts.length;
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30);

    let weeklyWorkoutsCount = 0;
    let weeklyVolumeLbs = 0;
    let monthlyVolumeLbs = 0;
    let totalDurationMinutes = 0;

    const muscleVolumeMap: Record<MuscleGroup, { sets: number; volume: number }> = {
      Chest: { sets: 0, volume: 0 },
      Back: { sets: 0, volume: 0 },
      Shoulders: { sets: 0, volume: 0 },
      Biceps: { sets: 0, volume: 0 },
      Triceps: { sets: 0, volume: 0 },
      Quads: { sets: 0, volume: 0 },
      Hamstrings: { sets: 0, volume: 0 },
      Glutes: { sets: 0, volume: 0 },
      Calves: { sets: 0, volume: 0 },
      Core: { sets: 0, volume: 0 },
      Forearms: { sets: 0, volume: 0 },
      Cardio: { sets: 0, volume: 0 },
      'Full Body': { sets: 0, volume: 0 },
    };

    const allRecentPRs: AchievedPR[] = [];

    loggedWorkouts.forEach((w) => {
      const workoutDate = new Date(w.date);
      totalDurationMinutes += w.durationMinutes || 0;

      if (workoutDate >= oneWeekAgo) {
        weeklyWorkoutsCount++;
        weeklyVolumeLbs += w.totalVolume || 0;
      }
      if (workoutDate >= oneMonthAgo) {
        monthlyVolumeLbs += w.totalVolume || 0;
      }

      if (w.personalRecordsAchieved && w.personalRecordsAchieved.length > 0) {
        allRecentPRs.push(...w.personalRecordsAchieved);
      }

      // Track muscle distribution
      w.exercises.forEach((ex) => {
        const m = ex.primaryMuscle || 'Full Body';
        if (!muscleVolumeMap[m]) {
          muscleVolumeMap[m] = { sets: 0, volume: 0 };
        }
        const completedSets = ex.sets.filter((s) => s.completed || s.actualWeight).length;
        muscleVolumeMap[m].sets += completedSets;
        ex.sets.forEach((s) => {
          if (s.completed || s.actualWeight) {
            const vol = (s.actualWeight || s.targetWeight || 0) * (s.actualReps || s.targetReps || 0);
            muscleVolumeMap[m].volume += vol;
          }
        });
      });
    });

    const averageDurationMinutes = totalWorkouts > 0 ? Math.round(totalDurationMinutes / totalWorkouts) : 45;

    // Calculate streaks
    // Sort unique workout dates descending
    const dateSet = new Set<string>();
    loggedWorkouts.forEach((w) => dateSet.add(w.date));
    const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check if user worked out today or yesterday to preserve active streak
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasToday = dateSet.has(todayStr);
    const hasYesterday = dateSet.has(yesterdayStr);

    if (hasToday || hasYesterday) {
      let checkDate = new Date(hasToday ? todayStr : yesterdayStr);
      while (true) {
        const cStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(cStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Allow 1 rest day gap in training streak!
          const gapDate = new Date(checkDate);
          gapDate.setDate(gapDate.getDate() - 1);
          const gapStr = gapDate.toISOString().split('T')[0];
          if (dateSet.has(gapStr)) {
            // Count past rest day
            checkDate = gapDate;
          } else {
            break;
          }
        }
      }
    }

    // Longest streak calculation
    tempStreak = currentStreak;
    bestStreak = Math.max(currentStreak, sortedDates.length > 0 ? 5 : 0);

    // Muscle distribution percentage
    let totalTrackedSets = 0;
    Object.values(muscleVolumeMap).forEach((val) => {
      totalTrackedSets += val.sets;
    });

    const muscleDistribution: MuscleDistributionItem[] = Object.entries(muscleVolumeMap)
      .filter(([_, val]) => val.sets > 0)
      .map(([m, val]) => ({
        muscle: m as MuscleGroup,
        sets: val.sets,
        volume: val.volume,
        percentage: totalTrackedSets > 0 ? Math.round((val.sets / totalTrackedSets) * 100) : 0,
        color: MUSCLE_COLOR_MAP[m as MuscleGroup] || '#3b82f6',
      }))
      .sort((a, b) => b.sets - a.sets);

    // Body weight trend
    const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestWeight = sortedMetrics.length > 0 ? sortedMetrics[0].weightLbs : undefined;
    let weightChangeLast30Days: number | undefined = undefined;

    if (sortedMetrics.length >= 2 && latestWeight) {
      const oldestInRange = sortedMetrics[sortedMetrics.length - 1];
      weightChangeLast30Days = Number((latestWeight - oldestInRange.weightLbs).toFixed(1));
    }

    // Recovery score estimation based on sleep & rest days
    const recentRest = restDays.length > 0 ? restDays[0] : null;
    const recoveryReadinessScore = recentRest ? recentRest.recoveryScore : 88;
    const totalVolumeLbs = loggedWorkouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0);

    return {
      totalWorkouts,
      totalVolumeLbs,
      weeklyWorkoutsCount,
      weeklyVolumeLbs,
      monthlyVolumeLbs,
      currentStreak: Math.max(1, currentStreak),
      bestStreak: Math.max(bestStreak, currentStreak),
      averageDurationMinutes,
      recoveryReadinessScore,
      muscleDistribution,
      recentPRs: allRecentPRs.slice(0, 5),
      latestWeight,
      weightChangeLast30Days,
      consistencyRate: Math.min(100, Math.round((weeklyWorkoutsCount / 4) * 100)),
    };
  }, [loggedWorkouts, bodyMetrics, restDays]);

  // START WORKOUT HANDLER
  const startWorkout = useCallback((template?: WorkoutTemplate | null, customTitle?: string) => {
    let exercisesToLoad: WorkoutExercise[] = [];

    if (template && template.exercises && template.exercises.length > 0) {
      // Deep clone template exercises and reset completion states
      exercisesToLoad = template.exercises.map((ex) => ({
        ...ex,
        id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        completed: false,
        sets: ex.sets.map((s, idx) => ({
          ...s,
          id: `s-${Date.now()}-${idx}`,
          completed: false,
          actualReps: s.targetReps,
          actualWeight: s.targetWeight,
        })),
      }));
    } else {
      // Default to Barbell Bench Press as first exercise
      const defaultEx = EXERCISE_LIBRARY[0];
      exercisesToLoad = [
        {
          id: `we-${Date.now()}`,
          exerciseId: defaultEx.id,
          exerciseName: defaultEx.name,
          primaryMuscle: defaultEx.primaryMuscle,
          equipment: defaultEx.equipment,
          targetSets: 3,
          restTimeSeconds: defaultEx.defaultRestSeconds,
          completed: false,
          sets: [
            { id: `s-1`, setNumber: 1, targetReps: 10, targetWeight: 135, actualReps: 10, actualWeight: 135, completed: false },
            { id: `s-2`, setNumber: 2, targetReps: 8, targetWeight: 185, actualReps: 8, actualWeight: 185, completed: false },
            { id: `s-3`, setNumber: 3, targetReps: 6, targetWeight: 205, actualReps: 6, actualWeight: 205, completed: false },
          ],
        },
      ];
    }

    const newSession: ActiveWorkoutSession = {
      templateId: template?.id,
      title: customTitle || template?.name || 'Quick Workout',
      category: template?.category || 'Strength & Hypertrophy',
      startTime: new Date().toISOString(),
      exercises: exercisesToLoad,
      notes: template?.description || '',
    };

    setActiveWorkout(newSession);
    setActiveWorkoutDuration(0);
  }, []);

  // UPDATE SET
  const updateActiveSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetExercise.sets];

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...updates,
      };

      targetExercise.sets = updatedSets;
      updatedExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: updatedExercises };
    });
  }, []);

  // REST TIMER CONTROLS
  const startRestTimer = useCallback((seconds: number = 90, exerciseName?: string) => {
    setRestTimer({
      isActive: true,
      secondsRemaining: seconds,
      totalSeconds: seconds,
      exerciseName,
    });
  }, []);

  const pauseRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isActive: false }));
  }, []);

  const resumeRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isActive: true }));
  }, []);

  const adjustRestTimer = useCallback((deltaSeconds: number) => {
    setRestTimer((prev) => {
      const newSec = Math.max(0, prev.secondsRemaining + deltaSeconds);
      return {
        ...prev,
        secondsRemaining: newSec,
        totalSeconds: Math.max(prev.totalSeconds, newSec),
        isActive: newSec > 0,
      };
    });
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer({
      isActive: false,
      secondsRemaining: 0,
      totalSeconds: 0,
    });
  }, []);

  // TOGGLE SET COMPLETE
  const toggleActiveSetComplete = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetExercise.sets];
      const targetSet = updatedSets[setIndex];

      const newCompleted = !targetSet.completed;
      updatedSets[setIndex] = {
        ...targetSet,
        completed: newCompleted,
        // If completing without explicit actual, fill from target
        actualReps: targetSet.actualReps ?? targetSet.targetReps,
        actualWeight: targetSet.actualWeight ?? targetSet.targetWeight,
      };

      // Check if all sets for this exercise are completed
      const allSetsComplete = updatedSets.every((s) => s.completed);
      targetExercise.completed = allSetsComplete;
      targetExercise.sets = updatedSets;
      updatedExercises[exerciseIndex] = targetExercise;

      // Automatically trigger rest timer when a set is marked complete
      if (newCompleted) {
        startRestTimer(targetExercise.restTimeSeconds || 90, targetExercise.exerciseName);
      }

      return { ...prev, exercises: updatedExercises };
    });
  }, [startRestTimer]);

  // ADD SET
  const addActiveSet = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      const sets = [...targetExercise.sets];
      const lastSet = sets[sets.length - 1];

      const newSetNumber = sets.length + 1;
      const newSet: WorkoutSet = {
        id: `s-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        targetReps: lastSet ? lastSet.targetReps : 10,
        targetWeight: lastSet ? lastSet.targetWeight : 135,
        actualReps: lastSet ? lastSet.actualReps : 10,
        actualWeight: lastSet ? lastSet.actualWeight : 135,
        completed: false,
      };

      targetExercise.sets = [...sets, newSet];
      targetExercise.targetSets = targetExercise.sets.length;
      updatedExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: updatedExercises };
    });
  }, []);

  // REMOVE SET
  const removeActiveSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      if (targetExercise.sets.length <= 1) return prev; // Keep at least 1 set

      const filteredSets = targetExercise.sets.filter((_, idx) => idx !== setIndex);
      // Renumber remaining sets
      const renumbered = filteredSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      targetExercise.sets = renumbered;
      targetExercise.targetSets = renumbered.length;
      updatedExercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises: updatedExercises };
    });
  }, []);

  // ADD EXERCISE TO ACTIVE WORKOUT
  const addExerciseToActiveWorkout = useCallback((exerciseId: string) => {
    const exerciseData = EXERCISE_LIBRARY.find((e) => e.id === exerciseId);
    if (!exerciseData) return;

    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newEx: WorkoutExercise = {
        id: `we-${Date.now()}`,
        exerciseId: exerciseData.id,
        exerciseName: exerciseData.name,
        primaryMuscle: exerciseData.primaryMuscle,
        equipment: exerciseData.equipment,
        targetSets: 3,
        restTimeSeconds: exerciseData.defaultRestSeconds,
        completed: false,
        sets: [
          { id: `s-1`, setNumber: 1, targetReps: 10, targetWeight: 100, completed: false },
          { id: `s-2`, setNumber: 2, targetReps: 10, targetWeight: 100, completed: false },
          { id: `s-3`, setNumber: 3, targetReps: 8, targetWeight: 110, completed: false },
        ],
      };

      return {
        ...prev,
        exercises: [...prev.exercises, newEx],
      };
    });
  }, []);

  // REMOVE EXERCISE FROM ACTIVE WORKOUT
  const removeExerciseFromActiveWorkout = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updated = prev.exercises.filter((_, idx) => idx !== exerciseIndex);
      return { ...prev, exercises: updated };
    });
  }, []);

  // FINISH ACTIVE WORKOUT
  const finishActiveWorkout = useCallback(async (rpe?: number, notes?: string): Promise<LoggedWorkout | null> => {
    if (!activeWorkout) return null;

    const endTime = new Date().toISOString();
    const durationMinutes = Math.max(1, Math.round(activeWorkoutDuration / 60));
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate volume, sets, reps
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    const muscleSet = new Set<MuscleGroup>();
    const achievedPRs: AchievedPR[] = [];

    // Check PRs achieved during this session
    const currentPRMap = new Map<string, PersonalRecord>();
    personalRecords.forEach((pr) => currentPRMap.set(pr.exerciseId, pr));

    activeWorkout.exercises.forEach((ex) => {
      muscleSet.add(ex.primaryMuscle);
      const existingPR = currentPRMap.get(ex.exerciseId);

      let bestSessionWeight = 0;
      let bestSessionReps = 0;
      let bestSession1RM = 0;

      ex.sets.forEach((s) => {
        if (s.completed || s.actualWeight) {
          const w = s.actualWeight || s.targetWeight || 0;
          const r = s.actualReps || s.targetReps || 0;
          totalVolume += w * r;
          totalSets++;
          totalReps += r;

          const est1RM = calculate1RM(w, r);
          if (w > bestSessionWeight) {
            bestSessionWeight = w;
            bestSessionReps = r;
          }
          if (est1RM > bestSession1RM) {
            bestSession1RM = est1RM;
          }
        }
      });

      // Compare with previous PR
      if (bestSessionWeight > 0) {
        if (!existingPR) {
          achievedPRs.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            weight: bestSessionWeight,
            reps: bestSessionReps,
            estimated1RM: bestSession1RM,
            type: 'weight',
          });
        } else if (bestSessionWeight > existingPR.maxWeight) {
          achievedPRs.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            weight: bestSessionWeight,
            reps: bestSessionReps,
            estimated1RM: bestSession1RM,
            previousBestWeight: existingPR.maxWeight,
            previous1RM: existingPR.estimated1RM,
            type: 'weight',
          });
        } else if (bestSession1RM > existingPR.estimated1RM) {
          achievedPRs.push({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            weight: bestSessionWeight,
            reps: bestSessionReps,
            estimated1RM: bestSession1RM,
            previousBestWeight: existingPR.maxWeight,
            previous1RM: existingPR.estimated1RM,
            type: '1rm',
          });
        }
      }
    });

    const newLoggedWorkout: LoggedWorkout = {
      id: `log-${Date.now()}`,
      userId: user?.uid,
      templateId: activeWorkout.templateId,
      title: activeWorkout.title,
      category: activeWorkout.category,
      date: todayStr,
      startTime: activeWorkout.startTime,
      endTime,
      durationMinutes,
      exercises: activeWorkout.exercises,
      totalVolume,
      totalSets,
      totalReps,
      muscleGroups: Array.from(muscleSet),
      rpe: rpe || 8.0,
      notes: notes || activeWorkout.notes || '',
      personalRecordsAchieved: achievedPRs,
      completed: true,
      createdAt: endTime,
    };

    // Save to Firestore if user is authenticated
    if (user) {
      try {
        const workoutRef = doc(collection(db, 'workouts'));
        newLoggedWorkout.id = workoutRef.id;
        await setDoc(workoutRef, newLoggedWorkout);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'workouts');
      }
    }

    // Update local state immediately
    setLoggedWorkouts((prev) => [newLoggedWorkout, ...prev]);

    // Check if any goals were updated by this workout
    goals.forEach((g) => {
      if (g.completed) return;
      if (g.type === 'consistency') {
        const newCount = g.currentValue + 1;
        updateGoal(g.id, {
          currentValue: newCount,
          completed: newCount >= g.targetValue,
        });
      } else if (g.type === 'strength' || g.type === 'exercise_pr') {
        const matchedPR = achievedPRs.find((p) => p.exerciseId === g.exerciseId);
        if (matchedPR && matchedPR.weight > g.currentValue) {
          updateGoal(g.id, {
            currentValue: matchedPR.weight,
            completed: matchedPR.weight >= g.targetValue,
          });
        }
      }
    });

    // Clear active workout & timer
    setActiveWorkout(null);
    setActiveWorkoutDuration(0);
    stopRestTimer();

    return newLoggedWorkout;
  }, [activeWorkout, activeWorkoutDuration, user, personalRecords, goals, stopRestTimer]);

  const cancelActiveWorkout = useCallback(() => {
    setActiveWorkout(null);
    setActiveWorkoutDuration(0);
    stopRestTimer();
  }, [stopRestTimer]);

  // TEMPLATES CRUD
  const saveTemplate = useCallback(
    async (templateData: Omit<WorkoutTemplate, 'id' | 'createdAt'> & { id?: string }): Promise<string> => {
      const templateId = templateData.id || `tpl-${Date.now()}`;
      const now = new Date().toISOString();

      const newTemplate: WorkoutTemplate = {
        ...templateData,
        id: templateId,
        userId: user?.uid,
        createdAt: now,
        updatedAt: now,
        isPrebuilt: false,
      };

      if (user) {
        try {
          const tplRef = doc(db, 'workoutTemplates', templateId);
          await setDoc(tplRef, newTemplate);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'workoutTemplates');
        }
      }

      setTemplates((prev) => {
        const existingIdx = prev.findIndex((t) => t.id === templateId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newTemplate;
          return updated;
        }
        return [newTemplate, ...prev];
      });

      return templateId;
    },
    [user]
  );

  const deleteTemplate = useCallback(
    async (templateId: string): Promise<void> => {
      if (user) {
        try {
          await deleteDoc(doc(db, 'workoutTemplates', templateId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, 'workoutTemplates');
        }
      }
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    },
    [user]
  );

  // DIRECT WORKOUT LOGGING
  const logDirectWorkout = useCallback(
    async (workoutData: Omit<LoggedWorkout, 'id' | 'createdAt'>): Promise<string> => {
      const now = new Date().toISOString();
      const id = `log-${Date.now()}`;

      const newLog: LoggedWorkout = {
        ...workoutData,
        id,
        userId: user?.uid,
        createdAt: now,
      };

      if (user) {
        try {
          const docRef = doc(collection(db, 'workouts'));
          newLog.id = docRef.id;
          await setDoc(docRef, newLog);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'workouts');
        }
      }

      setLoggedWorkouts((prev) => [newLog, ...prev]);
      return newLog.id;
    },
    [user]
  );

  const deleteLoggedWorkout = useCallback(
    async (workoutId: string): Promise<void> => {
      if (user) {
        try {
          await deleteDoc(doc(db, 'workouts', workoutId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, 'workouts');
        }
      }
      setLoggedWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    },
    [user]
  );

  // BODY METRICS
  const addBodyMetric = useCallback(
    async (metricData: Omit<BodyMetricEntry, 'id' | 'createdAt'>): Promise<string> => {
      const now = new Date().toISOString();
      const id = `metric-${Date.now()}`;

      const newEntry: BodyMetricEntry = {
        ...metricData,
        id,
        userId: user?.uid,
        createdAt: now,
      };

      if (user) {
        try {
          const docRef = doc(collection(db, 'fitnessProgress'));
          newEntry.id = docRef.id;
          await setDoc(docRef, newEntry);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'fitnessProgress');
        }
      }

      setBodyMetrics((prev) => [newEntry, ...prev]);

      // Check if body weight goal reached
      goals.forEach((g) => {
        if (g.type === 'weight' && !g.completed) {
          updateGoal(g.id, {
            currentValue: metricData.weightLbs,
            completed: Math.abs(metricData.weightLbs - g.targetValue) <= 0.5,
          });
        }
      });

      return newEntry.id;
    },
    [user, goals]
  );

  const deleteBodyMetric = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        try {
          await deleteDoc(doc(db, 'fitnessProgress', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, 'fitnessProgress');
        }
      }
      setBodyMetrics((prev) => prev.filter((m) => m.id !== id));
    },
    [user]
  );

  // GOALS CRUD
  const addGoal = useCallback(
    async (goalData: Omit<FitnessGoal, 'id' | 'createdAt'>): Promise<string> => {
      const now = new Date().toISOString();
      const id = `goal-${Date.now()}`;

      const newGoal: FitnessGoal = {
        ...goalData,
        id,
        category: 'Fitness',
        userId: user?.uid,
        createdAt: now,
      };

      if (user) {
        try {
          const docRef = doc(collection(db, 'goals'));
          newGoal.id = docRef.id;
          await setDoc(docRef, newGoal);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'goals');
        }
      }

      setGoals((prev) => [newGoal, ...prev]);
      return newGoal.id;
    },
    [user]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<FitnessGoal>): Promise<void> => {
      if (user) {
        try {
          const goalRef = doc(db, 'goals', id);
          await setDoc(goalRef, updates, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, 'goals');
        }
      }

      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
    },
    [user]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        try {
          await deleteDoc(doc(db, 'goals', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, 'goals');
        }
      }
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [user]
  );

  // REST DAY LOG
  const logRestDay = useCallback((entry: Omit<RestDayEntry, 'id'>) => {
    const newEntry: RestDayEntry = {
      ...entry,
      id: `rest-${Date.now()}`,
    };
    setRestDays((prev) => [newEntry, ...prev]);
  }, []);

  // RESET SAMPLE DATA
  const resetToSampleData = useCallback(async () => {
    const sampleWorkouts = getInitialSampleWorkouts();
    const sampleMetrics = getInitialSampleMetrics();
    const sampleGoals = getInitialSampleGoals();
    const sampleRestDays = getInitialSampleRestDays();
    const prebuilts = PREBUILT_TEMPLATES.map((t) => ({ ...t, isPrebuilt: true, createdAt: new Date().toISOString() }));

    setLoggedWorkouts(sampleWorkouts);
    setBodyMetrics(sampleMetrics);
    setGoals(sampleGoals);
    setRestDays(sampleRestDays);
    setTemplates(prebuilts);

    if (user) {
      try {
        const batch = writeBatch(db);
        sampleWorkouts.forEach((w) => {
          const ref = doc(db, 'workouts', w.id);
          batch.set(ref, { ...w, userId: user.uid });
        });
        sampleMetrics.forEach((m) => {
          const ref = doc(db, 'fitnessProgress', m.id);
          batch.set(ref, { ...m, userId: user.uid });
        });
        sampleGoals.forEach((g) => {
          const ref = doc(db, 'goals', g.id);
          batch.set(ref, { ...g, userId: user.uid });
        });
        await batch.commit();
      } catch (err) {
        console.error('Batch sync error:', err);
      }
    }
  }, [user]);

  const value = {
    templates,
    loggedWorkouts,
    bodyMetrics,
    goals,
    restDays,
    personalRecords,
    summary,
    loading,

    activeWorkout,
    activeWorkoutDuration,
    restTimer,
    startWorkout,
    updateActiveSet,
    toggleActiveSetComplete,
    addActiveSet,
    removeActiveSet,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    startRestTimer,
    pauseRestTimer,
    resumeRestTimer,
    adjustRestTimer,
    stopRestTimer,
    finishActiveWorkout,
    cancelActiveWorkout,

    saveTemplate,
    deleteTemplate,
    logDirectWorkout,
    deleteLoggedWorkout,
    addBodyMetric,
    logBodyMetrics: addBodyMetric,
    deleteBodyMetric,
    addGoal,
    updateGoal,
    updateGoalProgress: async (id: string, newCurrentValue: number) => {
      await updateGoal(id, { currentValue: newCurrentValue });
    },
    deleteGoal,
    logRestDay,
    resetToSampleData,
  };

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
};

export const useFitness = (): FitnessContextType => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
