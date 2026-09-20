export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Forearms'
  | 'Cardio'
  | 'Full Body';

export type EquipmentType =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Smith Machine'
  | 'Cardio Machine';

export type ExerciseCategory =
  | 'Strength'
  | 'Hypertrophy'
  | 'Endurance'
  | 'Powerlifting'
  | 'Olympic'
  | 'Mobility'
  | 'Cardio';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  defaultRestSeconds: number;
  instructions: string[];
  tips: string[];
  iconAccent: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps: number;
  targetWeight: number; // lbs
  actualReps?: number;
  actualWeight?: number;
  completed: boolean;
  rpe?: number; // 1-10
  isWarmup?: boolean;
  isDropSet?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  equipment: EquipmentType;
  targetSets: number;
  sets: WorkoutSet[];
  restTimeSeconds: number;
  notes?: string;
  completed?: boolean;
}

export interface WorkoutTemplate {
  id: string;
  userId?: string;
  name: string;
  category: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimatedDurationMinutes: number;
  targetMuscleGroups: MuscleGroup[];
  isPrebuilt?: boolean;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AchievedPR {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  previousBestWeight?: number;
  previous1RM?: number;
  type: 'weight' | '1rm' | 'reps';
}

export interface LoggedWorkout {
  id: string;
  userId?: string;
  templateId?: string;
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  exercises: WorkoutExercise[];
  totalVolume: number; // sum of (actualReps * actualWeight)
  totalSets: number;
  totalReps: number;
  muscleGroups: MuscleGroup[];
  rpe?: number; // 1-10
  notes?: string;
  personalRecordsAchieved?: AchievedPR[];
  completed: boolean;
  createdAt: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  maxWeight: number;
  repsAtMaxWeight: number;
  estimated1RM: number;
  dateAchieved: string;
  workoutId?: string;
  history: Array<{
    date: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    workoutId?: string;
  }>;
}

export interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  angle?: 'front' | 'side' | 'back' | string;
  note?: string;
}

export interface BodyMetricEntry {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  weightLbs: number;
  bodyFatPercentage?: number;
  chestInches?: number;
  waistInches?: number;
  hipsInches?: number;
  bicepsInches?: number;
  thighsInches?: number;
  calvesInches?: number;
  shouldersInches?: number;
  neckInches?: number;
  notes?: string;
  photoUrl?: string;
  photos?: ProgressPhoto[];
  measurements?: {
    chestInches?: number;
    waistInches?: number;
    hipsInches?: number;
    bicepsInches?: number;
    thighsInches?: number;
    calvesInches?: number;
    shouldersInches?: number;
    neckInches?: number;
  };
  createdAt: string;
}

export type BodyMetricsEntry = BodyMetricEntry;
export type GoalCategory = FitnessGoalType;

export type FitnessGoalType =
  | 'strength'
  | 'weight'
  | 'muscle_gain'
  | 'consistency'
  | 'exercise_pr'
  | 'personal_record';

export interface FitnessGoal {
  id: string;
  userId?: string;
  title: string;
  type: FitnessGoalType;
  category: 'Fitness';
  targetValue: number;
  currentValue: number;
  startValue?: number;
  unit: string;
  exerciseId?: string;
  exerciseName?: string;
  deadline: string; // YYYY-MM-DD
  targetDate?: string;
  status?: 'active' | 'completed' | 'behind';
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface RestDayEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'full_rest' | 'active_recovery' | 'mobility_stretching' | 'cardio_recovery';
  recoveryScore: number; // 1-100
  notes: string;
  sleepHours?: number;
  sorenessLevel?: number; // 1-10
}

export interface MuscleDistributionItem {
  muscle: MuscleGroup;
  sets: number;
  volume: number;
  percentage: number;
  color: string;
}

export interface FitnessSummary {
  totalWorkouts: number;
  totalVolumeLbs?: number;
  weeklyWorkoutsCount: number;
  weeklyVolumeLbs: number;
  monthlyVolumeLbs: number;
  currentStreak: number;
  bestStreak: number;
  averageDurationMinutes: number;
  recoveryReadinessScore: number;
  muscleDistribution: MuscleDistributionItem[];
  recentPRs: AchievedPR[];
  latestWeight?: number;
  weightChangeLast30Days?: number;
  consistencyRate: number; // e.g. 85%
}
