/**
 * Peak Day — Design System Tokens & Motion Physics
 * Apple-inspired futuristic, dark-first, clean, elegant design system.
 */

import { NavItemConfig } from '../types';

export const MOTION_SPRINGS = {
  // Snappy, Apple iOS-like micro-springs for buttons & clicks
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  // Smooth, gentle transitions for cards, modals, and drawers
  gentle: {
    type: 'spring' as const,
    stiffness: 220,
    damping: 24,
  },
  // Fluid page & view transitions
  fluid: {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
  // Instant for reduced-motion users
  reduced: {
    duration: 0.01,
  },
};

export const COLOR_SYSTEM = {
  background: {
    base: '#07090E',
    elevated: '#0E121D',
    surface: '#141A29',
    overlay: 'rgba(7, 9, 14, 0.75)',
  },
  glass: {
    subtle: 'rgba(255, 255, 255, 0.03)',
    regular: 'rgba(22, 28, 44, 0.65)',
    elevated: 'rgba(27, 34, 54, 0.85)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.16)',
  },
  accent: {
    azure: {
      primary: '#0A84FF',
      subtle: 'rgba(10, 132, 255, 0.15)',
      gradient: 'from-[#0A84FF] to-[#5E5CE6]',
      border: 'rgba(10, 132, 255, 0.3)',
    },
    emerald: {
      primary: '#30D158',
      subtle: 'rgba(48, 209, 88, 0.15)',
      gradient: 'from-[#30D158] to-[#0A84FF]',
      border: 'rgba(48, 209, 88, 0.3)',
    },
    amethyst: {
      primary: '#BF5AF2',
      subtle: 'rgba(191, 90, 242, 0.15)',
      gradient: 'from-[#BF5AF2] to-[#5E5CE6]',
      border: 'rgba(191, 90, 242, 0.3)',
    },
    amber: {
      primary: '#FF9F0A',
      subtle: 'rgba(255, 159, 10, 0.15)',
      gradient: 'from-[#FF9F0A] to-[#FF453A]',
      border: 'rgba(255, 159, 10, 0.3)',
    },
    rose: {
      primary: '#FF453A',
      subtle: 'rgba(255, 69, 58, 0.15)',
      gradient: 'from-[#FF453A] to-[#BF5AF2]',
      border: 'rgba(255, 69, 58, 0.3)',
    },
  },
};

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'core',
    description: 'Unified command center with high-level vitals, daily agenda, and productivity telemetry.',
  },
  {
    id: 'tasks',
    label: 'Daily Tasks',
    category: 'core',
    badge: 5,
    badgeColor: 'blue',
    description: 'Focus-engineered task execution with prioritization, Eisenhower sorting, and micro-habits.',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    category: 'core',
    description: 'Dynamic unified calendar bridging lectures, study blocks, workouts, and rest periods.',
  },
  {
    id: 'academics',
    label: 'Academics',
    category: 'personal',
    badge: '3 Courses',
    badgeColor: 'purple',
    description: 'Semester hub for courses, syllabus milestones, exam countdowns, and GPA target tracking.',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    category: 'personal',
    badge: 'Active',
    badgeColor: 'emerald',
    description: 'Athletic progress tracking, training splits, daily energy expenditure, and hydration goals.',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    category: 'personal',
    badge: 'PeakIQ',
    badgeColor: 'blue',
    description: 'Context-aware intelligence for schedule optimization, study guidance, and recovery advice.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    category: 'system',
    badge: 2,
    badgeColor: 'amber',
    description: 'Real-time proactive reminders for upcoming lectures, workout windows, and task deadlines.',
  },
  {
    id: 'profile',
    label: 'Profile',
    category: 'system',
    description: 'Personal athlete-student biometric identity, badges, streak records, and level progress.',
  },
  {
    id: 'settings',
    label: 'Settings',
    category: 'system',
    description: 'Display options, glass intensity, haptic/motion preferences, and cloud sync status.',
  },
];
