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

export type ScheduleItemType = 'Class' | 'Exam' | 'Assignment' | 'Event' | 'Reminder';
export type ScheduleCategory = 'Academic' | 'Fitness' | 'Personal' | 'Other';

export interface ScheduleEvent {
  id: string;
  userId?: string;
  title: string;
  type: ScheduleItemType;
  category: ScheduleCategory;
  courseCode?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm or HH:mm AM/PM (standardized internally to HH:mm for comparisons)
  endTime: string; // HH:mm or HH:mm AM/PM
  daysOfWeek?: number[]; // [0..6] where 0=Sunday, 1=Monday ... for recurring items
  instructor?: string;
  notes?: string;
  color?: string; // hex or color identifier
  completed?: boolean; // for reminders or assignment submissions
  createdAt: string;
  updatedAt?: string;
}

interface ScheduleContextType {
  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Omit<ScheduleEvent, 'id' | 'createdAt' | 'userId'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  moveEvent: (id: string, newDate: string, newStartTime?: string, newEndTime?: string) => Promise<void>;
  toggleEventCompleted: (id: string) => Promise<void>;
  // Dynamic Real-time Calculations
  currentActiveEvent: ScheduleEvent | null;
  nextUpcomingClass: {
    event: ScheduleEvent | null;
    minutesUntil: number;
    secondsUntil: number;
    startsInFormatted: string;
  } | null;
  todayEvents: ScheduleEvent[];
  // Loading & State
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Helper to convert 12h or 24h time string like "11:30 AM" or "14:00" to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const numbersOnly = clean.replace(/[^0-9:]/g, '');
  const [hoursStr, minutesStr] = numbersOnly.split(':');
  let h = parseInt(hoursStr || '0', 10);
  const m = parseInt(minutesStr || '0', 10);

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
}

