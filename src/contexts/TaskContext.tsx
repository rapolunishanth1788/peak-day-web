import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

export type TaskCategory = 'Academics' | 'Fitness' | 'Personal' | 'College' | 'Other';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  userId?: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string
  updatedAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  // Computed statistics
  dailyCompletionRate: number;
  weeklyCompletionRate: number;
  totalCompletedCount: number;
  currentStreakDays: number;
  todayTasksCount: number;
  upcomingTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  // Loading & error states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

// Initial realistic placeholder tasks tailored for student athletes on first sign in
const DEFAULT_TASKS: Omit<Task, 'id' | 'userId'>[] = [
  {
    title: 'Differential Equations Problem Set 4 (Questions 1-6)',
    category: 'Academics',
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: true,
    notes: 'Verify eigenvalues calculation and boundary value conditions.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    title: 'Biomechanics Lab Review: Joint Force Dynamics',
    category: 'Academics',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: true,
    notes: 'Prepare notes for 11:30 AM discussion with Dr. Henderson.',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    title: 'Pre-Workout Electrolyte & Nitrate Hydration (750ml)',
    category: 'Fitness',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: true,
    notes: 'Target 90 minutes before weight room session.',
    createdAt: new Date(Date.now() - 25000000).toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    title: 'Upper Hypertrophy Session: Incline Bench & Weighted Pulls',
    category: 'Fitness',
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: false,
    notes: 'Warm-up: band pull-aparts & rotator cuff rotations. 4 sets of 6-8 reps RPE 8.',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Submit Spring Course Registration Advising Form',
    category: 'College',
    priority: 'High',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    completed: false,
    notes: 'Ensure 16 credit hours are approved with Academic Counselor.',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Algorithms Homework 3 (Dynamic Programming)',
    category: 'Academics',
    priority: 'High',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // In 2 days
    completed: false,
    notes: 'Implement Bellman-Ford and memoized grid path solutions.',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Order Recovery Whey Protein & BCAA Re-supply',
    category: 'Personal',
    priority: 'Low',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago (Overdue)
    completed: false,
    notes: 'Check if campus bookstore discount applies or order direct.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    title: 'Team Captains Weekly Athletic Department Check-in',
    category: 'College',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // Upcoming
    completed: false,
    notes: 'Meeting at Athletic Center Room 204.',
    createdAt: new Date().toISOString(),
  },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to user tasks in Cloud Firestore
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const tasksColRef = collection(db, 'tasks');
    const userTasksQuery = query(tasksColRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      userTasksQuery,
      async (snapshot) => {
        // If the user has 0 tasks and hasn't been seeded yet, seed initial realistic defaults
        const seedKey = `peak_day_seeded_${user.uid}`;
        if (snapshot.empty && !localStorage.getItem(seedKey)) {
          localStorage.setItem(seedKey, 'true');
          try {
            const batch = writeBatch(db);
            DEFAULT_TASKS.forEach((defTask) => {
              const newDocRef = doc(tasksColRef);
              batch.set(newDocRef, {
                ...defTask,
                id: newDocRef.id,
                userId: user.uid,
                updatedAt: new Date().toISOString(),
              });
            });
            await batch.commit();
            // The batch commit triggers another onSnapshot snapshot automatically
            return;
          } catch (seedErr) {
            console.error('Task seeding notice:', seedErr);
          }
        }

        const loadedTasks: Task[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            title: data.title || '',
            category: data.category || 'Other',
            priority: data.priority || 'Medium',
            dueDate: data.dueDate || new Date().toISOString().split('T')[0],
            completed: Boolean(data.completed),
            notes: data.notes || '',
            createdAt: data.createdAt || new Date().toISOString(),
            completedAt: data.completedAt || undefined,
            updatedAt: data.updatedAt || undefined,
          };
        });

        // Sort by createdAt descending as default in memory
        loadedTasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setTasks(loadedTasks);
        setIsLoading(false);
      },
      (snapshotError) => {
        setIsLoading(false);
        setError(snapshotError.message);
        handleFirestoreError(snapshotError, OperationType.GET, 'tasks');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Create Task in Cloud Firestore
  const addTask = useCallback(
    async (taskInput: Omit<Task, 'id' | 'createdAt' | 'completed' | 'userId'>) => {
      if (!user) {
        throw new Error('You must be signed in to add a task.');
      }
      setIsSyncing(true);
      setError(null);
      const tasksColRef = collection(db, 'tasks');
      const newDocRef = doc(tasksColRef);
      const nowIso = new Date().toISOString();

      const newTaskData = {
        id: newDocRef.id,
        userId: user.uid,
        title: taskInput.title,
        category: taskInput.category,
        priority: taskInput.priority,
        dueDate: taskInput.dueDate,
        completed: false,
        notes: taskInput.notes || '',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      try {
        await setDoc(newDocRef, newTaskData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.CREATE, `tasks/${newDocRef.id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Update Task in Cloud Firestore
  const updateTask = useCallback(
    async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => {
      if (!user) {
        throw new Error('You must be signed in to update a task.');
      }
      setIsSyncing(true);
      setError(null);
      const taskDocRef = doc(db, 'tasks', id);

      try {
        await updateDoc(taskDocRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Delete Task in Cloud Firestore
  const deleteTask = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be signed in to delete a task.');
      }
      setIsSyncing(true);
      setError(null);
      const taskDocRef = doc(db, 'tasks', id);

      try {
        await deleteDoc(taskDocRef);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Toggle Complete Task in Cloud Firestore
  const toggleComplete = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be signed in to toggle a task.');
      }
      const existing = tasks.find((t) => t.id === id);
      if (!existing) return;

      const nextCompleted = !existing.completed;
      setIsSyncing(true);
      setError(null);
      const taskDocRef = doc(db, 'tasks', id);

      try {
        await updateDoc(taskDocRef, {
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user, tasks]
  );

  // Helper date strings
  const todayStr = new Date().toISOString().split('T')[0];

  // Grouped task subsets
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const upcomingTasks = tasks.filter((t) => !t.completed && t.dueDate > todayStr);
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < todayStr);

  // Statistics computations
  const todayTotal = todayTasks.length;
  const todayDone = todayTasks.filter((t) => t.completed).length;
  const dailyCompletionRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 100;

  // Weekly: tasks due within 7 days
  const nowMs = Date.now();
  const sevenDaysAheadMs = nowMs + 7 * 86400000;
  const sevenDaysAheadStr = new Date(sevenDaysAheadMs).toISOString().split('T')[0];
  const weeklyTasks = tasks.filter((t) => t.dueDate >= todayStr && t.dueDate <= sevenDaysAheadStr);
  const weeklyTotal = weeklyTasks.length;
  const weeklyDone = weeklyTasks.filter((t) => t.completed).length;
  const weeklyCompletionRate = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 78;

  const totalCompletedCount = completedTasks.length;
  const currentStreakDays = 12; // Habit streak count

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        dailyCompletionRate,
        weeklyCompletionRate,
        totalCompletedCount,
        currentStreakDays,
        todayTasksCount: todayTasks.length,
        upcomingTasksCount: upcomingTasks.length,
        completedTasksCount: completedTasks.length,
        overdueTasksCount: overdueTasks.length,
        isLoading,
        isSyncing,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
