/**
 * Peak Day — Core Type Definitions & Architectural Data Models
 * Prepared for Firebase Auth, Firestore, and Gemini AI integration in upcoming stages.
 */

export type SectionId =
  | 'dashboard'
  | 'tasks'
  | 'schedule'
  | 'academics'
  | 'fitness'
  | 'ai-assistant'
  | 'notifications'
  | 'profile'
  | 'settings';

export interface NavItemConfig {
  id: SectionId;
  label: string;
  badge?: string | number;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  category: 'core' | 'personal' | 'system';
  description: string;
}

/** User Profile Model (Architecture ready for Firebase Auth & Firestore) */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'student' | 'fitness_athlete' | 'hybrid';
  academicInstitution?: string;
  fitnessGoal?: string;
  streakDays: number;
  level: number;
  xp: number;
  createdAt?: string;
}

/** Daily Task Model */
export interface TaskItem {
  id: string;
  title: string;
  category: 'academic' | 'fitness' | 'personal' | 'habit';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  dueDate?: string;
  estimatedMinutes?: number;
}

/** Schedule Event Model */
export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'workout' | 'study_session' | 'meeting' | 'rest';
  location?: string;
}

/** Academic Course Model */
export interface AcademicCourse {
  id: string;
  code: string;
  name: string;
  currentGrade?: string;
  targetGrade?: string;
  instructor?: string;
  attendanceRate?: number;
}

/** Fitness Metrics Model */
export interface FitnessMetric {
  date: string;
  caloriesBurned: number;
  workoutDurationMinutes: number;
  steps: number;
  waterMl: number;
  sleepHours: number;
}

/** System Notification Model */
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'academic' | 'fitness' | 'ai' | 'system';
  read: boolean;
}

/** App Settings Model */
export interface AppSettings {
  theme: 'dark';
  accentColor: 'azure' | 'emerald' | 'amethyst' | 'solar';
  reducedMotion: boolean;
  soundEffects: boolean;
  glassIntensity: 'subtle' | 'medium' | 'high';
  studentFocusMode: boolean;
}