// Helper: standard 2-digit format YYYY-MM-DD for local date
export function getLocalDateString(dateObj = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Default realistic timetable data for initial student-athlete seeding
const DEFAULT_SCHEDULE_ITEMS: Omit<ScheduleEvent, 'id' | 'userId'>[] = [
  {
    title: 'Advanced Dynamic Programming & Graph Theory',
    type: 'Class',
    category: 'Academic',
    courseCode: 'CS 329D',
    location: 'Gates Computer Science 104',
    date: getLocalDateString(),
    startTime: '10:00 AM',
    endTime: '11:15 AM',
    daysOfWeek: [1, 3, 5],
    instructor: 'Prof. J. Henderson',
    notes: 'Lecture covering memoization structures, Dijkstra and topological sort algorithms.',
    color: '#3B82F6', // Blue
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Biomechanics & Joint Kinetics Lab',
    type: 'Class',
    category: 'Academic',
    courseCode: 'KIN 210',
    location: 'Packard Science Hall B2',
    date: getLocalDateString(),
    startTime: '11:30 AM',
    endTime: '12:45 PM',
    daysOfWeek: [2, 4],
    instructor: 'Dr. Sarah Lin',
    notes: 'Practical force-plate dynamics and muscle torque calculations.',
    color: '#8B5CF6', // Purple
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Pre-Workout Recovery Hydration & Fueling',
    type: 'Reminder',
    category: 'Fitness',
    location: 'Athletic Nutrition Hub',
    date: getLocalDateString(),
    startTime: '04:00 PM',
    endTime: '04:30 PM',
    notes: '750ml electrolyte fluid with 40g complex carbohydrates.',
    color: '#10B981', // Emerald
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Upper Body Hypertrophy & Power Split',
    type: 'Event',
    category: 'Fitness',
    courseCode: 'VARSITY',
    location: 'Arrillaga Varsity Weight Room',
    date: getLocalDateString(),
    startTime: '05:30 PM',
    endTime: '06:45 PM',
    daysOfWeek: [1, 3, 5],
    instructor: 'Coach Reynolds',
    notes: 'Heavy compound incline presses, weighted chins, face-pulls.',
    color: '#F59E0B', // Amber
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Sports Physiology Midterm Exam',
    type: 'Exam',
    category: 'Academic',
    courseCode: 'KIN 210',
    location: 'Bishop Auditorium',
    date: getLocalDateString(new Date(Date.now() + 86400000 * 2)), // 2 days ahead
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    instructor: 'Dr. Sarah Lin',
    notes: 'Comprehensive exam on cardiovascular threshold, VO2 max, and lactate shuttle.',
    color: '#EF4444', // Rose
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Algorithms Problem Set 3 Submission',
    type: 'Assignment',
    category: 'Academic',
    courseCode: 'CS 329D',
    location: 'Gradescope Portal',
    date: getLocalDateString(new Date(Date.now() + 86400000)), // Tomorrow
    startTime: '11:59 PM',
    endTime: '11:59 PM',
    notes: 'Submit PDF write-up and verified Python test scripts.',
    color: '#EC4899', // Pink
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Academic Counselor Graduation Review',
    type: 'Event',
    category: 'Academic',
    location: 'Tressider Union 312',
    date: getLocalDateString(new Date(Date.now() + 86400000 * 3)),
    startTime: '02:00 PM',
    endTime: '02:45 PM',
    instructor: 'Dean Alvarez',
    notes: 'Confirming double-major requirements and varsity competition exemption forms.',
    color: '#6366F1', // Indigo
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // High-frequency clock tick to keep current/next class calculations razor-sharp
  const [nowDate, setNowDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000); // 1-second accuracy for countdowns
    return () => clearInterval(timer);
  }, []);

  // Subscribe to user schedule items in Cloud Firestore
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const scheduleColRef = collection(db, 'schedule');
    const userScheduleQuery = query(scheduleColRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      userScheduleQuery,
      async (snapshot) => {
        // Seed default schedule on first load if collection is empty
        const seedKey = `peak_day_schedule_seeded_${user.uid}`;
        if (snapshot.empty && !localStorage.getItem(seedKey)) {
          localStorage.setItem(seedKey, 'true');
          try {
            const batch = writeBatch(db);
            DEFAULT_SCHEDULE_ITEMS.forEach((defItem) => {
              const newDocRef = doc(scheduleColRef);
              batch.set(newDocRef, {
                ...defItem,
                id: newDocRef.id,
                userId: user.uid,
                updatedAt: new Date().toISOString(),
              });
            });
            await batch.commit();
            return;
          } catch (seedErr) {
            console.error('Schedule seeding notice:', seedErr);
          }
        }

        const loadedEvents: ScheduleEvent[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            title: data.title || 'Untitled Event',
            type: (data.type as ScheduleItemType) || 'Class',
            category: (data.category as ScheduleCategory) || 'Academic',
            courseCode: data.courseCode || '',
            location: data.location || '',
            date: data.date || getLocalDateString(),
            startTime: data.startTime || '09:00 AM',
            endTime: data.endTime || '10:00 AM',
            daysOfWeek: data.daysOfWeek || undefined,
            instructor: data.instructor || '',
            notes: data.notes || '',
            color: data.color || '#3B82F6',
            completed: Boolean(data.completed),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || undefined,
          };
        });

        // Sort by date then start time
        loadedEvents.sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime);
        });

        setEvents(loadedEvents);
        setIsLoading(false);
      },
      (snapshotError) => {
        setIsLoading(false);
        setError(snapshotError.message);
        handleFirestoreError(snapshotError, OperationType.GET, 'schedule');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Create Schedule Event in Cloud Firestore
  const addEvent = useCallback(
    async (eventInput: Omit<ScheduleEvent, 'id' | 'createdAt' | 'userId'>) => {
      if (!user) {
        throw new Error('You must be signed in to add an event.');
      }
      setIsSyncing(true);
      setError(null);
      const scheduleColRef = collection(db, 'schedule');
      const newDocRef = doc(scheduleColRef);
      const nowIso = new Date().toISOString();

      const newEventData = {
        id: newDocRef.id,
        userId: user.uid,
        title: eventInput.title.trim(),
        type: eventInput.type,
        category: eventInput.category,
        courseCode: eventInput.courseCode || '',
        location: eventInput.location || '',
        date: eventInput.date,
        startTime: eventInput.startTime,
        endTime: eventInput.endTime,
        daysOfWeek: eventInput.daysOfWeek || [],
        instructor: eventInput.instructor || '',
        notes: eventInput.notes || '',
        color: eventInput.color || '#3B82F6',
        completed: Boolean(eventInput.completed),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      try {
        await setDoc(newDocRef, newEventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.CREATE, `schedule/${newDocRef.id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Update Schedule Event in Cloud Firestore
  const updateEvent = useCallback(
    async (id: string, updates: Partial<Omit<ScheduleEvent, 'id' | 'createdAt' | 'userId'>>) => {
      if (!user) {
        throw new Error('You must be signed in to update an event.');
      }
      setIsSyncing(true);
      setError(null);
      const eventDocRef = doc(db, 'schedule', id);

      try {
        await updateDoc(eventDocRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.UPDATE, `schedule/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Delete Schedule Event in Cloud Firestore
  const deleteTask = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be signed in to delete an event.');
      }
      setIsSyncing(true);
      setError(null);
      const eventDocRef = doc(db, 'schedule', id);

      try {
        await deleteDoc(eventDocRef);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        handleFirestoreError(err, OperationType.DELETE, `schedule/${id}`);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  // Move or Reschedule Event
  const moveEvent = useCallback(
    async (id: string, newDate: string, newStartTime?: string, newEndTime?: string) => {
      const updates: Record<string, unknown> = { date: newDate };
      if (newStartTime) updates.startTime = newStartTime;
      if (newEndTime) updates.endTime = newEndTime;
      await updateEvent(id, updates);
    },
    [updateEvent]
  );

  // Toggle Completed (for Assignments or Reminders)
  const toggleEventCompleted = useCallback(
    async (id: string) => {
      const target = events.find((e) => e.id === id);
      if (!target) return;
      await updateEvent(id, { completed: !target.completed });
    },
    [events, updateEvent]
  );

  // Date and Time Calculations
  const todayStr = getLocalDateString(nowDate);
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
  const nowSeconds = nowDate.getSeconds();

  // Filter events active for today (matches exact date OR is recurring on today's day of week)
  const dayOfWeek = nowDate.getDay(); // 0=Sun, 1=Mon...
  const todayEvents = events.filter((ev) => {
    if (ev.date === todayStr) return true;
    if (ev.daysOfWeek && ev.daysOfWeek.includes(dayOfWeek)) return true;
    return false;
  });

  // Sort today's events chronologically
  todayEvents.sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  // Determine currently active class or event
  const currentActiveEvent: ScheduleEvent | null =
    todayEvents.find((ev) => {
      const startMin = timeStringToMinutes(ev.startTime);
      const endMin = timeStringToMinutes(ev.endTime);
      return nowMinutes >= startMin && nowMinutes < endMin;
    }) || null;

  // Next upcoming class (specifically Class or Exam or Event)
  const upcomingTodayClasses = todayEvents.filter((ev) => {
    const startMin = timeStringToMinutes(ev.startTime);
    return startMin > nowMinutes;
  });

  let nextUpcomingClass: {
    event: ScheduleEvent | null;
    minutesUntil: number;
    secondsUntil: number;
    startsInFormatted: string;
  } | null = null;

  if (upcomingTodayClasses.length > 0) {
    const nextClass = upcomingTodayClasses[0];
    const startMin = timeStringToMinutes(nextClass.startTime);
    const diffTotalSeconds = Math.max(0, (startMin - nowMinutes) * 60 - nowSeconds);
    const minutesUntil = Math.floor(diffTotalSeconds / 60);
    const secondsRemaining = diffTotalSeconds % 60;

    let startsInFormatted = '';
    if (minutesUntil <= 0) {
      startsInFormatted = `${secondsRemaining}s`;
    } else if (minutesUntil < 60) {
      startsInFormatted = `${minutesUntil}m ${secondsRemaining}s`;
    } else {
      const hrs = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      startsInFormatted = `${hrs}h ${mins}m`;
    }

    nextUpcomingClass = {
      event: nextClass,
      minutesUntil,
      secondsUntil: diffTotalSeconds,
      startsInFormatted,
    };
  } else {
    // If no more classes today, look ahead to upcoming days for the nearest class
    const futureClasses = events
      .filter((ev) => ev.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (futureClasses.length > 0) {
      const nextClass = futureClasses[0];
      nextUpcomingClass = {
        event: nextClass,
        minutesUntil: 9999,
        secondsUntil: 99999,
        startsInFormatted: `On ${nextClass.date}`,
      };
    }
  }

  return (
    <ScheduleContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent: deleteTask,
        moveEvent,
        toggleEventCompleted,
        currentActiveEvent,
        nextUpcomingClass,
        todayEvents,
        isLoading,
        isSyncing,
        error,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
